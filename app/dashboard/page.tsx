

import KanbanBoard from "@/components/kanban-board";
import { getSession } from "@/lib/auth/auth"
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function getBoard( userId:string) {
  "use cache";
  await connectDB();

  const boardDoc = await Board.findOne({
    userId: userId,
    name: "Job Hunt"
  }).populate({
    path: "columns",
    populate: { path: "jobApplications" },
  });

  if(!boardDoc) return null;

  const board=boardDoc? boardDoc.toObject():null;
  return board
}

async function DashBoardPage() {
    const session = await getSession();

  const board=await getBoard(session?.user.id?? "")

  if (!session?.user) {
    redirect("/sign-in");
  }


  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">{board.name}</h1>
          <p className="text-gray-600">Track your job applications</p>
        </div>
        <KanbanBoard board={board} userId={session.user.id} />
      </div>
    </div>
  );
}
export default async function Dashboard() {
return( 
<Suspense fallback={<p>Loading ...</p>}>
<DashBoardPage/>
</Suspense>
)};