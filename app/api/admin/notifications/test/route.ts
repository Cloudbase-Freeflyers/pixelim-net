import { NextResponse } from "next/server";
import { GmailSendError, sendTestNotification } from "@/lib/email";
import { resolveActiveTransport } from "@/lib/email-transport";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { to?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body — defaults apply */
  }

  const resolved = await resolveActiveTransport();
  const transportMeta = {
    preferred: resolved.preferred,
    active: resolved.active,
    smtpAvailable: resolved.smtpAvailable,
    oauthAvailable: resolved.oauthAvailable,
    smtpHost: resolved.smtpHost,
    from:
      resolved.active === "smtp"
        ? resolved.smtpFrom
        : resolved.oauthEmail,
  };

  try {
    const { recipients, transportMeta: meta } = await sendTestNotification(
      body.to
    );
    return NextResponse.json({
      ok: true,
      recipients,
      transportMeta: meta,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Send failed";
    const diagnostics =
      err instanceof GmailSendError ? err.diagnostics : undefined;
    const errMeta =
      err &&
      typeof err === "object" &&
      "transportMeta" in err
        ? (err as { transportMeta: typeof transportMeta }).transportMeta
        : transportMeta;
    return NextResponse.json(
      {
        ok: false,
        error: msg,
        diagnostics: diagnostics ?? null,
        transportMeta: errMeta,
      },
      { status: 400 }
    );
  }
}
