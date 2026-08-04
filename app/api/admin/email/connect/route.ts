import { NextResponse } from "next/server";
import {
  clearConnectedEmailSender,
  getConnectedEmailSender,
} from "@/lib/email-sender";
import {
  buildGoogleAuthUrl,
  createOAuthState,
  isGoogleOAuthConfigured,
} from "@/lib/gmail-oauth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const existing = await getConnectedEmailSender();
  const forceConsent = searchParams.get("reconnect") === "1" || !existing;
  const origin = new URL(req.url).origin;
  const state = createOAuthState();
  const url = buildGoogleAuthUrl(state, { forceConsent, origin });
  return NextResponse.redirect(url);
}

export async function DELETE() {
  try {
    await clearConnectedEmailSender();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/email/connect DELETE]", err);
    return NextResponse.json(
      { ok: false, error: "Disconnect failed" },
      { status: 500 }
    );
  }
}
