"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type T = { id: number; name: string; content: string; rating: number; photoUrl: string | null; isActive: boolean; isApproved: boolean; createdAt: string };

export default function TestimonialsListPage() {
  const [items, setItems] = useState<T[]>([]);
  const [toDelete, setToDelete] = useState<number | null>(null);

  async function load() {
    const res = await fetch("/api/admin/testimonials");
    if (res.ok) setItems(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function reorder(ids: number[]) {
    const approved = items.filter((x) => x.isApproved);
    const pending = items.filter((x) => !x.isApproved);
    const approvedIds = ids.filter((id) => approved.some((x) => x.id === id));
    const prev = items;
    setItems([...pending, ...approvedIds.map((id) => approved.find((x) => x.id === id)!)]);
    const res = await fetch("/api/admin/testimonials/reorder", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: approvedIds }) });
    if (!res.ok) { setItems(prev); alert("Не удалось сохранить порядок"); }
    else load();
  }

  async function approve(id: number) {
    await fetch(`/api/admin/testimonials/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ isApproved: true }) });
    load();
  }

  async function doDelete(id: number) {
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    setToDelete(null); load();
  }

  const pending = items.filter((x) => !x.isApproved);
  const approved = items.filter((x) => x.isApproved);

  const card = (item: T) => (
    <div className="flex items-start gap-3">
      {item.photoUrl ? (
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
          <Image src={item.photoUrl} alt="" fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">{item.name[0]}</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={item.isActive && item.isApproved ? "font-medium text-text-primary" : "font-medium text-gray-400 line-through"}>{item.name}</p>
          <div className="flex">
            {[1,2,3,4,5].map((s) => <Star key={s} className={`w-3 h-3 ${s <= item.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />)}
          </div>
        </div>
        <p className="text-xs text-text-secondary mt-1 line-clamp-2">{item.content}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!item.isApproved && <button onClick={() => approve(item.id)} className="text-sm text-green-700 hover:underline">Одобрить</button>}
        <Link href={`/admin/testimonials/${item.id}`} className="text-sm text-primary hover:underline">Правка</Link>
        <button onClick={() => setToDelete(item.id)} className="text-sm text-red-600 hover:underline">Удалить</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Отзывы ({items.length})</h1>
        <Link href="/admin/testimonials/new" className="px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-primary/90">+ Добавить вручную</Link>
      </div>

      {pending.length > 0 && (
        <>
          <h2 className="mt-4 mb-2 text-sm font-medium text-yellow-700">На модерации ({pending.length})</h2>
          <div className="space-y-2 mb-6">
            {pending.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-soft p-4 border-l-4 border-yellow-400">{card(item)}</div>
            ))}
          </div>
        </>
      )}

      <h2 className="mt-4 mb-2 text-sm font-medium text-text-secondary">Опубликованные ({approved.length})</h2>
      {approved.length === 0 ? <p className="text-text-secondary">Нет опубликованных отзывов.</p> : (
        <SortableList items={approved} onReorder={reorder} renderItem={card} />
      )}

      <ConfirmDialog open={toDelete !== null} title="Удалить отзыв?" message="Действие необратимо." onCancel={() => setToDelete(null)} onConfirm={() => toDelete && doDelete(toDelete)} />
    </div>
  );
}
