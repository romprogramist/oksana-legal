"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminField, inputClass } from "@/components/admin/AdminField";
import { FileUploader } from "@/components/admin/FileUploader";

type ServiceData = {
  id?: number;
  title: string;
  description: string | null;
  imageUrl: string;
  tags: string[];
  isActive: boolean;
};

export function ServiceForm({ initial }: { initial?: ServiceData }) {
  const router = useRouter();
  const [data, setData] = useState<ServiceData>(initial ?? {
    title: "", description: "", imageUrl: "", tags: [], isActive: true,
  });
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addTag() {
    const t = tagInput.trim();
    if (!t || data.tags.includes(t) || data.tags.length >= 10) return;
    setData({ ...data, tags: [...data.tags, t] });
    setTagInput("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url = initial?.id ? `/api/admin/services/${initial.id}` : "/api/admin/services";
      const method = initial?.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? "Ошибка сохранения");
      }
      router.push("/admin/services");
      router.refresh();
    } catch (err) {
      const error = err instanceof Error ? err.message : "Неизвестная ошибка";
      setError(error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <AdminField label="Заголовок">
        <input required value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className={inputClass} />
      </AdminField>

      <AdminField label="Описание (опционально)">
        <textarea rows={4} value={data.description ?? ""} onChange={(e) => setData({ ...data, description: e.target.value })} className={inputClass} />
      </AdminField>

      <AdminField label="Картинка">
        <FileUploader
          folder="services"
          kind="image"
          currentUrl={data.imageUrl || null}
          onUploaded={(f) => setData({ ...data, imageUrl: f.url })}
        />
      </AdminField>

      <AdminField label="Теги (максимум 10)">
        <div className="flex flex-wrap gap-2 mb-2">
          {data.tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/5 rounded-full text-xs text-primary">
              {t}
              <button type="button" onClick={() => setData({ ...data, tags: data.tags.filter((x) => x !== t) })} className="text-primary/70 hover:text-primary">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            placeholder="Новый тег и Enter"
            className={inputClass}
          />
          <button type="button" onClick={addTag} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm">Добавить</button>
        </div>
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
        <button type="button" onClick={() => router.push("/admin/services")} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm">
          Отмена
        </button>
      </div>
    </form>
  );
}
