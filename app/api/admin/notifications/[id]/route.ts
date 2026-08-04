import { NextResponse } from "next/server";
import {
  updateNotificationSubscriber,
  deleteNotificationSubscriber,
} from "@/lib/notification-subscribers";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const { status, preferences } = body as {
    status?: "pending" | "approved" | "rejected";
    preferences?: { leads?: boolean };
  };

  try {
    const row = await updateNotificationSubscriber(id, {
      status,
      preferences,
    });
    if (!row) {
      return NextResponse.json(
        { ok: false, error: "Subscriber not found" },
        { status: 404 }
      );
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
    console.error("[admin/notifications PATCH]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update subscriber" },
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
    const deleted = await deleteNotificationSubscriber(id);
    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: "Subscriber not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/notifications DELETE]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to delete subscriber" },
      { status: 500 }
    );
  }
}
