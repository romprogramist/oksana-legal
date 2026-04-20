"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export type UploadedFile = { url: string; size: number };

export function FileUploader({ folder, currentUrl, kind, onUploaded }: {
  folder: "services" | "testimonials" | "documents";
  currentUrl?: string | null;
  kind: "image" | "document";
  onUploaded: (file: UploadedFile) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("folder", folder);
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      onUploaded({ url: data.url, size: data.size });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {kind === "image" && currentUrl && (
        <div className="mb-3 relative w-40 h-40 rounded-xl overflow-hidden bg-gray-100">
          <Image src={currentUrl} alt="preview" fill className="object-cover" unoptimized />
        </div>
      )}
      {kind === "document" && currentUrl && (
        <p className="mb-3 text-sm text-text-secondary">
          Текущий файл: <a href={currentUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">открыть</a>
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={kind === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "application/pdf,.doc,.docx,.xls,.xlsx"}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
        className="block text-sm"
      />
      {uploading && <p className="mt-2 text-sm text-text-secondary">Загрузка...</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
