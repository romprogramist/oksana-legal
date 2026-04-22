import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { makeRequest, readJson } from "../helpers/request";

import * as svcList from "@/app/api/admin/services/route";
import * as svcOne from "@/app/api/admin/services/[id]/route";
import * as svcReorder from "@/app/api/admin/services/reorder/route";
import * as priceList from "@/app/api/admin/prices/route";
import * as priceOne from "@/app/api/admin/prices/[id]/route";
import * as priceReorder from "@/app/api/admin/prices/reorder/route";
import * as faqList from "@/app/api/admin/faq/route";
import * as faqOne from "@/app/api/admin/faq/[id]/route";
import * as faqReorder from "@/app/api/admin/faq/reorder/route";
import * as docList from "@/app/api/admin/documents/route";
import * as docOne from "@/app/api/admin/documents/[id]/route";
import * as docReorder from "@/app/api/admin/documents/reorder/route";

type SectionDef = {
  name: string;
  table: () => any;
  handlers: {
    list: any; one: any; reorder: any;
  };
  sample: Record<string, any>;
  patch: Record<string, any>;
};

const SECTIONS: SectionDef[] = [
  {
    name: "services",
    table: () => prisma.service,
    handlers: { list: svcList, one: svcOne, reorder: svcReorder },
    sample: { title: "Test service", description: "Desc", imageUrl: "/uploads/services/x.webp", tags: ["a", "b"] },
    patch: { title: "Updated service" },
  },
  {
    name: "prices",
    table: () => prisma.priceItem,
    handlers: { list: priceList, one: priceOne, reorder: priceReorder },
    sample: { title: "Test price", note: "note", price: "100 ₽" },
    patch: { price: "200 ₽" },
  },
  {
    name: "faq",
    table: () => prisma.faqItem,
    handlers: { list: faqList, one: faqOne, reorder: faqReorder },
    sample: { question: "Test?", answer: "Yes." },
    patch: { answer: "Maybe." },
  },
  {
    name: "documents",
    table: () => prisma.documentSample,
    handlers: { list: docList, one: docOne, reorder: docReorder },
    sample: { title: "Test doc", description: null, fileUrl: "/uploads/documents/a.pdf", fileSize: 123 },
    patch: { title: "Renamed doc" },
  },
];

for (const s of SECTIONS) {
  describe(`${s.name} CRUD`, () => {
    beforeEach(async () => { await s.table().deleteMany({}); });

    it("round-trip: create, list, read, update, delete", async () => {
      const createReq = makeRequest(`/api/admin/${s.name}`, { method: "POST", body: s.sample });
      const createRes = await s.handlers.list.POST(createReq);
      expect(createRes.status).toBe(201);
      const created = await readJson(createRes);
      expect(created.id).toEqual(expect.any(Number));

      const listRes = await s.handlers.list.GET();
      expect(listRes.status).toBe(200);
      const list = await readJson(listRes);
      expect(list.length).toBe(1);

      const readReq = makeRequest(`/api/admin/${s.name}/${created.id}`);
      const readRes = await s.handlers.one.GET(readReq, { params: { id: String(created.id) } });
      expect(readRes.status).toBe(200);

      const patchReq = makeRequest(`/api/admin/${s.name}/${created.id}`, { method: "PATCH", body: s.patch });
      const patchRes = await s.handlers.one.PATCH(patchReq, { params: { id: String(created.id) } });
      expect(patchRes.status).toBe(200);

      const delReq = makeRequest(`/api/admin/${s.name}/${created.id}`, { method: "DELETE" });
      const delRes = await s.handlers.one.DELETE(delReq, { params: { id: String(created.id) } });
      expect(delRes.status).toBe(200);

      const list2 = await readJson(await s.handlers.list.GET());
      expect(list2.length).toBe(0);
    });

    it("reorder rewrites sortOrder deterministically", async () => {
      await s.table().deleteMany({});
      const ids: number[] = [];
      for (let i = 0; i < 3; i++) {
        const req = makeRequest(`/api/admin/${s.name}`, { method: "POST", body: { ...s.sample } });
        const created = await readJson(await s.handlers.list.POST(req));
        ids.push(created.id);
      }
      const reordered = [ids[2], ids[0], ids[1]];
      const reorderReq = makeRequest(`/api/admin/${s.name}/reorder`, { method: "POST", body: { ids: reordered } });
      const reorderRes = await s.handlers.reorder.POST(reorderReq);
      expect(reorderRes.status).toBe(200);

      const list = await readJson(await s.handlers.list.GET());
      expect(list.map((r: any) => r.id)).toEqual(reordered);
      expect(list.map((r: any) => r.sortOrder)).toEqual([10, 20, 30]);
    });

    it("returns 404 for unknown id on PATCH and DELETE", async () => {
      const patchRes = await s.handlers.one.PATCH(
        makeRequest(`/api/admin/${s.name}/999999`, { method: "PATCH", body: s.patch }),
        { params: { id: "999999" } }
      );
      expect(patchRes.status).toBe(404);
      const delRes = await s.handlers.one.DELETE(
        makeRequest(`/api/admin/${s.name}/999999`, { method: "DELETE" }),
        { params: { id: "999999" } }
      );
      expect(delRes.status).toBe(404);
    });

    it("rejects invalid body with 400", async () => {
      const req = makeRequest(`/api/admin/${s.name}`, { method: "POST", body: { garbage: true } });
      const res = await s.handlers.list.POST(req);
      expect(res.status).toBe(400);
    });
  });
}

import * as tList from "@/app/api/admin/testimonials/route";
import * as tOne from "@/app/api/admin/testimonials/[id]/route";
import * as tReorder from "@/app/api/admin/testimonials/reorder/route";

describe("testimonials CRUD (admin)", () => {
  beforeEach(async () => { await prisma.testimonial.deleteMany({}); });

  it("admin-created testimonial defaults to status=approved", async () => {
    const req = makeRequest("/api/admin/testimonials", {
      method: "POST",
      body: { name: "Иван", content: "Отличные услуги", rating: 5 },
    });
    const res = await tList.POST(req);
    expect(res.status).toBe(201);
    const body = await readJson(res);
    expect(body.status).toBe("approved");
  });

  it("reorder works", async () => {
    const ids: number[] = [];
    for (let i = 0; i < 3; i++) {
      const r = await tList.POST(makeRequest("/api/admin/testimonials", {
        method: "POST", body: { name: `T${i}`, content: "x".repeat(10), rating: 5 },
      }));
      ids.push((await readJson(r)).id);
    }
    const reordered = [ids[2], ids[0], ids[1]];
    await tReorder.POST(makeRequest("/api/admin/testimonials/reorder", { method: "POST", body: { ids: reordered } }));
    const list = await readJson(await tList.GET(makeRequest("/api/admin/testimonials", { method: "GET" })));
    expect(list.filter((x: any) => x.status === "approved").map((x: any) => x.id)).toEqual(reordered);
  });
});
