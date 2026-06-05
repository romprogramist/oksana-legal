import { describe, it, expect, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { GET as serveUpload } from "@/app/uploads/[...path]/route";
import { NextRequest } from "next/server";

const UPLOADS = path.resolve("public/uploads");

function call(segments: string[]) {
  const req = new NextRequest("http://localhost/uploads/" + segments.join("/"));
  return serveUpload(req, { params: { path: segments } });
}

describe("GET /uploads/[...path] (runtime file serving)", () => {
  const created: string[] = [];

  afterEach(() => {
    for (const f of created) if (fs.existsSync(f)) fs.unlinkSync(f);
    created.length = 0;
  });

  it("serves a file written after build with the correct content-type", async () => {
    const name = "test-serve.webp";
    const filePath = path.join(UPLOADS, "services", name);
    const data = Buffer.from("fake-webp-bytes");
    fs.writeFileSync(filePath, data);
    created.push(filePath);

    const res = await call(["services", name]);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/webp");
    const body = Buffer.from(await res.arrayBuffer());
    expect(body.equals(data)).toBe(true);
  });

  it("returns 404 for a missing file", async () => {
    const res = await call(["services", "does-not-exist.webp"]);
    expect(res.status).toBe(404);
  });

  it("blocks path traversal outside the uploads dir", async () => {
    const res = await call(["..", "..", "package.json"]);
    expect(res.status).toBe(403);
  });
});
