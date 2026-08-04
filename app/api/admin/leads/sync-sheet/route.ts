import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import {
  getAppsScriptWebhookDiagnostics,
  isAppsScriptWebhookConfigured,
  syncLeadsBacklogToAppsScript,
} from "@/lib/apps-script-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Keep each request under Vercel hobby timeout (~10s); Apps Script ~300ms/lead. */
const CHUNK_LIMIT = 20;

type SyncBody = {
  offset?: number;
  limit?: number;
  replace?: boolean;
};

export async function GET() {
  const diagnostics = await getAppsScriptWebhookDiagnostics();
  return NextResponse.json({
    ok: diagnostics.configured,
    site: "pixelim.net",
    ...diagnostics,
  });
}

export async function POST(request: NextRequest) {
  if (!(await isAppsScriptWebhookConfigured())) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Apps Script webhook is not configured — set APPS_SCRIPT_WEBHOOK_URL and APPS_SCRIPT_WEBHOOK_SECRET.",
      },
      { status: 400 }
    );
  }

  let body: SyncBody = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text) as SyncBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const offset = Math.max(0, Number(body.offset) || 0);
  const limit = Math.min(
    Math.max(1, Number(body.limit) || CHUNK_LIMIT),
    CHUNK_LIMIT
  );
  const replace = body.replace === true && offset === 0;

  try {
    await connectDB();
    const total = await Lead.countDocuments();
    const leads = await Lead.find()
      .sort({ createdAt: 1 })
      .skip(offset)
      .limit(limit)
      .lean();

    if (leads.length === 0) {
      return NextResponse.json({
        ok: true,
        total,
        offset,
        imported: 0,
        batches: 0,
        nextOffset: offset,
        done: true,
      });
    }

    const payload = leads.map((l) => ({
      name: l.name,
      phone: l.phone,
      email: l.email,
      service: l.service,
      status: l.status || "new",
      referrer: l.referrer,
      visitorId: l.visitorId,
      createdAt: l.createdAt instanceof Date ? l.createdAt : new Date(l.createdAt),
    }));

    const { imported, batches } = await syncLeadsBacklogToAppsScript(payload, {
      skipNotify: true,
      replace,
      batchSize: payload.length,
    });

    const nextOffset = offset + leads.length;

    return NextResponse.json({
      ok: true,
      total,
      offset,
      imported,
      batches,
      nextOffset,
      done: nextOffset >= total,
    });
  } catch (error) {
    console.error("[admin/leads/sync-sheet POST]", error);
    const msg = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
