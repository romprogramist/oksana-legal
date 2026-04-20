"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminField, inputClass } from "@/components/admin/AdminField";

type PriceData = {
  id?: number;
  title: string;
  note: string | null;
  price: string;
  isActive: boolean;
};

export function PriceForm({ initial }: { initial?: PriceData }) {
  const router = useRouter();
  const [data, setData] = useState<PriceData>(initial ?? { title: "", note: "", price: "", isActive: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url = initial?.id ? `/api/admin/prices/${initial.id}` : "/api/admin/prices";
      const method = initial?.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Ошибка сохранения");
      router.push("/admin/prices");
      router.refresh();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Неизвестная ошибка");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl">
      <AdminField label="Заголовок">
        <input required value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className={inputClass} />
      </AdminField>
      <AdminField label="Подзаголовок (опционально)">
        <textarea rows={2} value={data.note ?? ""} onChange={(e) => setData({ ...data, note: e.target.value })} className={inputClass} />
      </AdminField>
      <AdminField label="Цена">
        <input required placeholder='Например, "от 80 000 ₽" или "Бесплатно"' value={data.price} onChange={(e) => setData({ ...data, price: e.target.value })} className={inputClass} />
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
        <button type="button" onClick={() => router.push("/admin/prices")} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm">Отмена</button>
      </div>
    </form>
  );
}
