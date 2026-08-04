import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Lead, { type LeadStatus } from "@/lib/models/Lead";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

const VALID_STATUSES: LeadStatus[] = ["new", "contacted", "converted", "rejected"];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const lead = await Lead.findById(id).lean();
    if (!lead) {
      return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
    }

    let events: unknown[] = [];
    if (lead.visitorId) {
      const db = await getDb();
      events = await db
        .collection("visitor_events")
        .find({ visitorId: lead.visitorId })
        .sort({ timestamp: 1 })
        .limit(200)
        .toArray();
    }

    return NextResponse.json({ ok: true, lead, events });
  } catch (error) {
    console.error("[admin/leads GET]", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch lead" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let body: { status?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }

    if (body.status && !VALID_STATUSES.includes(body.status as LeadStatus)) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }

    await connectDB();
    const lead = await Lead.findByIdAndUpdate(
      id,
      { $set: { status: body.status, updatedAt: new Date() } },
      { new: true }
    ).lean();

    if (!lead) {
      return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, lead });
  } catch (error) {
    console.error("[admin/leads PATCH]", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const result = await Lead.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/leads DELETE]", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
