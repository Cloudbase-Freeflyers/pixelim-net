import { NextResponse } from "next/server";
import {
  clearSmtpConfig,
  getSmtpPublicSummary,
  saveSmtpConfig,
} from "@/lib/smtp-email";
import { setPreferredTransport } from "@/lib/email-transport";
import { getEmailConfigSummary } from "@/lib/email";

export const runtime = "nodejs";

export async function GET() {
  try {
    const smtp = await getSmtpPublicSummary();
    const config = await getEmailConfigSummary();
    return NextResponse.json({ ok: true, smtp, config });
  } catch (err) {
    console.error("[admin/email/smtp GET]", err);
    return NextResponse.json({ ok: false, error: "Failed to load SMTP" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const b = body as {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
    from?: string;
    activate?: boolean;
  };

  try {
    const saved = await saveSmtpConfig({
      host: b.host || "smtp.gmail.com",
      port: b.port,
      user: b.user || "",
      pass: b.pass || "",
      from: b.from,
    });

    if (b.activate !== false) {
      await setPreferredTransport("smtp");
    }

    const config = await getEmailConfigSummary();
    const smtp = await getSmtpPublicSummary();
    return NextResponse.json({ ok: true, smtp, config });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to save SMTP";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

export async function DELETE() {
  try {
    await clearSmtpConfig();
    const config = await getEmailConfigSummary();
    return NextResponse.json({ ok: true, config });
  } catch (err) {
    console.error("[admin/email/smtp DELETE]", err);
    return NextResponse.json({ ok: false, error: "Failed to clear SMTP" }, { status: 500 });
  }
}
