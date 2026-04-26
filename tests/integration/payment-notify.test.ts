import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { POST } from "@/app/api/payment/notify/route";
import { makeRequest } from "../helpers/request";
import { signTochkaWebhook, getTochkaTestPublicJwks } from "../helpers/tochka-keys";
import {
  __setPublicKeyForTesting,
  __clearPublicKeyOverrideForTesting,
} from "@/lib/tochka";

describe("POST /api/payment/notify", () => {
  beforeEach(async () => {
    __setPublicKeyForTesting(await getTochkaTestPublicJwks());
    await prisma.payment.deleteMany({});
    await prisma.payment.create({
      data: {
        paymentLinkId: "link-1",
        operationId: "OP-1",
        contractNumber: "C",
        firstName: "F",
        lastName: "L",
        phone: "+7",
        amountKopecks: 10000,
        status: "pending",
      },
    });
  });
  afterEach(() => {
    __clearPublicKeyOverrideForTesting();
  });

  async function postSigned(payload: object) {
    const jwt = await signTochkaWebhook(payload as any);
    const req = makeRequest("/api/payment/notify", {
      method: "POST",
      body: jwt,
      headers: { "content-type": "text/plain" },
    });
    return POST(req as any);
  }

  it("APPROVED → succeeded + paidAt set", async () => {
    const res = await postSigned({
      webhookType: "acquiringInternetPayment",
      customerCode: "305042189",
      operationId: "OP-1",
      paymentLinkId: "link-1",
      amount: "100.00",
      status: "APPROVED",
    });
    expect(res.status).toBe(200);
    const row = await prisma.payment.findUnique({ where: { paymentLinkId: "link-1" } });
    expect(row!.status).toBe("succeeded");
    expect(row!.paidAt).toBeInstanceOf(Date);
  });

  it("AUTHORIZED → authorized (intermediate)", async () => {
    await postSigned({
      webhookType: "acquiringInternetPayment",
      customerCode: "305042189",
      operationId: "OP-1",
      paymentLinkId: "link-1",
      status: "AUTHORIZED",
    });
    const row = await prisma.payment.findUnique({ where: { paymentLinkId: "link-1" } });
    expect(row!.status).toBe("authorized");
  });

  it("REVERSED → failed", async () => {
    await postSigned({
      webhookType: "acquiringInternetPayment",
      customerCode: "305042189",
      operationId: "OP-1",
      paymentLinkId: "link-1",
      status: "REVERSED",
    });
    const row = await prisma.payment.findUnique({ where: { paymentLinkId: "link-1" } });
    expect(row!.status).toBe("failed");
  });

  it("invalid signature → 401, status untouched", async () => {
    const req = makeRequest("/api/payment/notify", {
      method: "POST",
      body: "totally.not.a.jwt",
      headers: { "content-type": "text/plain" },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
    const row = await prisma.payment.findUnique({ where: { paymentLinkId: "link-1" } });
    expect(row!.status).toBe("pending");
  });

  it("wrong customerCode → 400, status untouched", async () => {
    const res = await postSigned({
      webhookType: "acquiringInternetPayment",
      customerCode: "999999999",
      operationId: "OP-1",
      paymentLinkId: "link-1",
      status: "APPROVED",
    });
    expect(res.status).toBe(400);
    const row = await prisma.payment.findUnique({ where: { paymentLinkId: "link-1" } });
    expect(row!.status).toBe("pending");
  });

  it("unknown operationId → 200 (no-op), no DB writes", async () => {
    const res = await postSigned({
      webhookType: "acquiringInternetPayment",
      customerCode: "305042189",
      operationId: "OP-UNKNOWN",
      paymentLinkId: "link-unknown",
      status: "APPROVED",
    });
    expect(res.status).toBe(200);
    const row = await prisma.payment.findUnique({ where: { paymentLinkId: "link-1" } });
    expect(row!.status).toBe("pending");
  });

  it("idempotent: replay of APPROVED does not re-set paidAt", async () => {
    await postSigned({
      webhookType: "acquiringInternetPayment", customerCode: "305042189",
      operationId: "OP-1", paymentLinkId: "link-1", status: "APPROVED",
    });
    const first = await prisma.payment.findUnique({ where: { paymentLinkId: "link-1" } });
    const firstPaidAt = first!.paidAt;

    await new Promise((r) => setTimeout(r, 5));

    await postSigned({
      webhookType: "acquiringInternetPayment", customerCode: "305042189",
      operationId: "OP-1", paymentLinkId: "link-1", status: "APPROVED",
    });
    const second = await prisma.payment.findUnique({ where: { paymentLinkId: "link-1" } });
    expect(second!.paidAt!.getTime()).toBe(firstPaidAt!.getTime());
    expect(second!.status).toBe("succeeded");
  });
});
