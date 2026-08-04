import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

interface TrackPayload {
  visitorId?: string;
  sessionId?: string;
  type?: string;
  url?: string;
  path?: string;
  referrer?: string | null;
  utms?: Record<string, string> | null;
  clickIds?: Record<string, string> | null;
  userAgent?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TrackPayload;

    if (!body.visitorId || !body.type) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("visitor_events").insertOne({
      visitorId: body.visitorId,
      sessionId: body.sessionId || null,
      type: body.type,
      url: body.url || null,
      path: body.path || null,
      referrer: body.referrer || null,
      utms: body.utms || null,
      clickIds: body.clickIds || null,
      userAgent: body.userAgent || null,
      timestamp: new Date(),
    });

    const res = NextResponse.json({ ok: true });
    // Echo back the visitor cookie in case it was just created client-side
    if (!req.cookies.get("pixelim_vid")) {
      res.cookies.set("pixelim_vid", body.visitorId, {
        httpOnly: false,
        sameSite: "lax",
        maxAge: 2 * 365 * 24 * 60 * 60,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });
    }
    return res;
  } catch (err) {
    console.error("[track]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
