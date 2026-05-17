"use client"

import { useEffect, useState } from "react";
import { JobApplication } from "@/lib/models/models.types";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { updateJobApplication } from "@/lib/actions/job-applications";

interface EditJobDialogProps {
    job: JobApplication;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (updatedJob: JobApplication) => void;
}

export default function EditJobDialog({ job, open, onOpenChange, onSuccess }: EditJobDialogProps) {
    const [formData, setFormData] = useState({
        company: job.company,
        position: job.position,
        location: job.location ?? "",
        notes: job.notes ?? "",
        salary: job.salary ?? "",
        jobUrl: job.jobUrl ?? "",
        tags: (job.tags ?? []).join(", "),
        description: job.description ?? "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setFormData({
            company: job.company,
            position: job.position,
            location: job.location ?? "",
            notes: job.notes ?? "",
            salary: job.salary ?? "",
            jobUrl: job.jobUrl ?? "",
            tags: (job.tags ?? []).join(", "),
            description: job.description ?? "",
        });
        setError(null);
    }, [job._id]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const result = await updateJobApplication(job._id, {
            ...formData,
            tags: formData.tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0),
        });

        setIsSubmitting(false);

        if (result.error) {
            setError(result.error);
            return;
        }

        onSuccess(result.data);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Job Application</DialogTitle>
                    <DialogDescription>
                        Update the details for this job application
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-company">Company *</Label>
                                <Input
                                    id="edit-company"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-position">Position *</Label>
                                <Input
                                    id="edit-position"
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-location">Location</Label>
                                <Input
                                    id="edit-location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-salary">Salary</Label>
                                <Input
                                    id="edit-salary"
                                    value={formData.salary}
                                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                    placeholder="e.g., $100k - $150k"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-jobUrl">Job URL</Label>
                                <Input
                                    id="edit-jobUrl"
                                    value={formData.jobUrl}
                                    onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                                    placeholder="https://....."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                                <Input
                                    id="edit-tags"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="react,node,High pay,UI/UX"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Brief description of the role..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-notes">Notes</Label>
                                <Textarea
                                    id="edit-notes"
                                    rows={4}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
