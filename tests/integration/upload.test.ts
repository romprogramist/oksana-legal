import { describe, it, expect, beforeAll, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { POST as uploadRoute } from "@/app/api/admin/upload/route";
import { newSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { NextRequest } from "next/server";

const UPLOADS = path.resolve("uploads");

function makeUploadRequest(folder: string, file: { name: string; type: string; data: Buffer }, withAuth = true): NextRequest {
  const boundary = "----testboundary";
  const crlf = "\r\n";
  const chunks: Buffer[] = [];
  chunks.push(Buffer.from(`--${boundary}${crlf}Content-Disposition: form-data; name="folder"${crlf}${crlf}${folder}${crlf}`));
  chunks.push(Buffer.from(`--${boundary}${crlf}Content-Disposition: form-data; name="file"; filename="${file.name}"${crlf}Content-Type: ${file.type}${crlf}${crlf}`));
  chunks.push(file.data);
  chunks.push(Buffer.from(`${crlf}--${boundary}--${crlf}`));
  const body = Buffer.concat(chunks);
  const init: RequestInit = {
    method: "POST",
    body,
    headers: { "content-type": `multipart/form-data; boundary=${boundary}` },
  };
  const req = new NextRequest("http://localhost/api/admin/upload", init);
  if (withAuth) req.cookies.set(SESSION_COOKIE, newSessionToken());
  return req;
}

function makePng(): Buffer {
  // 1x1 PNG with proper image data
  return Buffer.from(
    "89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000970485973000003e8000003e801b57b526b0000000c49444154789c63f8cfc0000003010100c9fe92ef0000000049454e44ae426082",
    "hex"
  );
}

describe("POST /api/admin/upload", () => {
  afterEach(() => {
    for (const folder of ["services", "testimonials", "documents"]) {
      const dir = path.join(UPLOADS, folder);
      if (fs.existsSync(dir)) {
        for (const f of fs.readdirSync(dir)) {
          if (f !== ".gitkeep") fs.unlinkSync(path.join(dir, f));
        }
      }
    }
  });

  it("accepts valid PNG and returns a WebP URL", async () => {
    const req = makeUploadRequest("services", { name: "img.png", type: "image/png", data: makePng() });
    const res = await uploadRoute(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toMatch(/^\/uploads\/services\/[a-f0-9-]+\.webp$/);
    expect(body.size).toBeGreaterThan(0);
    const filePath = path.join(process.cwd(), body.url);
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("rejects SVG", async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    const req = makeUploadRequest("services", { name: "x.svg", type: "image/svg+xml", data: svg });
    const res = await uploadRoute(req);
    expect(res.status).toBe(415);
  });

  it("rejects file above size limit", async () => {
    const big = Buffer.alloc(6 * 1024 * 1024, 0); // 6 MB
    const req = makeUploadRequest("services", { name: "big.png", type: "image/png", data: big });
    const res = await uploadRoute(req);
    expect(res.status).toBe(413);
  });

  it("rejects unknown folder", async () => {
    const req = makeUploadRequest("evil", { name: "a.png", type: "image/png", data: makePng() });
    const res = await uploadRoute(req);
    expect(res.status).toBe(400);
  });
});
