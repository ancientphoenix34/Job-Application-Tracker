"use client"

import { useEffect, useState } from "react"
import { Board, Column, JobApplication } from "../models/models.types"
import { updateJobApplication } from "../actions/job-applications"

export function useBoard(initialBoard?: Board | null) {

    const [board, setBoard] = useState<Board | null>(initialBoard || null);
    const [columns, setColumns] = useState<Column[]>(initialBoard?.columns || []);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialBoard) {
            setBoard(initialBoard);
            setColumns(initialBoard.columns || []);
        }
    }, [initialBoard])

    async function moveJob(
        jobApplicationId: string,
        newColumnId: string,
        newOrder: number
    ) {
        // Snapshot for rollback on failure
        const snapshot = columns.map(col => ({
            ...col,
            jobApplications: col.jobApplications.map(j => ({ ...j })),
        }));

        // Optimistic update — move the card immediately in UI
        setColumns(prev => {
            const next = prev.map(col => ({
                ...col,
                jobApplications: col.jobApplications.map(j => ({ ...j })),
            }));

            let movedJob: JobApplication | undefined;
            for (const col of next) {
                const idx = col.jobApplications.findIndex(j => j._id === jobApplicationId);
                if (idx !== -1) {
                    [movedJob] = col.jobApplications.splice(idx, 1);
                    break;
                }
            }
            if (!movedJob) return prev;

            movedJob = { ...movedJob, columnId: newColumnId };
            const targetCol = next.find(c => c._id === newColumnId);
            if (!targetCol) return prev;

            targetCol.jobApplications.splice(newOrder, 0, movedJob);
            targetCol.jobApplications.forEach((j, i) => { j.order = i; });

            return next;
        });

        const result = await updateJobApplication(jobApplicationId, {
            columnId: newColumnId,
            order: newOrder,
        });

        if (result?.error) {
            setColumns(snapshot);
            setError(result.error);
        }
    }

    return { board, columns, error, moveJob, setBoard, setColumns }
}
