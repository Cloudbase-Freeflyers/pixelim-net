import { NextResponse } from "next/server";
import {
  adminSessionCookieOptions,
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
} from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const expectedPassword = process.env.ADMIN_PASSWORD?.trim();
  const expectedUsername = process.env.ADMIN_USERNAME?.trim();

  if (!expectedPassword) {
    return NextResponse.json(
      { ok: false, error: "Password login is not configured" },
      { status: 503 }
    );
  }

  let body: { username?: string; password?: string; next?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // Validate username only if ADMIN_USERNAME is configured
  if (expectedUsername && body.username?.trim().toLowerCase() !== expectedUsername.toLowerCase()) {
    return NextResponse.json(
      { ok: false, error: "Incorrect username or password" },
      { status: 401 }
    );
  }

  if (body.password !== expectedPassword) {
    return NextResponse.json(
      { ok: false, error: "Incorrect username or password" },
      { status: 401 }
    );
  }

  const identifier = body.username?.trim().toLowerCase() || "admin@password";
  const next =
    body.next && body.next.startsWith("/admin") ? body.next : "/admin";
  const token = await createAdminSessionToken(identifier);
  const res = NextResponse.json({ ok: true, next });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions());
  return res;
}
