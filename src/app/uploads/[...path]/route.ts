import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Next.js serves files in `public/` only as they existed at build time. Files
// uploaded through the admin panel at runtime are written to `public/uploads/`
// but are NOT served by `next start` (they 404). This route reads them from
// disk at request time so newly uploaded images/documents are served correctly.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOADS_DIR = path.resolve("public/uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const rel = (params.path ?? []).join("/");
  const target = path.resolve(UPLOADS_DIR, rel);

  // Block path traversal outside the uploads directory.
  if (target !== UPLOADS_DIR && !target.startsWith(UPLOADS_DIR + path.sep)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const data = await fs.readFile(target);
    const ext = path.extname(target).toLowerCase();
    const type = CONTENT_TYPES[ext] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
