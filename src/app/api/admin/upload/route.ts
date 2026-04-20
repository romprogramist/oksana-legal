import { NextRequest, NextResponse } from "next/server";
import { saveUpload } from "@/lib/upload";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const folder = form.get("folder");
  const file = form.get("file");

  if (typeof folder !== "string") {
    return NextResponse.json({ error: "Missing folder" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await saveUpload(folder, { name: file.name, data: buffer });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ url: result.url, size: result.size });
}

export const runtime = "nodejs";
