const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

type Entry = { count: number; firstFailureAt: number };
const store = new Map<string, Entry>();

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterMs: number };

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(ip);
  if (!entry || now - entry.firstFailureAt > WINDOW_MS) {
    store.set(ip, { count: 1, firstFailureAt: now });
    return { ok: true };
  }
  if (entry.count < MAX_FAILURES) {
    entry.count += 1;
    return { ok: true };
  }
  return { ok: false, retryAfterMs: WINDOW_MS - (now - entry.firstFailureAt) };
}

export function resetRateLimit(ip?: string) {
  if (ip) store.delete(ip);
  else store.clear();
}
