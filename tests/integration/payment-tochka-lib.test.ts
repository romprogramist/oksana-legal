import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { signTochkaWebhook, getTochkaTestPublicJwks } from "../helpers/tochka-keys";
import * as tochka from "@/lib/tochka";
import { __setPublicKeyForTesting, __clearPublicKeyOverrideForTesting, verifyWebhook } from "@/lib/tochka";

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
