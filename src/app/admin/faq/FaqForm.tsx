"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminField, inputClass } from "@/components/admin/AdminField";

type FaqData = { id?: number; question: string; answer: string; isActive: boolean };

export function FaqForm({ initial }: { initial?: FaqData }) {
  const router = useRouter();
  const [data, setData] = useState<FaqData>(initial ?? { question: "", answer: "", isActive: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const url = initial?.id ? `/api/admin/faq/${initial.id}` : "/api/admin/faq";
      const method = initial?.id ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error((await res.json()).error ?? "Ошибка сохранения");
      router.push("/admin/faq"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Неизвестная ошибка"); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <AdminField label="Вопрос">
        <textarea required rows={2} value={data.question} onChange={(e) => setData({ ...data, question: e.target.value })} className={inputClass} />
      </AdminField>
      <AdminField label="Ответ (поддерживает переносы строк)">
        <textarea required rows={8} value={data.answer} onChange={(e) => setData({ ...data, answer: e.target.value })} className={inputClass} />
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
        <button type="button" onClick={() => router.push("/admin/faq")} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm">Отмена</button>
      </div>
    </form>
  );
}
