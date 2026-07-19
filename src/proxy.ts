import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { updateSupabaseSession } from "@/lib/supabase/proxy";

const protectedPrefixes = ["/dashboard", "/trips", "/policy", "/connections", "/account", "/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedRoute = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!isSupabaseConfigured()) {
    if (!protectedRoute) return NextResponse.next();
    return NextResponse.redirect(new URL("/login?error=configuration", request.url));
  }

  const { response, user } = await updateSupabaseSession(request);
  if (protectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (pathname.startsWith("/admin") && user?.app_metadata.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (pathname === "/login" && user) {
    return NextResponse.redirect(
      new URL(user.app_metadata.role === "admin" ? "/admin" : "/dashboard", request.url),
    );
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|offline.html|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
