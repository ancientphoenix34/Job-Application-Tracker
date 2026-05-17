"use client";

import { Column, JobApplication } from "@/lib/models/models.types";
import { Card, CardContent } from "./ui/card";
import { Edit2, ExternalLink, MoreVertical, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { updateJobApplication } from "@/lib/actions/job-applications";

interface JobApplicationCardProps{
    job:JobApplication;
    columns:Column[];
}

export default function JobApplicationCard({job,columns}:JobApplicationCardProps){
    async function handleMove(newColumnId:string){
        try{
           const result= await updateJobApplication(job._id,{columnId:newColumnId});
        }catch(err){
            console.error("Failed to move job application:",err);
        }
    }
    return (
    <Card className="rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                    <h3 className="font-bold text-sm text-gray-900">{job.position}</h3>
                    <p className="text-sm text-gray-500">{job.company}</p>
                    {job.description && (
                        <p className="text-sm text-gray-500">{job.description}</p>
                    )}
                    {job.tags && job.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                            {job.tags.map((tag, key) => (
                                <span key={key} className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    {job.jobUrl && (
                        <a
                            target="_blank"
                            href={job.jobUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block pt-1 text-red-400 hover:text-red-500"
                        >
                            <ExternalLink className="h-4 w-4"/>
                        </a>
                    )}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-600 -mt-1 -mr-1">
                            <MoreVertical className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Edit2 className="mr-2 h-4 w-4"/>
                            Edit
                        </DropdownMenuItem>
                        {columns.length > 1 && (
                            <>
                                {columns.filter((c) => c._id !== job.columnId).map((column, key) => (
                                    <DropdownMenuItem key={key} onClick={()=>handleMove(column._id)}>
                                        Move to {column.name}
                                    </DropdownMenuItem>
                                ))}
                            </>
                        )}
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4"/>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </CardContent>
    </Card>
    );
}
