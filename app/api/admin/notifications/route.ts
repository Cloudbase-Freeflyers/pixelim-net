import { NextResponse } from "next/server";
import {
  addApprovedSubscriber,
  listNotificationSubscribers,
  getApprovedEmailsForTopic,
} from "@/lib/notification-subscribers";
import { getEmailConfigSummary } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as
    | "pending"
    | "approved"
    | "rejected"
    | null;

  try {
    const [subscribers, approved, pending, config] = await Promise.all([
      listNotificationSubscribers(
        status === "pending" || status === "approved" || status === "rejected"
          ? status
          : undefined
      ),
      getApprovedEmailsForTopic("leads"),
      listNotificationSubscribers("pending"),
      getEmailConfigSummary(),
    ]);

    const rows = subscribers.map((s) => ({
      _id: String(s._id),
      email: s.email,
      name: s.name,
      status: s.status,
      preferences: s.preferences,
      createdAt:
        s.createdAt instanceof Date
          ? s.createdAt.toISOString()
          : String(s.createdAt),
      approvedAt: s.approvedAt?.toISOString(),
    }));

    return NextResponse.json({
      ok: true,
      rows,
      config: {
        ...config,
        approvedSubscriberCount: approved.length,
        pendingCount: pending.length,
      },
    });
  } catch (err) {
    console.error("[admin/notifications GET]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load subscribers" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const { email, name } = body as { email?: string; name?: string };
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Valid email is required" }, { status: 400 });
  }

  try {
    const row = await addApprovedSubscriber({
      email,
      name: name || undefined,
    });
    if (!row) {
      return NextResponse.json({ ok: false, error: "Failed to add subscriber" }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      row: {
        _id: String(row._id),
        email: row.email,
        name: row.name,
        status: row.status,
        preferences: row.preferences,
        createdAt:
          row.createdAt instanceof Date
            ? row.createdAt.toISOString()
            : String(row.createdAt),
        approvedAt: row.approvedAt?.toISOString(),
      },
    });
  } catch (err) {
    console.error("[admin/notifications POST]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to add subscriber" },
      { status: 500 }
    );
  }
}
