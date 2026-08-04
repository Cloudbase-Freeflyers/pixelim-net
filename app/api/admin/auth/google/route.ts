import { NextResponse } from "next/server";
import {
  createAdminGoogleState,
  buildAdminGoogleAuthUrl,
  isGoogleLoginEnabled,
} from "@/lib/admin-google-auth";

export const runtime = "nodejs";

export async function GET() {
  if (!isGoogleLoginEnabled()) {
    return NextResponse.json(
      { error: "Google login is not configured" },
      { status: 400 }
    );
  }

  const state = createAdminGoogleState();
  const url = buildAdminGoogleAuthUrl(state);

  const res = NextResponse.redirect(url);
  res.cookies.set("pixelim_admin_google_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
