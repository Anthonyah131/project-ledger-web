// proxy.ts
// Next.js Proxy (formerly middleware) — runs before every request
// Responsibilities:
//   - Route protection: redirect unauthenticated users to /login
//   - Auth redirects: redirect authenticated users away from /login, /register
//   - Token refresh: handle expired sessions
//   - Internationalization: detect and set locale (future)

import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
