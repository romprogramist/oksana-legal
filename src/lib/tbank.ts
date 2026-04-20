import { createHash } from "crypto";

const TBANK_API_URL =
  process.env.TBANK_API_URL ?? "https://securepay.tinkoff.ru/v2";

export type TBankInitParams = {
  amountRub: number;
  orderId: string;
  description?: string;
  customerKey?: string;
  email?: string;
  phone?: string;
  successUrl?: string;
  failUrl?: string;
  notificationUrl?: string;
};

export type TBankInitResponse = {
  Success: boolean;
  ErrorCode: string;
  Message?: string;
  Details?: string;
  TerminalKey?: string;
  Status?: string;
  PaymentId?: string;
  OrderId?: string;
  Amount?: number;
  PaymentURL?: string;
};

function getCredentials() {
  const terminalKey = process.env.TBANK_TERMINAL_KEY;
  const password = process.env.TBANK_PASSWORD;
  if (!terminalKey || !password) {
    throw new Error(
      "TBANK_TERMINAL_KEY and TBANK_PASSWORD must be set in environment",
    );
  }
  return { terminalKey, password };
}

function signToken(
  payload: Record<string, string | number | boolean>,
  password: string,
): string {
  const entries: Array<[string, string]> = Object.entries(payload)
    .filter(([, value]) => typeof value !== "object")
    .map(([key, value]) => [key, String(value)]);
  entries.push(["Password", password]);
  entries.sort(([a], [b]) => a.localeCompare(b));
  const concatenated = entries.map(([, value]) => value).join("");
  return createHash("sha256").update(concatenated).digest("hex");
}

export async function initPayment(
  params: TBankInitParams,
): Promise<TBankInitResponse> {
  const { terminalKey, password } = getCredentials();

  const rootPayload: Record<string, string | number> = {
    TerminalKey: terminalKey,
    Amount: Math.round(params.amountRub * 100),
    OrderId: params.orderId,
  };
  if (params.description) rootPayload.Description = params.description;
  if (params.customerKey) rootPayload.CustomerKey = params.customerKey;
  if (params.successUrl) rootPayload.SuccessURL = params.successUrl;
  if (params.failUrl) rootPayload.FailURL = params.failUrl;
  if (params.notificationUrl)
    rootPayload.NotificationURL = params.notificationUrl;

  const token = signToken(rootPayload, password);

  const body: Record<string, unknown> = { ...rootPayload, Token: token };

  if (params.email || params.phone) {
    body.DATA = {
      ...(params.email ? { Email: params.email } : {}),
      ...(params.phone ? { Phone: params.phone } : {}),
    };
  }

  const response = await fetch(`${TBANK_API_URL}/Init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`T-Bank API returned ${response.status}`);
  }

  return (await response.json()) as TBankInitResponse;
}
