"use client";

import { useState } from "react";
import { Column, JobApplication } from "@/lib/models/models.types";
import { Card, CardContent } from "./ui/card";
import { Edit2, ExternalLink, MoreVertical, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { updateJobApplication, deleteJobApplication } from "@/lib/actions/job-applications";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from "./ui/alert-dialog";
import EditJobDialog from "./edit-job-dialog";

interface JobApplicationCardProps {
    job: JobApplication;
    columns: Column[];
}

export default function JobApplicationCard({ job, columns }: JobApplicationCardProps) {
    const [localJob, setLocalJob] = useState<JobApplication>(job);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    if (isDeleted) return null;

    async function handleMove(newColumnId: string) {
        try {
            await updateJobApplication(localJob._id, { columnId: newColumnId });
        } catch (err) {
            console.error("Failed to move job application:", err);
        }
    }

    async function handleDelete() {
        setIsDeleting(true);
        const result = await deleteJobApplication(localJob._id);
        if (result.error) {
            setIsDeleting(false);
            console.error("Failed to delete:", result.error);
        } else {
            setIsDeleted(true);
        }
        setDeleteOpen(false);
    }

    return (
        <>
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this application?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Permanently delete &ldquo;{localJob.position}&rdquo; at {localJob.company}. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <EditJobDialog
                job={localJob}
                open={editOpen}
                onOpenChange={setEditOpen}
                onSuccess={(updated) => setLocalJob(updated)}
            />

            <Card className="rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-sm text-gray-900">{localJob.position}</h3>
                                {localJob.jobUrl && (
                                    <a
                                        target="_blank"
                                        href={localJob.jobUrl}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-red-400 hover:text-red-500 flex-shrink-0"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">{localJob.company}</p>
                            {localJob.description && (
                                <p className="text-sm text-gray-500">{localJob.description}</p>
                            )}
                            {localJob.tags && localJob.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {localJob.tags.map((tag, key) => (
                                        <span key={key} className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-600 -mt-1 -mr-1">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                {columns.length > 1 && (
                                    <>
                                        {columns.filter((c) => c._id !== localJob.columnId).map((column, key) => (
                                            <DropdownMenuItem key={key} onClick={() => handleMove(column._id)}>
                                                Move to {column.name}
                                            </DropdownMenuItem>
                                        ))}
                                    </>
                                )}
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => setDeleteOpen(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
