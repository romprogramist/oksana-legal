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

const REVIEW_WINDOW_MS = 60 * 60 * 1000;
const REVIEW_MAX_PER_WINDOW = 3;
const reviewStore = new Map<string, number[]>();

export function checkReviewRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const timestamps = (reviewStore.get(ip) ?? []).filter((t) => now - t < REVIEW_WINDOW_MS);
  if (timestamps.length >= REVIEW_MAX_PER_WINDOW) {
    const oldest = timestamps[0];
    return { ok: false, retryAfterMs: REVIEW_WINDOW_MS - (now - oldest) };
  }
  timestamps.push(now);
  reviewStore.set(ip, timestamps);
  return { ok: true };
}

export function resetReviewRateLimit(ip?: string) {
  if (ip) reviewStore.delete(ip);
  else reviewStore.clear();
}

const PAYMENT_WINDOW_MS = 15 * 60 * 1000;
const PAYMENT_MAX_PER_WINDOW = 5;
const paymentStore = new Map<string, number[]>();

export function checkPaymentRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const timestamps = (paymentStore.get(ip) ?? []).filter((t) => now - t < PAYMENT_WINDOW_MS);
  if (timestamps.length >= PAYMENT_MAX_PER_WINDOW) {
    const oldest = timestamps[0];
    return { ok: false, retryAfterMs: PAYMENT_WINDOW_MS - (now - oldest) };
  }
  timestamps.push(now);
  paymentStore.set(ip, timestamps);
  return { ok: true };
}

export function resetPaymentRateLimit(ip?: string) {
  if (ip) paymentStore.delete(ip);
  else paymentStore.clear();
}
