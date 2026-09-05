import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "indiedeck_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8;

function configuredPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function signatureFor(expiresAt: string) {
  const password = configuredPassword();
  return password
    ? createHmac("sha256", password).update(`indiedeck-admin-session:${expiresAt}`).digest("hex")
    : "";
}

export function isValidAdminPassword(candidate: string) {
  const password = configuredPassword();
  return Boolean(password) && candidate.length === password.length && timingSafeEqual(Buffer.from(candidate), Buffer.from(password));
}

export async function isAdminSession() {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return false;
  const [expiresAt, signature] = value.split(".");
  if (!expiresAt || !signature || Number(expiresAt) <= Date.now()) return false;
  const expected = signatureFor(expiresAt);
  return Boolean(expected && signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected)));
}

export function adminSessionCookie() {
  const expiresAt = String(Date.now() + MAX_AGE_SECONDS * 1000);
  return {
    name: COOKIE_NAME,
    value: `${expiresAt}.${signatureFor(expiresAt)}`,
    options: { httpOnly: true, sameSite: "strict" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE_SECONDS },
  };
}