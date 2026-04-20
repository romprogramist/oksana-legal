"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type FaqItem = { id: number; question: string; answer: string; isActive: boolean };

export default function FaqListPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [toDelete, setToDelete] = useState<number | null>(null);

  async function load() {
    const res = await fetch("/api/admin/faq");
    if (res.ok) setItems(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function reorder(ids: number[]) {
    const prev = items;
    setItems(ids.map((id) => prev.find((x) => x.id === id)!).filter(Boolean));
    const res = await fetch("/api/admin/faq/reorder", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids }) });
    if (!res.ok) { setItems(prev); alert("Не удалось сохранить порядок"); }
    else load();
  }

  async function doDelete(id: number) {
    await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
    setToDelete(null); load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">FAQ ({items.length})</h1>
        <Link href="/admin/faq/new" className="px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-primary/90">+ Добавить</Link>
      </div>
      {items.length === 0 ? <p className="text-text-secondary">Нет вопросов.</p> : (
        <SortableList
          items={items}
          onReorder={reorder}
          renderItem={(item) => (
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className={item.isActive ? "font-medium text-text-primary" : "font-medium text-gray-400 line-through"}>{item.question}</p>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">{item.answer}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/admin/faq/${item.id}`} className="text-sm text-primary hover:underline">Правка</Link>
                <button onClick={() => setToDelete(item.id)} className="text-sm text-red-600 hover:underline">Удалить</button>
              </div>
            </div>
          )}
        />
      )}
      <ConfirmDialog open={toDelete !== null} title="Удалить вопрос?" message="Действие необратимо." onCancel={() => setToDelete(null)} onConfirm={() => toDelete && doDelete(toDelete)} />
    </div>
  );
}
