import { NextResponse } from "next/server";
import { listActivity } from "@/lib/activity-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const docs = await listActivity(50);
    const rows = docs.map((d) => ({
      _id: String(d._id),
      type: d.type,
      at: d.at instanceof Date ? d.at.toISOString() : String(d.at),
      title: d.title,
      detail: d.detail,
      recipients: d.recipients,
      status: d.status,
      error: d.error,
    }));
    return NextResponse.json({ ok: true, rows });
  } catch (err) {
    console.error("[admin/activity]", err);
    return NextResponse.json({ ok: false, error: "Failed to load activity" }, { status: 500 });
  }
}
