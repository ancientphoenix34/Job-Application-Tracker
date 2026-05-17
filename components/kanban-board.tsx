"use client";

import { useState } from "react";
import { Board, Column, JobApplication } from "@/lib/models/models.types";
import { Award, Calendar, CheckCircle2, Mic, MoreVertical, Trash2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import CreateJobApplicationDialog from "./create-job-dialog";
import JobApplicationCard from "./job-application-card";
import { useBoard } from "@/lib/hooks/useBoards";
import { deleteColumnJobs } from "@/lib/actions/job-applications";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from "./ui/alert-dialog";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface KanbanBoardProps {
    board: Board;
    userId: string;
}

interface ColConfig {
    color: string;
    icon: React.ReactNode;
}

const COLUMN_CONFIG: Array<ColConfig> = [
    { color: "bg-cyan-500", icon: <Calendar className="h-4 w-4" /> },
    { color: "bg-purple-500", icon: <CheckCircle2 className="h-4 w-4" /> },
    { color: "bg-green-500", icon: <Mic className="h-4 w-4" /> },
    { color: "bg-yellow-500", icon: <Award className="h-4 w-4" /> },
    { color: "bg-red-500", icon: <XCircle className="h-4 w-4" /> },
];

function DroppableColumn(
    { column, config, boardId, sortedColumns }:
    { column: Column; config: ColConfig; boardId: string; sortedColumns: Column[] }
) {
    const [deleteAllOpen, setDeleteAllOpen] = useState(false);
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    const { setNodeRef, isOver } = useDroppable({ id: column._id });
    const sortedjJobs = column.jobApplications?.slice().sort((a, b) => a.order - b.order) || [];
    const jobIds = sortedjJobs.map(j => j._id);

    async function handleDeleteColumnJobs() {
        setIsDeletingAll(true);
        await deleteColumnJobs(column._id);
        setIsDeletingAll(false);
        setDeleteAllOpen(false);
    }

    return (
        <>
            <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete all jobs in &ldquo;{column.name}&rdquo;?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete all {sortedjJobs.length} job application{sortedjJobs.length !== 1 ? "s" : ""} in this column. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletingAll}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteColumnJobs}
                            disabled={isDeletingAll}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {isDeletingAll ? "Deleting..." : "Delete All"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Card className={`w-[300px] flex-shrink-0 shadow-sm border-gray-200 p-0 transition-all ${isOver ? "ring-2 ring-primary ring-offset-2 shadow-md" : ""}`}>
                <CardHeader className={`${config.color} text-white rounded-t-lg py-2.5 px-3`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {config.icon}
                            <CardTitle className="text-white text-base font-semibold">
                                {column.name}
                            </CardTitle>
                            {sortedjJobs.length > 0 && (
                                <span className="text-xs font-semibold bg-white/25 text-white px-1.5 py-0.5 rounded-full leading-none">
                                    {sortedjJobs.length}
                                </span>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                    className="py-1.5 px-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                    onClick={() => setDeleteAllOpen(true)}
                                    disabled={sortedjJobs.length === 0}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete All Jobs
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent
                    ref={setNodeRef}
                    className="space-y-2 pt-3 px-3 pb-2 bg-gray-50/60 h-[calc(100vh-12rem)] overflow-y-auto rounded-b-lg"
                >
                    <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
                        {sortedjJobs.map((job) => (
                            <SortableJobCard
                                key={job._id}
                                job={{ ...job, columnId: job.columnId || column._id }}
                                columns={sortedColumns}
                            />
                        ))}
                    </SortableContext>
                    <CreateJobApplicationDialog columnId={column._id} boardId={boardId} />
                </CardContent>
            </Card>
        </>
    );
}

function SortableJobCard({ job, columns }: { job: JobApplication; columns: Column[] }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: job._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <JobApplicationCard job={job} columns={columns} />
        </div>
    );
}

export default function KanbanBoard({ board, userId: _userId }: KanbanBoardProps) {
    const { columns, moveJob } = useBoard(board);
    const [activeJob, setActiveJob] = useState<JobApplication | null>(null);

    const sortedColumns = columns?.slice().sort((a, b) => a.order - b.order) || [];

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    function handleDragStart(event: DragStartEvent) {
        const draggedJobId = event.active.id as string;
        for (const col of sortedColumns) {
            const found = col.jobApplications.find(j => j._id === draggedJobId);
            if (found) { setActiveJob(found); break; }
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveJob(null);
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const draggedJobId = active.id as string;
        const overId = over.id as string;

        let targetColumnId = overId;
        let newOrder = 0;

        // Check if dropped on a column directly
        const targetColumn = sortedColumns.find(c => c._id === overId);
        if (targetColumn) {
            // Append to end of that column
            newOrder = targetColumn.jobApplications.length;
        } else {
            // Dropped on another job card — find which column it belongs to
            for (const col of sortedColumns) {
                const sorted = col.jobApplications.slice().sort((a, b) => a.order - b.order);
                const jobIdx = sorted.findIndex(j => j._id === overId);
                if (jobIdx !== -1) {
                    targetColumnId = col._id;
                    newOrder = jobIdx;
                    break;
                }
            }
        }

        moveJob(draggedJobId, targetColumnId, newOrder);
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="h-[calc(100vh-4rem)] overflow-hidden">
                <div className="flex gap-4 overflow-x-auto h-full px-4 pb-4 pt-2 items-start">
                    {sortedColumns.map((col, key) => {
                        const config = COLUMN_CONFIG[key] || {
                            color: "bg-gray-500",
                            icon: <Calendar className="h-4 w-4" />,
                        };
                        return (
                            <DroppableColumn
                                key={col._id}
                                column={col}
                                config={config}
                                boardId={board._id}
                                sortedColumns={sortedColumns}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Ghost card shown under the pointer while dragging */}
            <DragOverlay>
                {activeJob ? (
                    <div className="opacity-90 rotate-2 shadow-xl">
                        <JobApplicationCard job={activeJob} columns={sortedColumns} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
