import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-change-me",
);
const COOKIE_NAME = "zecb_tenant_session";

export type TenantSession = {
  tenantId: string;
  productId: string;
  productSlug: string;
  email: string;
  name: string;
};

export async function createTenantSession(
  data: TenantSession,
): Promise<void> {
  const jwt = await new SignJWT(data as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET);

  const jar = await cookies();
  jar.set(COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function readTenantSession(): Promise<TenantSession | null> {
  const jar = await cookies();
  const cookie = jar.get(COOKIE_NAME);
  if (!cookie?.value) return null;

  try {
    const { payload } = await jwtVerify(cookie.value, SECRET);
    return payload as unknown as TenantSession;
  } catch {
    return null;
  }
}

export async function deleteTenantSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
