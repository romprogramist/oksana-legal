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
