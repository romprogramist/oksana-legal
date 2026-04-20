import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";

export type UploadFolder = "services" | "testimonials" | "documents";

const IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const DOCUMENT_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const DOCUMENT_MAX_BYTES = 20 * 1024 * 1024;
const UPLOADS_DIR = path.resolve("uploads");

export type UploadResult =
  | { ok: true; url: string; size: number }
  | { ok: false; status: number; error: string };

export async function saveUpload(folder: string, file: { name: string; data: Buffer }): Promise<UploadResult> {
  if (folder !== "services" && folder !== "testimonials" && folder !== "documents") {
    return { ok: false, status: 400, error: "Invalid folder" };
  }
  const isImageFolder = folder === "services" || folder === "testimonials";
  const maxBytes = isImageFolder ? IMAGE_MAX_BYTES : DOCUMENT_MAX_BYTES;

  if (file.data.byteLength > maxBytes) {
    return { ok: false, status: 413, error: "File too large" };
  }

  const detected = await fileTypeFromBuffer(file.data);
  if (!detected) return { ok: false, status: 415, error: "Cannot detect file type" };

  if (isImageFolder) {
    if (!IMAGE_MIMES.has(detected.mime)) return { ok: false, status: 415, error: "Not an allowed image type" };
  } else {
    if (!DOCUMENT_MIMES.has(detected.mime)) return { ok: false, status: 415, error: "Not an allowed document type" };
  }

  const targetDir = path.join(UPLOADS_DIR, folder);
  await fs.mkdir(targetDir, { recursive: true });

  let outBuffer: Buffer;
  let ext: string;
  if (isImageFolder) {
    outBuffer = await sharp(file.data)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    ext = "webp";
  } else {
    outBuffer = file.data;
    ext = detected.ext;
  }

  const filename = `${crypto.randomUUID()}.${ext}`;
  const outPath = path.join(targetDir, filename);
  await fs.writeFile(outPath, outBuffer);

  return {
    ok: true,
    url: `/uploads/${folder}/${filename}`,
    size: outBuffer.byteLength,
  };
}
