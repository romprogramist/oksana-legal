"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminField, inputClass } from "@/components/admin/AdminField";
import { FileUploader } from "@/components/admin/FileUploader";

type DocData = {
  id?: number;
  title: string;
  description: string | null;
  fileUrl: string;
  fileSize: number | null;
  isActive: boolean;
};

export function DocumentForm({ initial }: { initial?: DocData }) {
  const router = useRouter();
  const [data, setData] = useState<DocData>(initial ?? { title: "", description: "", fileUrl: "", fileSize: null, isActive: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.fileUrl) { setError("Загрузите файл"); return; }
    setSaving(true); setError(null);
    try {
      const url = initial?.id ? `/api/admin/documents/${initial.id}` : "/api/admin/documents";
      const method = initial?.id ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error((await res.json()).error ?? "Ошибка сохранения");
      router.push("/admin/documents"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Неизвестная ошибка"); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <AdminField label="Заголовок">
        <input required value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className={inputClass} />
      </AdminField>
      <AdminField label="Описание (опционально)">
        <textarea rows={3} value={data.description ?? ""} onChange={(e) => setData({ ...data, description: e.target.value })} className={inputClass} />
      </AdminField>
      <AdminField label="Файл (PDF, DOC, DOCX, XLS, XLSX, до 20 МБ)">
        <FileUploader
          folder="documents"
          kind="document"
          currentUrl={data.fileUrl || null}
          onUploaded={(f) => setData({ ...data, fileUrl: f.url, fileSize: f.size })}
        />
      </AdminField>
      <AdminField label="Статус">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={data.isActive} onChange={(e) => setData({ ...data, isActive: e.target.checked })} />
          Показывать на сайте
        </label>
      </AdminField>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary/90 disabled:opacity-50">
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
        <button type="button" onClick={() => router.push("/admin/documents")} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm">Отмена</button>
      </div>
    </form>
  );
}
