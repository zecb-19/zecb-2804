import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

function getSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https:",
    "frame-src https://js.stripe.com",
  ].join("; "),
};

function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(k, v);
  }
  return response;
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT) return false;
  return true;
}

function validateOrigin(request: NextRequest): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return true;
  const origin = request.headers.get("origin");
  if (origin) return origin.startsWith(appUrl);
  const referer = request.headers.get("referer");
  if (referer) return referer.startsWith(appUrl);
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    if (!checkRateLimit(ip)) {
      return withSecurityHeaders(
        NextResponse.json({ error: "Too many requests" }, { status: 429 }),
      );
    }

    if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
      if (!pathname.startsWith("/api/stripe/")) {
        if (!validateOrigin(request)) {
          return withSecurityHeaders(
            NextResponse.json({ error: "Invalid origin" }, { status: 403 }),
          );
        }
      }
    }
  }

  if (pathname.startsWith("/dashboard")) {
    const session = request.cookies.get("zecb_session");
    if (!session?.value) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    try {
      await jwtVerify(session.value, getSecret(), { algorithms: ["HS256"] });
    } catch {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  const tenantProtected =
    /^\/product\/[^/]+\/(dashboard|alerts|rules|settings|sources|timeline)/.test(
      pathname,
    );
  if (tenantProtected) {
    const session = request.cookies.get("zecb_tenant_session");
    if (!session?.value) {
      const slug = pathname.split("/")[2];
      return NextResponse.redirect(new URL(`/product/${slug}`, request.url));
    }
    try {
      await jwtVerify(session.value, getSecret(), { algorithms: ["HS256"] });
    } catch {
      const slug = pathname.split("/")[2];
      return NextResponse.redirect(new URL(`/product/${slug}`, request.url));
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/dashboard/:path*", "/product/:path*", "/api/:path*"],
};
