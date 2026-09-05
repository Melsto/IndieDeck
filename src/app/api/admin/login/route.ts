import { NextResponse } from "next/server";
import { adminSessionCookie, isValidAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { password } = await request.json();
  if (typeof password !== "string" || !isValidAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  const cookie = adminSessionCookie();
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}