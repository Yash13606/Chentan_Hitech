// NOTE: In Next.js 16, middleware.ts is renamed to proxy.ts
// Reference: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
// This file runs in the Edge runtime — no Prisma, no direct DB calls.
// Auth is checked via JWT decode only (fast, no DB hit).

import { auth } from "@/server/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ACCOUNT_PATHS = ["/portal"];
const PROTECTED_ADMIN_PATHS = ["/admin"];
const PROTECTED_SALES_PATHS = ["/crm"];
const AUTH_PATHS = ["/login", "/signup", "/forgot"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth();

  const isLoggedIn = !!session?.user?.id;
  const role = session?.user?.role;

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  // Protect customer portal
  if (PROTECTED_ACCOUNT_PATHS.some((p) => pathname.startsWith(p))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin routes
  if (PROTECTED_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Protect sales/CRM routes
  if (PROTECTED_SALES_PATHS.some((p) => pathname.startsWith(p))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!["SALES", "QUOTE_MGR", "ADMIN"].includes(role ?? "")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files, _next, and api routes
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
