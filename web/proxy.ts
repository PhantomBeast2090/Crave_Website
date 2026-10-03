import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Server-side role guard: every privileged server action re-checks via RLS/RPC,
// so this is a fast-path redirect, never the security boundary.
export async function proxy(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();
  try {
    const res = NextResponse.next();
    const sb = createServerClient(url, key, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      const login = req.nextUrl.clone();
      login.pathname = "/auth/login";
      login.searchParams.set("next", req.nextUrl.pathname);
      return NextResponse.redirect(login);
    }
    return res;
  } catch {
    // Fail open: pages render their own honest signed-out states.
    return NextResponse.next();
  }
}

export const config = { matcher: ["/checkout/:path*", "/orders/:path*", "/vendor/:path*", "/management/:path*", "/profile/:path*"] };
