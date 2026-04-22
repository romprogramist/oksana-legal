import { describe, it, expect, beforeEach } from "vitest";
import { checkReviewRateLimit, resetReviewRateLimit } from "@/lib/rate-limit";

describe("review rate limit", () => {
  beforeEach(() => resetReviewRateLimit());

  it("allows up to 3 requests in the window", () => {
    for (let i = 0; i < 3; i++) {
      expect(checkReviewRateLimit("9.9.9.9")).toEqual({ ok: true });
    }
  });

  it("blocks the 4th request with retry-after", () => {
    for (let i = 0; i < 3; i++) checkReviewRateLimit("9.9.9.9");
    const res = checkReviewRateLimit("9.9.9.9");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks IPs independently", () => {
    for (let i = 0; i < 3; i++) checkReviewRateLimit("9.9.9.9");
    expect(checkReviewRateLimit("8.8.8.8").ok).toBe(true);
  });

  it("uses a separate store from checkRateLimit (login)", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    for (let i = 0; i < 3; i++) checkReviewRateLimit("7.7.7.7");
    expect(checkReviewRateLimit("7.7.7.7").ok).toBe(false);
    expect(checkRateLimit("7.7.7.7").ok).toBe(true);
  });
});
