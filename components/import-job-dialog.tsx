"use client";

import { useRef, useState } from "react";
import { Column } from "@/lib/models/models.types";
import { createJobApplication } from "@/lib/actions/job-applications";
import { Button } from "./ui/button";
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "./ui/select";
import { FileText, Loader2, Sparkles, Upload, Link as LinkIcon } from "lucide-react";

interface ImportJobDialogProps {
    columns: Column[];
    boardId: string;
}

interface ParsedData {
    company: string;
    position: string;
    location: string;
    salary: string;
    experience: string;
    job_type: string;
    skills: string[];
    tags: string[];
    description: string;
}

type Step = "input" | "parsing" | "review";
type TabMode = "url" | "text" | "image";

const AI_BASE = "/api/ai";

const EMPTY_FORM = {
    company: "",
    position: "",
    location: "",
    salary: "",
    description: "",
    jobUrl: "",
    tags: "",
    notes: "",
};

export default function ImportJobDialog({ columns, boardId }: ImportJobDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>("input");
    const [tab, setTab] = useState<TabMode>("url");

    const [urlValue, setUrlValue] = useState("");
    const [textValue, setTextValue] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [selectedColumnId, setSelectedColumnId] = useState(
        columns[0]?._id || ""
    );
    const [isSaving, setIsSaving] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    function resetDialog() {
        setStep("input");
        setTab("url");
        setUrlValue("");
        setTextValue("");
        setImageFile(null);
        setError(null);
        setFormData(EMPTY_FORM);
        setSelectedColumnId(columns[0]?._id || "");
        setIsSaving(false);
    }

    function handleOpenChange(val: boolean) {
        setOpen(val);
        if (!val) resetDialog();
    }

    function applyParsedData(data: ParsedData) {
        setFormData({
            company: data.company,
            position: data.position,
            location: data.location,
            salary: data.salary,
            description: data.description,
            jobUrl: "",
            tags: [...data.skills, ...data.tags].join(", "),
            notes: data.experience
                ? `Experience: ${data.experience}${data.job_type ? `\nJob type: ${data.job_type}` : ""}`
                : "",
        });
    }

    async function handleParse() {
        setError(null);
        setStep("parsing");

        try {
            let res: Response;

            if (tab === "url") {
                if (!urlValue.trim()) throw new Error("Please enter a URL");
                res = await fetch(`${AI_BASE}/parse-job-url`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: urlValue.trim() }),
                });
            } else if (tab === "text") {
                if (!textValue.trim()) throw new Error("Please enter job description text");
                res = await fetch(`${AI_BASE}/parse-job-text`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: textValue.trim() }),
                });
            } else {
                if (!imageFile) throw new Error("Please select an image");
                const fd = new FormData();
                fd.append("file", imageFile);
                res = await fetch(`${AI_BASE}/parse-screenshot`, {
                    method: "POST",
                    body: fd,
                });
            }

            const json = await res.json();

            if (!json.success) {
                throw new Error(json.message || "Parsing failed");
            }

            applyParsedData(json.data);
            setStep("review");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setStep("input");
        }
    }

    async function handleSave() {
        if (!formData.company.trim() || !formData.position.trim()) {
            setError("Company and position are required");
            return;
        }
        setIsSaving(true);
        setError(null);

        const result = await createJobApplication({
            company: formData.company,
            position: formData.position,
            location: formData.location || undefined,
            salary: formData.salary || undefined,
            jobUrl: formData.jobUrl || undefined,
            description: formData.description || undefined,
            notes: formData.notes || undefined,
            tags: formData.tags
                ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
                : [],
            columnId: selectedColumnId,
            boardId,
        });

        setIsSaving(false);

        if (result?.error) {
            setError(result.error);
        } else {
            handleOpenChange(false);
        }
    }

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="gap-2"
                size="sm"
            >
                <Sparkles className="h-4 w-4" />
                Import Job
            </Button>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                {/* Fixed height prevents the dialog from growing with content */}
                <DialogContent className="max-w-xl h-[640px] flex flex-col p-0 gap-0 overflow-hidden">

                    {/* ── Step 1: Input ── */}
                    {step === "input" && (
                        <div className="flex flex-col h-full p-6 gap-4">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Import Job with AI
                                </DialogTitle>
                                <DialogDescription>
                                    Provide a job posting URL, paste description text, or upload a screenshot.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto min-h-0">
                                <Tabs value={tab} onValueChange={(v) => setTab(v as TabMode)}>
                                    <TabsList className="w-full">
                                        <TabsTrigger value="url" className="flex-1 gap-1.5">
                                            <LinkIcon className="h-3.5 w-3.5" /> URL
                                        </TabsTrigger>
                                        <TabsTrigger value="text" className="flex-1 gap-1.5">
                                            <FileText className="h-3.5 w-3.5" /> Text
                                        </TabsTrigger>
                                        <TabsTrigger value="image" className="flex-1 gap-1.5">
                                            <Upload className="h-3.5 w-3.5" /> Screenshot
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="url" className="mt-4 space-y-2">
                                        <Label htmlFor="job-url">Job Posting URL</Label>
                                        <Input
                                            id="job-url"
                                            placeholder="https://jobs.lever.co/company/role"
                                            value={urlValue}
                                            onChange={(e) => setUrlValue(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleParse()}
                                        />
                                        <p className="text-xs text-gray-400">
                                            Works with Greenhouse, Lever, Wellfound, RemoteOK, and most career pages.
                                            LinkedIn is not supported — use text or screenshot instead.
                                        </p>
                                    </TabsContent>

                                    <TabsContent value="text" className="mt-4 space-y-2">
                                        <Label htmlFor="job-text">Job Description</Label>
                                        <Textarea
                                            id="job-text"
                                            placeholder="Paste the full job description here..."
                                            rows={8}
                                            value={textValue}
                                            onChange={(e) => setTextValue(e.target.value)}
                                        />
                                    </TabsContent>

                                    <TabsContent value="image" className="mt-4 space-y-2">
                                        <Label>Screenshot</Label>
                                        <div
                                            className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-200 p-8 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="h-8 w-8 text-gray-300" />
                                            {imageFile ? (
                                                <p className="text-sm font-medium text-gray-700">{imageFile.name}</p>
                                            ) : (
                                                <p className="text-sm text-gray-400">Click to upload a job posting screenshot</p>
                                            )}
                                            <p className="text-xs text-gray-300">JPEG, PNG, WebP supported</p>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            className="hidden"
                                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {error && (
                                <p className="text-sm text-destructive">{error}</p>
                            )}

                            <DialogFooter>
                                <Button variant="outline" onClick={() => handleOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleParse} className="gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Parse with AI
                                </Button>
                            </DialogFooter>
                        </div>
                    )}

                    {/* ── Step 2: Parsing ── */}
                    {step === "parsing" && (
                        <div className="flex flex-col h-full p-6 items-center justify-center gap-4">
                            <DialogHeader className="text-center items-center">
                                <DialogTitle>Parsing Job Posting</DialogTitle>
                                <DialogDescription>
                                    AI is extracting structured information from the job posting...
                                </DialogDescription>
                            </DialogHeader>
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-sm text-gray-500">This usually takes a few seconds</p>
                        </div>
                    )}

                    {/* ── Step 3: Review & Save ── */}
                    {step === "review" && (
                        <div className="flex flex-col h-full p-6 gap-4">
                            <DialogHeader>
                                <DialogTitle>Review & Save</DialogTitle>
                                <DialogDescription>
                                    AI extracted the fields below. Edit anything before saving.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="r-company">Company *</Label>
                                        <Input
                                            id="r-company"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="r-position">Position *</Label>
                                        <Input
                                            id="r-position"
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="r-location">Location</Label>
                                        <Input
                                            id="r-location"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="r-salary">Salary</Label>
                                        <Input
                                            id="r-salary"
                                            value={formData.salary}
                                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="r-jobUrl">Job URL</Label>
                                    <Input
                                        id="r-jobUrl"
                                        value={formData.jobUrl}
                                        onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="r-tags">Tags & Skills (comma-separated)</Label>
                                    <Input
                                        id="r-tags"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="r-description">Description</Label>
                                    <Textarea
                                        id="r-description"
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="r-notes">Notes</Label>
                                    <Textarea
                                        id="r-notes"
                                        rows={2}
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Save to Column</Label>
                                    <Select value={selectedColumnId} onValueChange={setSelectedColumnId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select column" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {columns
                                                .slice()
                                                .sort((a, b) => a.order - b.order)
                                                .map((col) => (
                                                    <SelectItem key={col._id} value={col._id}>
                                                        {col.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-destructive">{error}</p>
                            )}

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => { setStep("input"); setError(null); }}
                                    disabled={isSaving}
                                >
                                    Back
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                                    {isSaving
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                                        : "Save Job"}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
