import { NextResponse, type NextRequest } from "next/server";

// Role guard skeleton: real role comes from Supabase session (profiles.role).
// Never UI-only: every privileged server action re-checks via RLS/RPC.
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const needsAuth =
    path.startsWith("/checkout") || path.startsWith("/orders") ||
    path.startsWith("/vendor") || path.startsWith("/management") ||
    path.startsWith("/profile");
  if (!needsAuth) return NextResponse.next();
  // Demo mode: allow through (pages show honest demo state).
  // Live: read session via @supabase/ssr, redirect to /auth/login?next=path when absent,
  // and enforce STUDENT/VENDOR/ADMIN per prefix.
  return NextResponse.next();
}

export const config = { matcher: ["/checkout/:path*", "/orders/:path*", "/vendor/:path*", "/management/:path*", "/profile/:path*"] };
