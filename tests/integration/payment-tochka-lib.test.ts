import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getTochkaTestPublicJwks } from "../helpers/tochka-keys";
import * as tochka from "@/lib/tochka";

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
