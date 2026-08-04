import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

const PUBLIC_PATHS = [
  "/admin/login",
  "/api/admin/auth/password",
  "/api/admin/auth/logout",
  "/api/admin/auth/google",
  "/api/admin/auth/google/callback",
];

function isPublicAdminPath(path: string): boolean {
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Pass through public paths without auth check
  if (isPublicAdminPath(path)) {
    const res = NextResponse.next();
    res.headers.set("x-admin-route", "true");
    return res;
  }

  const session = await verifyAdminSessionToken(
    req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  );

  if (session) {
    const res = NextResponse.next();
    res.headers.set("x-admin-route", "true");
    return res;
  }

  // Unauthenticated API requests get 401
  if (path.startsWith("/api/admin/")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Unauthenticated page requests redirect to login
  const loginUrl = new URL("/admin/login", req.url);
  if (path !== "/admin/login") {
    loginUrl.searchParams.set("next", path);
  }
  return NextResponse.redirect(loginUrl);
}
