import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const leads = await Lead.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, leads });
  } catch (error) {
    console.error("[admin/leads GET]", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
