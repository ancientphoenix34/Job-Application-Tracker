import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";

const AI_SERVICE_URL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/ai-service`
    : (process.env.AI_SERVICE_URL || "http://localhost:8000");

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session?.user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const res = await fetch(`${AI_SERVICE_URL}/score-resume`, {
        method: "POST",
        body: formData,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
