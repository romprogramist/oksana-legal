"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { AdminField, inputClass } from "@/components/admin/AdminField";
import { FileUploader } from "@/components/admin/FileUploader";

type TestimonialStatus = "pending" | "approved" | "rejected";

type TestimonialData = {
  id?: number;
  name: string;
  content: string;
  rating: number;
  photoUrl: string | null;
  isActive: boolean;
  status: TestimonialStatus;
};

export function TestimonialForm({ initial }: { initial?: TestimonialData }) {
  const router = useRouter();
  const [data, setData] = useState<TestimonialData>(initial ?? {
    name: "", content: "", rating: 5, photoUrl: null, isActive: true, status: "approved",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const url = initial?.id ? `/api/admin/testimonials/${initial.id}` : "/api/admin/testimonials";
      const method = initial?.id ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error((await res.json()).error ?? "Ошибка сохранения");
      router.push("/admin/testimonials"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка сохранения"); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <AdminField label="Имя клиента">
        <input required value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className={inputClass} />
      </AdminField>
      <AdminField label="Текст отзыва">
        <textarea required rows={5} value={data.content} onChange={(e) => setData({ ...data, content: e.target.value })} className={inputClass} />
      </AdminField>
      <AdminField label="Оценка">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} type="button" onClick={() => setData({ ...data, rating: s })}>
              <Star className={`w-7 h-7 ${s <= data.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
            </button>
          ))}
        </div>
      </AdminField>
      <AdminField label="Фото клиента (опционально)">
        <FileUploader folder="testimonials" kind="image" currentUrl={data.photoUrl} onUploaded={(f) => setData({ ...data, photoUrl: f.url })} />
        {data.photoUrl && <button type="button" onClick={() => setData({ ...data, photoUrl: null })} className="mt-2 text-sm text-red-600 hover:underline">Убрать фото</button>}
      </AdminField>
      <AdminField label="Статус">
        <select
          value={data.status}
          onChange={(e) => setData({ ...data, status: e.target.value as TestimonialStatus })}
          className={inputClass}
        >
          <option value="pending">На модерации</option>
          <option value="approved">Одобрен (виден на сайте)</option>
          <option value="rejected">Отклонён</option>
        </select>
      </AdminField>
      <AdminField label="Видимость">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={data.isActive} onChange={(e) => setData({ ...data, isActive: e.target.checked })} />
          Активен (не скрыт)
        </label>
      </AdminField>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary/90 disabled:opacity-50">
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
        <button type="button" onClick={() => router.push("/admin/testimonials")} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm">Отмена</button>
      </div>
    </form>
  );
}
