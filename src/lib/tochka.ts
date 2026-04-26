import { createLocalJWKSet, jwtVerify, type JWK } from "jose";

type CachedJwks = {
  set: ReturnType<typeof createLocalJWKSet>;
  fetchedAt: number;
};

const CACHE_TTL_MS = 60 * 60 * 1000;
let cached: CachedJwks | null = null;
let testOverride: ReturnType<typeof createLocalJWKSet> | null = null;

function getPublicKeyUrl(): string {
  return (
    process.env.TOCHKA_PUBLIC_KEY_URL ??
    "https://enter.tochka.com/doc/openapi/static/keys/public"
  );
}

export async function getTochkaPublicKey() {
  if (testOverride) return testOverride;
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.set;

  const res = await fetch(getPublicKeyUrl(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Tochka public key (${res.status})`);
  }
  const json = (await res.json()) as { keys: JWK[] };
  const set = createLocalJWKSet(json);
  cached = { set, fetchedAt: Date.now() };
  return set;
}

export function __resetPublicKeyCacheForTesting() {
  cached = null;
}

export function __setPublicKeyForTesting(jwks: { keys: JWK[] }) {
  testOverride = createLocalJWKSet(jwks);
}

export function __clearPublicKeyOverrideForTesting() {
  testOverride = null;
}

export type TochkaWebhookPayload = {
  webhookType: string;
  customerCode?: string;
  operationId?: string;
  paymentLinkId?: string;
  amount?: string;
  purpose?: string;
  merchantId?: string;
  status?: string;
  paymentType?: string;
  consumerId?: string;
};

export async function verifyWebhook(jwtString: string): Promise<TochkaWebhookPayload> {
  const trimmed = (jwtString ?? "").trim();
  if (!trimmed) throw new Error("Empty webhook body");
  const keySet = await getTochkaPublicKey();
  const { payload } = await jwtVerify(trimmed, keySet, { algorithms: ["RS256"] });
  return payload as TochkaWebhookPayload;
}

const CUSTOMER_CODE = "305042189";
const TAX_SYSTEM_CODE = "usn_income";

export type CreatePaymentParams = {
  paymentLinkId: string;
  amountRub: number;
  contractNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  successUrl: string;
  failUrl: string;
};

export type TochkaPaymentResult = {
  paymentLink: string;
  operationId: string;
};

export class TochkaError extends Error {
  constructor(message: string, readonly upstreamStatus: number) {
    super(message);
    this.name = "TochkaError";
  }
}

function formatAmount(rub: number): string {
  return rub.toFixed(2);
}

export function buildCreatePaymentBody(p: CreatePaymentParams) {
  const amount = formatAmount(p.amountRub);
  const client: { email?: string; phone: string } = { phone: p.phone };
  if (p.email) client.email = p.email;

  return {
    Data: {
      customerCode: CUSTOMER_CODE,
      amount,
      purpose: `Оплата по договору №${p.contractNumber} — ${p.firstName} ${p.lastName}`,
      redirectUrl: p.successUrl,
      failRedirectUrl: p.failUrl,
      paymentMode: ["card", "sbp", "tinkoff"],
      paymentLinkId: p.paymentLinkId,
      Client: client,
      Items: [
        {
          name: `Юридические услуги по договору №${p.contractNumber}`,
          amount,
          quantity: 1.0,
          vatType: "none",
          paymentMethod: "full_payment",
          paymentObject: "service",
          measure: "шт",
        },
      ],
      taxSystemCode: TAX_SYSTEM_CODE,
    },
  };
}

function getApiUrl(): string {
  return (
    process.env.TOCHKA_API_URL ??
    "https://enter.tochka.com/uapi/acquiring/v1.0"
  ).replace(/\/$/, "");
}

function getJwt(): string {
  const t = process.env.TOCHKA_JWT_TOKEN;
  if (!t) throw new Error("TOCHKA_JWT_TOKEN not set");
  return t;
}

export async function createPayment(p: CreatePaymentParams): Promise<TochkaPaymentResult> {
  const body = buildCreatePaymentBody(p);
  const res = await fetch(`${getApiUrl()}/payments_with_receipt`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getJwt()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = null; }

  if (!res.ok) {
    const upstreamMsg =
      (json?.Errors?.[0]?.message as string | undefined) ??
      (json?.message as string | undefined) ??
      `Tochka API ${res.status}`;
    throw new TochkaError(upstreamMsg, res.status);
  }

  const link = json?.Data?.paymentLink as string | undefined;
  const opId = json?.Data?.operationId as string | undefined;
  if (!link || !opId) {
    throw new TochkaError("Tochka response missing paymentLink/operationId", res.status);
  }
  return { paymentLink: link, operationId: opId };
}
