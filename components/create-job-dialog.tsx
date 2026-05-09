"use client"

import { PlusSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useState } from "react";


interface CraeteJobApplicationDialogProps {
    columnId: string;
    boardId: string;
}

export default function CreateJobApplicationDialog({ columnId, boardId }: CraeteJobApplicationDialogProps) {
    const [open,setOpen] = useState<boolean>(false);
    const [formData,setFormData]=useState({
        company:"",
        position:"",
        location:"",
        notes:"",
        salary:"",
        jobUrl:"",
        tags:"",
        description:"",
    });

    async function handleSubmit(e:React.FormEvent){
        e.preventDefault();

        try{
          
        }catch(err){
            console.error(err)
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button variant="outline" className="w-full mb-4 justify-start text-muted-foreground border-dashed border-2 hover:border-solid hover:bg-muted/50">
                    <PlusSquare className="mr-2 h-4 w-4" />
                    Add Job
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        Add Job Application
                    </DialogTitle>
                    <DialogDescription>
                        Track a new job application
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="company">Company *</Label>
                                <Input id="company"
                                value={formData.company}
                                onChange={(e)=>setFormData({...formData,company:e.target.value})}
                                required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="position">Position *</Label>
                                <Input id="position"
                                value={formData.position}
                                onChange={(e)=>setFormData({...formData,position:e.target.value})}
                                required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">Location *</Label>
                                <Input id="location" 
                                value={formData.location}
                                onChange={(e)=>setFormData({...formData,location:e.target.value})}
                                required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salary">Salary *</Label>
                                <Input id="salary" 
                                value={formData.salary}
                                onChange={(e)=>setFormData({...formData,salary:e.target.value})}
                                required 
                                placeholder="e.g., $100k - $150k" />
                            </div>
                        </div>
                        <div>
                            <div className="space-y-2">
                                <Label htmlFor="jobUrl">Job URL</Label>
                                <Input id="jobUrl" 
                                value={formData.jobUrl}
                                onChange={(e)=>setFormData({...formData,jobUrl:e.target.value})}
                                required 
                                placeholder="https://....." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags (comma-seperated)</Label>
                                <Input id="tags" 
                                value={formData.tags}
                                onChange={(e)=>setFormData({...formData,tags:e.target.value})}
                                required 
                                placeholder="react,node,High pay,UI/UX" />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" 
                                value={formData.description}
                                onChange={(e)=>setFormData({...formData,description:e.target.value})}
                                rows={3} 
                                placeholder="Brief description of the role..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea id="notes"
                                 rows={4}
                                 value={formData.notes}
                                onChange={(e)=>setFormData({...formData,notes:e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={()=>setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Add Application
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}