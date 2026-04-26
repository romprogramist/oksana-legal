import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { POST } from "@/app/api/payment/init/route";
import { makeRequest, readJson } from "../helpers/request";
import { resetRateLimit } from "@/lib/rate-limit";

describe("POST /api/payment/init", () => {
  beforeEach(async () => {
    process.env.TOCHKA_JWT_TOKEN = "fake-jwt";
    process.env.TOCHKA_API_URL = "https://api.example.com/uapi/acquiring/v1.0";
    await prisma.payment.deleteMany({});
    resetRateLimit();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function mockTochkaSuccess(opId = "OP-1") {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ Data: { paymentLink: "https://pay.example/" + opId, operationId: opId } }),
            { status: 200, headers: { "content-type": "application/json" } }
          )
        )
      )
    );
  }

  it("creates a Payment row, calls Tochka, returns paymentLink", async () => {
    mockTochkaSuccess("OP-1");
    const req = makeRequest("/api/payment/init", {
      method: "POST",
      body: {
        amount: 1500,
        contractNumber: "К-42",
        firstName: "Иван",
        lastName: "Иванов",
        phone: "+7 (999) 123-45-67",
        email: "ivan@example.com",
      },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const body = await readJson(res);
    expect(body.paymentLink).toBe("https://pay.example/OP-1");
    expect(body.orderId).toBeTypeOf("string");

    const stored = await prisma.payment.findFirst({ where: { contractNumber: "К-42" } });
    expect(stored).not.toBeNull();
    expect(stored!.status).toBe("pending");
    expect(stored!.operationId).toBe("OP-1");
    expect(stored!.amountKopecks).toBe(150000);
  });

  it("rejects invalid input with 400", async () => {
    const req = makeRequest("/api/payment/init", {
      method: "POST",
      body: { amount: -1, contractNumber: "", firstName: "", lastName: "", phone: "" },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it("returns 502 when Tochka responds with error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ Errors: [{ message: "Bad request" }] }), { status: 400 })
      )
    );
    const req = makeRequest("/api/payment/init", {
      method: "POST",
      body: {
        amount: 100, contractNumber: "C", firstName: "F", lastName: "L", phone: "+71234",
      },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(502);
  });

  it("returns 503 when TOCHKA_JWT_TOKEN is missing", async () => {
    delete process.env.TOCHKA_JWT_TOKEN;
    const req = makeRequest("/api/payment/init", {
      method: "POST",
      body: {
        amount: 100, contractNumber: "C", firstName: "F", lastName: "L", phone: "+71234",
      },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(503);
  });

  it("dedupes double-click within 30s — returns same paymentLink, no extra DB row", async () => {
    mockTochkaSuccess("OP-DEDUP");
    const payload = {
      amount: 100, contractNumber: "DEDUP", firstName: "F", lastName: "L", phone: "+79991112233",
    };
    const r1 = await POST(makeRequest("/api/payment/init", { method: "POST", body: payload }) as any);
    const r2 = await POST(makeRequest("/api/payment/init", { method: "POST", body: payload }) as any);

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    const b1 = await readJson(r1);
    const b2 = await readJson(r2);
    expect(b2.paymentLink).toBe(b1.paymentLink);

    const count = await prisma.payment.count({ where: { contractNumber: "DEDUP" } });
    expect(count).toBe(1);
  });

  it("rate-limits the same IP after 5 init requests", async () => {
    mockTochkaSuccess("OP-RL");
    const ip = "9.9.9.9";
    const payloadFor = (i: number) => ({
      amount: 100,
      contractNumber: `RL-${i}`,
      firstName: "F",
      lastName: "L",
      phone: "+71234",
    });
    for (let i = 0; i < 5; i++) {
      const r = await POST(makeRequest("/api/payment/init", {
        method: "POST",
        body: payloadFor(i),
        headers: { "x-forwarded-for": ip },
      }) as any);
      expect(r.status).toBe(200);
    }
    const blocked = await POST(makeRequest("/api/payment/init", {
      method: "POST",
      body: payloadFor(6),
      headers: { "x-forwarded-for": ip },
    }) as any);
    expect(blocked.status).toBe(429);
  });
});
