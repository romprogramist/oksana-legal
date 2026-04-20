import { describe, it, expect, beforeEach } from "vitest";
import { signSession, verifySession, checkCredentials } from "@/lib/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

describe("auth cookie", () => {
  it("signs and verifies a valid session", () => {
    const token = signSession({ exp: Date.now() + 60_000 });
    expect(verifySession(token)).toEqual({ exp: expect.any(Number) });
  });

  it("rejects a tampered token", () => {
    const token = signSession({ exp: Date.now() + 60_000 });
    const tampered = token.slice(0, -2) + "xx";
    expect(verifySession(tampered)).toBeNull();
  });

  it("rejects an expired token", () => {
    const token = signSession({ exp: Date.now() - 1_000 });
    expect(verifySession(token)).toBeNull();
  });

  it("rejects a malformed token", () => {
    expect(verifySession("not-a-token")).toBeNull();
    expect(verifySession("")).toBeNull();
  });
});

describe("checkCredentials", () => {
  it("accepts matching login and password", () => {
    expect(checkCredentials("test_admin", "test_password_12345")).toBe(true);
  });
  it("rejects wrong login", () => {
    expect(checkCredentials("other_admin", "test_password_12345")).toBe(false);
  });
  it("rejects wrong password", () => {
    expect(checkCredentials("test_admin", "wrong")).toBe(false);
  });
  it("rejects empty strings", () => {
    expect(checkCredentials("", "")).toBe(false);
  });
});

describe("rate limit", () => {
  beforeEach(() => resetRateLimit());

  it("allows requests under the limit", () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit("1.2.3.4")).toEqual({ ok: true });
    }
  });

  it("blocks requests after 5 failures", () => {
    for (let i = 0; i < 5; i++) checkRateLimit("1.2.3.4");
    const res = checkRateLimit("1.2.3.4");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks IPs independently", () => {
    for (let i = 0; i < 5; i++) checkRateLimit("1.2.3.4");
    expect(checkRateLimit("5.6.7.8").ok).toBe(true);
  });
});

import { POST as loginRoute } from "@/app/api/admin/login/route";
import { POST as logoutRoute } from "@/app/api/admin/logout/route";
import { makeRequest, readJson } from "../helpers/request";

describe("POST /api/admin/login", () => {
  beforeEach(() => resetRateLimit());

  it("returns 200 and sets session cookie on valid credentials", async () => {
    const req = makeRequest("/api/admin/login", {
      method: "POST",
      body: { login: "test_admin", password: "test_password_12345" },
      headers: { "x-forwarded-for": "127.0.0.1" },
    });
    const res = await loginRoute(req);
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(/admin_session=/);
    expect(setCookie).toMatch(/HttpOnly/i);
  });

  it("returns 401 on invalid credentials", async () => {
    const req = makeRequest("/api/admin/login", {
      method: "POST",
      body: { login: "test_admin", password: "wrong" },
      headers: { "x-forwarded-for": "127.0.0.2" },
    });
    const res = await loginRoute(req);
    expect(res.status).toBe(401);
  });

  it("returns 429 after 5 failed attempts from same IP", async () => {
    for (let i = 0; i < 5; i++) {
      await loginRoute(makeRequest("/api/admin/login", {
        method: "POST",
        body: { login: "x", password: "y" },
        headers: { "x-forwarded-for": "127.0.0.3" },
      }));
    }
    const res = await loginRoute(makeRequest("/api/admin/login", {
      method: "POST",
      body: { login: "test_admin", password: "test_password_12345" },
      headers: { "x-forwarded-for": "127.0.0.3" },
    }));
    expect(res.status).toBe(429);
  });

  it("returns 400 on malformed body", async () => {
    const req = makeRequest("/api/admin/login", {
      method: "POST",
      body: { foo: "bar" },
      headers: { "x-forwarded-for": "127.0.0.4" },
    });
    const res = await loginRoute(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/admin/logout", () => {
  it("clears the session cookie", async () => {
    const req = makeRequest("/api/admin/logout", { method: "POST" });
    const res = await logoutRoute(req);
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(/admin_session=;/);
    expect(setCookie).toMatch(/Max-Age=0/i);
  });
});
