import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { GET } from "@/app/api/payment/status/route";
import { makeRequest, readJson } from "../helpers/request";

describe("GET /api/payment/status", () => {
  beforeEach(async () => {
    await prisma.payment.deleteMany({});
  });

  it("returns the current status by paymentLinkId", async () => {
    await prisma.payment.create({
      data: {
        paymentLinkId: "link-A",
        contractNumber: "C", firstName: "F", lastName: "L", phone: "+71234",
        amountKopecks: 100, status: "succeeded", paidAt: new Date(),
      },
    });
    const req = makeRequest("/api/payment/status?order=link-A", { method: "GET" });
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const body = await readJson(res);
    expect(body).toEqual({ status: "succeeded" });
  });

  it("returns 404 for an unknown order", async () => {
    const req = makeRequest("/api/payment/status?order=nope", { method: "GET" });
    const res = await GET(req as any);
    expect(res.status).toBe(404);
  });

  it("returns 400 when order param missing", async () => {
    const req = makeRequest("/api/payment/status", { method: "GET" });
    const res = await GET(req as any);
    expect(res.status).toBe(400);
  });
});
