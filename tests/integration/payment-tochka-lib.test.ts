import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { signTochkaWebhook, getTochkaTestPublicJwks } from "../helpers/tochka-keys";
import * as tochka from "@/lib/tochka";
import { __setPublicKeyForTesting, __clearPublicKeyOverrideForTesting, verifyWebhook, buildCreatePaymentBody, createPayment } from "@/lib/tochka";

describe("getTochkaPublicKey", () => {
  beforeEach(() => {
    tochka.__resetPublicKeyCacheForTesting();
  });

  it("fetches and caches the JWKS from TOCHKA_PUBLIC_KEY_URL", async () => {
    const jwks = await getTochkaTestPublicJwks();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(jwks), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const a = await tochka.getTochkaPublicKey();
    const b = await tochka.getTochkaPublicKey();

    expect(a).toBeDefined();
    expect(b).toBe(a);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });

  it("throws if the upstream returns non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("nope", { status: 503 }))
    );
    await expect(tochka.getTochkaPublicKey()).rejects.toThrow(/public key/i);
    vi.unstubAllGlobals();
  });
});

describe("verifyWebhook", () => {
  beforeEach(async () => {
    __setPublicKeyForTesting(await getTochkaTestPublicJwks());
  });
  afterEach(() => {
    __clearPublicKeyOverrideForTesting();
  });

  it("returns the payload when signature is valid", async () => {
    const jwt = await signTochkaWebhook({
      webhookType: "acquiringInternetPayment",
      customerCode: "305042189",
      operationId: "op-1",
      paymentLinkId: "link-1",
      amount: "100.00",
      status: "APPROVED",
    });
    const payload = await verifyWebhook(jwt);
    expect(payload.operationId).toBe("op-1");
    expect(payload.status).toBe("APPROVED");
  });

  it("throws on tampered signature", async () => {
    const good = await signTochkaWebhook({ webhookType: "acquiringInternetPayment" });
    const tampered = good.slice(0, -2) + (good.endsWith("AA") ? "BB" : "AA");
    await expect(verifyWebhook(tampered)).rejects.toThrow();
  });

  it("throws on garbage input", async () => {
    await expect(verifyWebhook("not-a-jwt")).rejects.toThrow();
    await expect(verifyWebhook("")).rejects.toThrow();
  });
});

describe("buildCreatePaymentBody", () => {
  it("packs the form fields into Tochka's payload shape", () => {
    const body = buildCreatePaymentBody({
      paymentLinkId: "link-1",
      amountRub: 1500,
      contractNumber: "К-42",
      firstName: "Иван",
      lastName: "Иванов",
      phone: "+7 (999) 123-45-67",
      email: "ivan@example.com",
      successUrl: "https://example.com/payment?status=success&order=link-1",
      failUrl: "https://example.com/payment?status=fail&order=link-1",
    });
    expect(body).toEqual({
      Data: {
        customerCode: "305042189",
        amount: "1500.00",
        purpose: "Оплата по договору №К-42 — Иван Иванов",
        redirectUrl: "https://example.com/payment?status=success&order=link-1",
        failRedirectUrl: "https://example.com/payment?status=fail&order=link-1",
        paymentMode: ["card", "sbp", "tinkoff"],
        paymentLinkId: "link-1",
        Client: { email: "ivan@example.com", phone: "+7 (999) 123-45-67" },
        Items: [
          {
            name: "Юридические услуги по договору №К-42",
            amount: "1500.00",
            quantity: 1.0,
            vatType: "none",
            paymentMethod: "full_payment",
            paymentObject: "service",
            measure: "шт.",
          },
        ],
        taxSystemCode: "usn_income",
      },
    });
  });

  it("formats decimals correctly (e.g. 99.5 → 99.50)", () => {
    const body = buildCreatePaymentBody({
      paymentLinkId: "x",
      amountRub: 99.5,
      contractNumber: "C",
      firstName: "F",
      lastName: "L",
      phone: "+7",
      successUrl: "https://x/s",
      failUrl: "https://x/f",
    });
    expect(body.Data.amount).toBe("99.50");
    expect(body.Data.Items[0].amount).toBe("99.50");
  });

  it("omits Client.email when not provided", () => {
    const body = buildCreatePaymentBody({
      paymentLinkId: "x",
      amountRub: 100,
      contractNumber: "C",
      firstName: "F",
      lastName: "L",
      phone: "+7",
      successUrl: "https://x/s",
      failUrl: "https://x/f",
    });
    expect(body.Data.Client).toEqual({ phone: "+7" });
  });
});

describe("createPayment", () => {
  beforeEach(() => {
    process.env.TOCHKA_JWT_TOKEN = "fake-jwt";
    process.env.TOCHKA_API_URL = "https://api.example.com/uapi/acquiring/v1.0";
  });

  it("POSTs to /payments_with_receipt with Bearer auth and returns paymentLink/operationId", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ Data: { paymentLink: "https://pay.example/123", operationId: "OP-1" } }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await createPayment({
      paymentLinkId: "link-1",
      amountRub: 100,
      contractNumber: "C",
      firstName: "F",
      lastName: "L",
      phone: "+7",
      successUrl: "https://x/s",
      failUrl: "https://x/f",
    });

    expect(result).toEqual({ paymentLink: "https://pay.example/123", operationId: "OP-1" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.example.com/uapi/acquiring/v1.0/payments_with_receipt");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer fake-jwt");
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
    expect(init.method).toBe("POST");

    vi.unstubAllGlobals();
  });

  it("throws TochkaError with message from upstream on non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ Errors: [{ message: "Invalid amount" }] }),
          { status: 400, headers: { "content-type": "application/json" } }
        )
      )
    );

    await expect(
      createPayment({
        paymentLinkId: "x",
        amountRub: 0,
        contractNumber: "C",
        firstName: "F",
        lastName: "L",
        phone: "+7",
        successUrl: "https://x/s",
        failUrl: "https://x/f",
      })
    ).rejects.toThrow(/Invalid amount/);
    vi.unstubAllGlobals();
  });
});
