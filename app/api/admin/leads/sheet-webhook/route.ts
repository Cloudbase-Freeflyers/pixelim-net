import { NextResponse } from "next/server";
import {
  clearAppsScriptWebhookConfig,
  getAppsScriptWebhookDiagnosticsFull,
  getAppsScriptWebhookPublicSummary,
  saveAppsScriptWebhookConfig,
} from "@/lib/apps-script-settings";
import { testAppsScriptWebhookConnection } from "@/lib/apps-script-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const diagnostics = await getAppsScriptWebhookDiagnosticsFull();
    return NextResponse.json({ ok: true, ...diagnostics });
  } catch (err) {
    console.error("[admin/leads/sheet-webhook GET]", err);
    return NextResponse.json({ ok: false, error: "Failed to load" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const b = body as { url?: string; secret?: string; test?: boolean };

  try {
    await saveAppsScriptWebhookConfig({
      url: b.url || "",
      secret: b.secret || "",
    });

    const summary = await getAppsScriptWebhookPublicSummary();
    let testResult: { ok: boolean; error?: string } | undefined;

    if (b.test !== false) {
      testResult = await testAppsScriptWebhookConnection();
    }

    return NextResponse.json({
      ok: true,
      ...summary,
      test: testResult,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to save";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

export async function POST() {
  try {
    const summary = await getAppsScriptWebhookPublicSummary();
    if (!summary.configured) {
      return NextResponse.json(
        { ok: false, error: "Sheet webhook is not configured" },
        { status: 400 }
      );
    }
    const test = await testAppsScriptWebhookConnection();
    return NextResponse.json({ ok: test.ok, ...summary, test });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Test failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearAppsScriptWebhookConfig();
    const summary = await getAppsScriptWebhookPublicSummary();
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    console.error("[admin/leads/sheet-webhook DELETE]", err);
    return NextResponse.json({ ok: false, error: "Failed to clear" }, { status: 500 });
  }
}
