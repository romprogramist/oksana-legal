import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { POST, GET } from "@/app/api/testimonials/route";
import { makeRequest, readJson } from "../helpers/request";
import { resetReviewRateLimit } from "@/lib/rate-limit";

describe("POST /api/testimonials (public)", () => {
  beforeEach(async () => {
    await prisma.testimonial.deleteMany({});
    resetReviewRateLimit();
  });

  it("accepts a valid review and stores it as pending", async () => {
    const req = makeRequest("/api/testimonials", {
      method: "POST",
      body: { name: "Пётр", content: "Спасибо большое!", rating: 5 },
      headers: { "x-forwarded-for": "1.1.1.1" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);

    const stored = await prisma.testimonial.findFirst({ where: { name: "Пётр" } });
    expect(stored?.status).toBe("pending");
    expect(stored?.content).toBe("Спасибо большое!");
  });

  it("returns 400 with per-field errors on invalid input", async () => {
    const req = makeRequest("/api/testimonials", {
      method: "POST",
      body: { name: "x", content: "", rating: 0 },
      headers: { "x-forwarded-for": "1.1.1.2" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await readJson(res);
    expect(body.fields).toBeDefined();
    expect(body.fields.name || body.fields.content || body.fields.rating).toBeTruthy();
  });

  it("honeypot: silently accepts but does not store when 'website' is filled", async () => {
    const req = makeRequest("/api/testimonials", {
      method: "POST",
      body: { name: "Бот", content: "Hello I am a bot", rating: 5, website: "http://spam.example" },
      headers: { "x-forwarded-for": "1.1.1.3" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const count = await prisma.testimonial.count();
    expect(count).toBe(0);
  });

  it("rate-limits after 3 reviews from the same IP", async () => {
    const ip = "1.1.1.4";
    for (let i = 0; i < 3; i++) {
      const r = await POST(makeRequest("/api/testimonials", {
        method: "POST",
        body: { name: `Клиент ${i}`, content: "Хорошо", rating: 5 },
        headers: { "x-forwarded-for": ip },
      }));
      expect(r.status).toBe(201);
    }
    const rejected = await POST(makeRequest("/api/testimonials", {
      method: "POST",
      body: { name: "Четвёртый", content: "Тоже хорошо", rating: 5 },
      headers: { "x-forwarded-for": ip },
    }));
    expect(rejected.status).toBe(429);
  });

  it("trims whitespace from name and content", async () => {
    const req = makeRequest("/api/testimonials", {
      method: "POST",
      body: { name: "  Мария  ", content: "  отличный юрист  ", rating: 5 },
      headers: { "x-forwarded-for": "1.1.1.5" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const stored = await prisma.testimonial.findFirst({ where: { name: "Мария" } });
    expect(stored).not.toBeNull();
    expect(stored?.content).toBe("отличный юрист");
  });
});

describe("GET /api/testimonials (public)", () => {
  beforeEach(async () => { await prisma.testimonial.deleteMany({}); });

  it("returns only approved and active testimonials", async () => {
    await prisma.testimonial.createMany({
      data: [
        { name: "Approved", content: "ok", rating: 5, status: "approved", isActive: true },
        { name: "Pending", content: "ok", rating: 5, status: "pending", isActive: true },
        { name: "Rejected", content: "ok", rating: 5, status: "rejected", isActive: true },
        { name: "Hidden", content: "ok", rating: 5, status: "approved", isActive: false },
      ],
    });
    const res = await GET();
    const list = await readJson(res);
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("Approved");
  });
});
