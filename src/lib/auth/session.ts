import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const SESSION_COOKIE = "zecb_session";
const SESSION_TTL_DEFAULT_MS = 24 * 60 * 60 * 1000;
const SESSION_TTL_REMEMBER_MS = 30 * 24 * 60 * 60 * 1000;

function getSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

export type UserRole = "operator" | "subscriber" | "admin";

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
};

async function encrypt(payload: SessionPayload, expiresAt: Date): Promise<string> {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecret());
}

async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string" || typeof payload.email !== "string") {
      return null;
    }
    const role = typeof payload.role === "string" ? payload.role as UserRole : "operator";
    return {
      userId: payload.userId,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : "",
      role,
    };
  } catch {
    return null;
  }
}

export async function createSession(
  p: SessionPayload,
  opts: { remember?: boolean } = {},
): Promise<void> {
  const ttl = opts.remember ? SESSION_TTL_REMEMBER_MS : SESSION_TTL_DEFAULT_MS;
  const expiresAt = new Date(Date.now() + ttl);
  const token = await encrypt(p, expiresAt);
  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSession(): Promise<void> {
  const c = await cookies();
  c.delete(SESSION_COOKIE);
}

export async function readSession(): Promise<SessionPayload | null> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  return decrypt(token);
}
