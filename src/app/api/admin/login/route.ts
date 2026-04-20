import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  checkCredentials,
  newSessionToken,
  SESSION_COOKIE,
  SESSION_TTL_MS,
} from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  login: z.string().min(1).max(200),
  password: z.string().min(1).max(500),
});

function getIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const rate = checkRateLimit(ip);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many attempts" },
      { status: 429, headers: { "retry-after": String(Math.ceil(rate.retryAfterMs / 1000)) } }
    );
  }

  let parsed;
  try {
    parsed = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await new Promise((r) => setTimeout(r, 300)); // constant delay to blunt timing

  if (!checkCredentials(parsed.login, parsed.password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = newSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return res;
}
