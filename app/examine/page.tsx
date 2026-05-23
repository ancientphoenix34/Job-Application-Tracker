"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Loader2, Upload, Sparkles, FileText,
    Link as LinkIcon, Quote,
} from "lucide-react";

const AI_BASE = "/api/ai";

interface SkillMatch {
    matched: string[];
    missing: string[];
    bonus: string[];
}

interface SectionFeedback {
    section: string;
    score: number;
    feedback: string;
    suggestions: string[];
}

interface ATSResult {
    ats_score: number;
    score_rationale: string;
    gaps: string[];
    improvements: string[];
    skill_match: SkillMatch;
    section_analysis: SectionFeedback[];
    recruiter_summary: string;
}

type Step = "input" | "analyzing" | "results";
type JobTab = "text" | "url";

function scoreColor(n: number) {
    if (n >= 70) return "text-green-600";
    if (n >= 50) return "text-yellow-600";
    return "text-red-600";
}

function scoreBorderColor(n: number) {
    if (n >= 70) return "border-green-500";
    if (n >= 50) return "border-yellow-500";
    return "border-red-500";
}

function scoreBarBg(n: number) {
    if (n >= 70) return "bg-green-500";
    if (n >= 50) return "bg-yellow-500";
    return "bg-red-500";
}

function gradeLabel(n: number) {
    if (n >= 90) return "Excellent";
    if (n >= 70) return "Good";
    if (n >= 50) return "Fair";
    if (n >= 30) return "Poor";
    return "Critical";
}

export default function ExaminePage() {
    const [step, setStep] = useState<Step>("input");
    const [jobTab, setJobTab] = useState<JobTab>("text");
    const [jobUrl, setJobUrl] = useState("");
    const [jobText, setJobText] = useState("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [results, setResults] = useState<ATSResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    function reset() {
        setStep("input");
        setJobTab("text");
        setJobUrl("");
        setJobText("");
        setResumeFile(null);
        setResults(null);
        setError(null);
    }

    async function handleAnalyze() {
        setError(null);

        if (!resumeFile) {
            setError("Please upload your resume (PDF or TXT).");
            return;
        }
        const jobContent = jobTab === "url" ? jobUrl.trim() : jobText.trim();
        if (!jobContent) {
            setError(jobTab === "url" ? "Please enter a job posting URL." : "Please paste the job description.");
            return;
        }

        setStep("analyzing");

        try {
            const fd = new FormData();
            fd.append("resume", resumeFile);
            fd.append("job_source", jobTab);
            fd.append("job_content", jobContent);

            const res = await fetch(`${AI_BASE}/score-resume`, {
                method: "POST",
                body: fd,
            });

            const json = await res.json();

            if (!json.success) {
                throw new Error(json.message || "Analysis failed");
            }

            setResults(json.data);
            setStep("results");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setStep("input");
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-6 py-8 max-w-5xl">

                {/* ── Input ── */}
                {step === "input" && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Sparkles className="h-6 w-6 text-primary" />
                                Resume Examiner
                            </h1>
                            <p className="text-sm text-gray-400 mt-1">
                                Upload your resume and provide a job description to get an AI-powered ATS analysis.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Job Description */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 shadow-sm">
                                <h2 className="text-sm font-semibold text-gray-700">Job Description</h2>
                                <Tabs value={jobTab} onValueChange={(v) => setJobTab(v as JobTab)}>
                                    <TabsList className="w-full">
                                        <TabsTrigger value="text" className="flex-1 gap-1.5">
                                            <FileText className="h-3.5 w-3.5" /> Text
                                        </TabsTrigger>
                                        <TabsTrigger value="url" className="flex-1 gap-1.5">
                                            <LinkIcon className="h-3.5 w-3.5" /> URL
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="text" className="mt-3 space-y-1.5">
                                        <Label htmlFor="jd-text">Paste job description</Label>
                                        <Textarea
                                            id="jd-text"
                                            rows={10}
                                            placeholder="Paste the full job description here..."
                                            value={jobText}
                                            onChange={(e) => setJobText(e.target.value)}
                                        />
                                    </TabsContent>
                                    <TabsContent value="url" className="mt-3 space-y-1.5">
                                        <Label htmlFor="jd-url">Job posting URL</Label>
                                        <Input
                                            id="jd-url"
                                            placeholder="https://jobs.lever.co/company/role"
                                            value={jobUrl}
                                            onChange={(e) => setJobUrl(e.target.value)}
                                        />
                                        <p className="text-xs text-gray-400">
                                            Works with Greenhouse, Lever, Wellfound, RemoteOK. LinkedIn not supported.
                                        </p>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {/* Resume Upload */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 shadow-sm">
                                <h2 className="text-sm font-semibold text-gray-700">Your Resume</h2>
                                <div
                                    className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-200 p-10 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-8 w-8 text-gray-300" />
                                    {resumeFile ? (
                                        <p className="text-sm font-medium text-gray-700 text-center">{resumeFile.name}</p>
                                    ) : (
                                        <p className="text-sm text-gray-400 text-center">Click to upload your resume</p>
                                    )}
                                    <p className="text-xs text-gray-300">PDF or TXT</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="application/pdf,text/plain"
                                    className="hidden"
                                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                                />
                            </div>
                        </div>

                        {error && <p className="text-sm text-destructive">{error}</p>}

                        <Button onClick={handleAnalyze} className="w-full gap-2" size="lg">
                            <Sparkles className="h-4 w-4" />
                            Analyze My Resume
                        </Button>
                    </div>
                )}

                {/* ── Analyzing ── */}
                {step === "analyzing" && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <div className="space-y-1">
                            <p className="text-lg font-semibold text-gray-800">Analyzing your resume...</p>
                            <p className="text-sm text-gray-400">Parsing resume → Running RAG pipeline → Generating ATS report</p>
                            <p className="text-xs text-gray-300 mt-2">This usually takes 10–20 seconds</p>
                        </div>
                    </div>
                )}

                {/* ── Results ── */}
                {step === "results" && results && (
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">ATS Analysis Report</h1>
                                <p className="text-sm text-gray-400 mt-1">AI-generated resume assessment</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
                                <Sparkles className="h-3.5 w-3.5" />
                                New Analysis
                            </Button>
                        </div>

                        {/* 1. Score Hero */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-8">
                            <div className={`w-36 h-36 rounded-full border-8 flex-shrink-0 flex flex-col items-center justify-center ${scoreBorderColor(results.ats_score)}`}>
                                <span className={`text-4xl font-bold ${scoreColor(results.ats_score)}`}>
                                    {results.ats_score}
                                </span>
                                <span className={`text-xs font-semibold mt-0.5 ${scoreColor(results.ats_score)}`}>
                                    {gradeLabel(results.ats_score)}
                                </span>
                            </div>
                            <div className="flex-1 space-y-2">
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">ATS Score</h2>
                                <p className="text-gray-700 leading-relaxed">{results.score_rationale}</p>
                            </div>
                        </div>

                        {/* 2. Skill Match */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Skill Match</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Matched</span>
                                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">{results.skill_match.matched.length}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {results.skill_match.matched.map((s) => (
                                            <span key={s} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{s}</span>
                                        ))}
                                        {results.skill_match.matched.length === 0 && <span className="text-xs text-gray-400">None</span>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">Missing</span>
                                        <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">{results.skill_match.missing.length}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {results.skill_match.missing.map((s) => (
                                            <span key={s} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">{s}</span>
                                        ))}
                                        {results.skill_match.missing.length === 0 && <span className="text-xs text-gray-400">None</span>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Bonus</span>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">{results.skill_match.bonus.length}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {results.skill_match.bonus.map((s) => (
                                            <span key={s} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{s}</span>
                                        ))}
                                        {results.skill_match.bonus.length === 0 && <span className="text-xs text-gray-400">None</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Gaps & Improvements */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Gaps</h2>
                                <ul className="space-y-2">
                                    {results.gaps.map((g, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                                            <span className="text-red-400 flex-shrink-0 mt-0.5">•</span>
                                            {g}
                                        </li>
                                    ))}
                                    {results.gaps.length === 0 && <li className="text-sm text-gray-400">No significant gaps found.</li>}
                                </ul>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Improvements</h2>
                                <ul className="space-y-2">
                                    {results.improvements.map((imp, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                                            <span className="text-primary flex-shrink-0 mt-0.5">→</span>
                                            {imp}
                                        </li>
                                    ))}
                                    {results.improvements.length === 0 && <li className="text-sm text-gray-400">No improvements suggested.</li>}
                                </ul>
                            </div>
                        </div>

                        {/* 4. Section Analysis */}
                        <div className="space-y-3">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Section Analysis</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.section_analysis.map((sec) => (
                                    <div key={sec.section} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-gray-800">{sec.section}</span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sec.score >= 70 ? "bg-green-100 text-green-700" : sec.score >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                                                {sec.score}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div
                                                className={`h-1.5 rounded-full ${scoreBarBg(sec.score)}`}
                                                style={{ width: `${sec.score}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed">{sec.feedback}</p>
                                        {sec.suggestions.length > 0 && (
                                            <ul className="space-y-1">
                                                {sec.suggestions.map((s, i) => (
                                                    <li key={i} className="text-xs text-gray-500 flex gap-1.5">
                                                        <span className="text-primary flex-shrink-0">›</span>
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 5. Recruiter Summary */}
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-3">
                            <div className="flex items-center gap-2">
                                <Quote className="h-4 w-4 text-primary/60" />
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recruiter Perspective</h2>
                            </div>
                            <p className="text-gray-700 leading-relaxed italic">{results.recruiter_summary}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
