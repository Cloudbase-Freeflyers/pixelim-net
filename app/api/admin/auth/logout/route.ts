import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, adminSessionCookieOptions } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://pixelim.net";
  const res = NextResponse.redirect(`${siteUrl}/admin/login`);
  res.cookies.set(ADMIN_SESSION_COOKIE, "", { ...adminSessionCookieOptions(0), maxAge: 0 });
  return res;
}
