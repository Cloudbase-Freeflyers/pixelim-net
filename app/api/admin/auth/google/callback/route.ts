import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminGoogleState,
  isAdminUser,
  getAdminGoogleRedirectUri,
} from "@/lib/admin-google-auth";
import { getGoogleOAuthCredentials } from "@/lib/gmail-oauth";
import {
  createAdminSessionToken,
  adminSessionCookieOptions,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin-session";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://pixelim.net";
  const loginUrl = (err: string) =>
    `${base}/admin/login?error=${encodeURIComponent(err)}`;

  if (error || !code || !state) {
    return NextResponse.redirect(loginUrl("google_cancelled"));
  }

  const storedState = req.cookies.get("pixelim_admin_google_state")?.value;
  if (
    !storedState ||
    storedState !== state ||
    !verifyAdminGoogleState(state)
  ) {
    return NextResponse.redirect(loginUrl("invalid_state"));
  }

  const creds = getGoogleOAuthCredentials();
  if (!creds) return NextResponse.redirect(loginUrl("not_configured"));

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        redirect_uri: getAdminGoogleRedirectUri(),
        grant_type: "authorization_code",
      }),
    });

    const tokens = (await tokenRes.json()) as { access_token?: string };
    if (!tokens.access_token) {
      return NextResponse.redirect(loginUrl("token_failed"));
    }

    const userRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    const user = (await userRes.json()) as { email?: string };
    const email = user.email;

    if (!email) return NextResponse.redirect(loginUrl("no_email"));
    if (!isAdminUser(email)) {
      return NextResponse.redirect(loginUrl("unauthorized"));
    }

    const token = await createAdminSessionToken(email);
    const res = NextResponse.redirect(`${base}/admin`);
    res.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions());
    res.cookies.delete("pixelim_admin_google_state");
    return res;
  } catch (err) {
    console.error("[admin google callback]", err);
    return NextResponse.redirect(loginUrl("server_error"));
  }
}
