import crypto from "crypto";
import { getGoogleOAuthCredentials } from "@/lib/gmail-oauth";

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://pixelim.net";
}

function stateSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    "pixelim-admin"
  );
}

export function getAdminUsers(): string[] {
  const raw = process.env.ADMIN_USERS || "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(email: string): boolean {
  const admins = getAdminUsers();
  if (admins.length === 0) return false;
  return admins.includes(email.toLowerCase());
}

export function isGoogleLoginEnabled(): boolean {
  return getAdminUsers().length > 0 && Boolean(getGoogleOAuthCredentials());
}

export function getAdminGoogleRedirectUri(): string {
  return `${getSiteUrl()}/api/admin/auth/google/callback`;
}

export function createAdminGoogleState(): string {
  const payload = Buffer.from(
    JSON.stringify({
      ts: Date.now(),
      n: crypto.randomBytes(8).toString("hex"),
      purpose: "admin_login",
    })
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", stateSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyAdminGoogleState(state: string): boolean {
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return false;
  const expected = crypto
    .createHmac("sha256", stateSecret())
    .update(payload)
    .digest("base64url");
  if (sig.length !== expected.length) return false;
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return false;
    }
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { ts?: number; purpose?: string };
    if (!data.ts || Date.now() - data.ts > 15 * 60 * 1000) return false;
    if (data.purpose !== "admin_login") return false;
    return true;
  } catch {
    return false;
  }
}

export function buildAdminGoogleAuthUrl(state: string): string {
  const creds = getGoogleOAuthCredentials();
  if (!creds) throw new Error("Google OAuth not configured");

  const params = new URLSearchParams({
    client_id: creds.clientId,
    redirect_uri: getAdminGoogleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}
