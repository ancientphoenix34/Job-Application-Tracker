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

    const body = await req.json();
    const res = await fetch(`${AI_SERVICE_URL}/parse-job-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
