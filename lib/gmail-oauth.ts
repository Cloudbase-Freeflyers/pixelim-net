import crypto from "crypto";

export const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";
const EMAIL_SCOPE = "https://www.googleapis.com/auth/userinfo.email";

export function getGoogleOAuthCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(getGoogleOAuthCredentials());
}

export function getOAuthRedirectUri(origin?: string): string {
  const base = (origin || getSiteUrl()).replace(/\/$/, "");
  return `${base}/api/email/oauth/callback`;
}

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://pixelim.net"
  );
}

function oauthStateSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    "pixelim-email-oauth"
  );
}

export function createOAuthState(): string {
  const payload = Buffer.from(
    JSON.stringify({
      ts: Date.now(),
      n: crypto.randomBytes(8).toString("hex"),
      purpose: "gmail",
    })
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", oauthStateSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyOAuthState(state: string): { valid: boolean } {
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return { valid: false };
  const expected = crypto
    .createHmac("sha256", oauthStateSecret())
    .update(payload)
    .digest("base64url");
  if (sig.length !== expected.length) return { valid: false };
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return { valid: false };
  }
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      ts?: number;
      purpose?: string;
    };
    if (!data.ts || Date.now() - data.ts > 15 * 60 * 1000) return { valid: false };
    if (data.purpose !== "gmail") return { valid: false };
    return { valid: true };
  } catch {
    return { valid: false };
  }
}

export function buildGoogleAuthUrl(
  state: string,
  options?: { forceConsent?: boolean; origin?: string }
): string {
  const creds = getGoogleOAuthCredentials();
  if (!creds) throw new Error("Google OAuth is not configured");

  const params = new URLSearchParams({
    client_id: creds.clientId,
    redirect_uri: getOAuthRedirectUri(options?.origin),
    response_type: "code",
    access_type: "offline",
    include_granted_scopes: "true",
    scope: [GMAIL_SEND_SCOPE, EMAIL_SCOPE].join(" "),
    state,
  });

  if (options?.forceConsent) {
    params.set("prompt", "select_account consent");
  } else {
    params.set("prompt", "select_account");
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string, origin?: string) {
  const creds = getGoogleOAuthCredentials();
  if (!creds) throw new Error("Google OAuth is not configured");

  const body = new URLSearchParams({
    code,
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    redirect_uri: getOAuthRedirectUri(origin),
    grant_type: "authorization_code",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as {
    refresh_token?: string;
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Token exchange failed");
  }

  return data;
}

export async function fetchGoogleEmail(accessToken: string): Promise<string> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await res.json()) as { email?: string };
  if (!res.ok || !data.email) {
    throw new Error("Could not read Google account email");
  }
  return data.email.toLowerCase();
}
