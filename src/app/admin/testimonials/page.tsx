"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type TestimonialStatus = "pending" | "approved" | "rejected";
type T = { id: number; name: string; content: string; rating: number; photoUrl: string | null; isActive: boolean; status: TestimonialStatus; createdAt: string };

type Tab = "pending" | "approved" | "rejected";

const TAB_LABELS: Record<Tab, string> = {
  pending: "На модерации",
  approved: "Опубликованные",
  rejected: "Отклонённые",
};

export default function TestimonialsListPage() {
  const [items, setItems] = useState<T[]>([]);
  const [tab, setTab] = useState<Tab>("pending");
  const [toDelete, setToDelete] = useState<number | null>(null);

  async function load() {
    const res = await fetch("/api/admin/testimonials");
    if (res.ok) setItems(await res.json());
  }
  useEffect(() => { load(); }, []);

  const pending = items.filter((x) => x.status === "pending");
  const approved = items.filter((x) => x.status === "approved");
  const rejected = items.filter((x) => x.status === "rejected");

  useEffect(() => {
    if (tab === "pending" && pending.length === 0 && (approved.length > 0 || rejected.length > 0)) {
      setTab("approved");
    }
  }, [pending.length, approved.length, rejected.length, tab]);

  async function setStatus(id: number, status: TestimonialStatus) {
    await fetch(`/api/admin/testimonials/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function reorder(ids: number[]) {
    const prev = items;
    const reordered = ids.map((id) => approved.find((x) => x.id === id)!);
    const other = items.filter((x) => x.status !== "approved");
    setItems([...other, ...reordered]);
    const res = await fetch("/api/admin/testimonials/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) { setItems(prev); alert("Не удалось сохранить порядок"); }
    else load();
  }

  async function doDelete(id: number) {
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    setToDelete(null); load();
  }

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
          <p className={item.isActive && item.status === "approved" ? "font-medium text-text-primary" : "font-medium text-gray-400 line-through"}>{item.name}</p>
          <div className="flex">
            {[1,2,3,4,5].map((s) => <Star key={s} className={`w-3 h-3 ${s <= item.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />)}
          </div>
        </div>
        <p className="text-xs text-text-secondary mt-1 line-clamp-2">{item.content}</p>
        <p className="text-[11px] text-gray-400 mt-1">{new Date(item.createdAt).toLocaleString("ru-RU")}</p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 shrink-0">
        {item.status === "pending" && (
          <>
            <button onClick={() => setStatus(item.id, "approved")} className="text-sm text-green-700 hover:underline">Одобрить</button>
            <button onClick={() => setStatus(item.id, "rejected")} className="text-sm text-gray-600 hover:underline">Отклонить</button>
          </>
        )}
        {item.status === "approved" && (
          <button onClick={() => setStatus(item.id, "rejected")} className="text-sm text-gray-600 hover:underline">Отклонить</button>
        )}
        {item.status === "rejected" && (
          <button onClick={() => setStatus(item.id, "pending")} className="text-sm text-yellow-700 hover:underline">Восстановить</button>
        )}
        <Link href={`/admin/testimonials/${item.id}`} className="text-sm text-primary hover:underline">Правка</Link>
        <button onClick={() => setToDelete(item.id)} className="text-sm text-red-600 hover:underline">Удалить</button>
      </div>
    </div>
  );

  const currentList = tab === "pending" ? pending : tab === "approved" ? approved : rejected;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Отзывы ({items.length})</h1>
        <Link href="/admin/testimonials/new" className="px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-primary/90">+ Добавить вручную</Link>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {(["pending", "approved", "rejected"] as const).map((t) => {
          const count = t === "pending" ? pending.length : t === "approved" ? approved.length : rejected.length;
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2 text-sm -mb-px border-b-2 transition-colors",
                active ? "border-primary text-primary font-medium" : "border-transparent text-text-secondary hover:text-text-primary",
              )}
            >
              {TAB_LABELS[t]}
              <span className={cn(
                "ml-2 inline-flex items-center justify-center min-w-[1.5rem] px-1.5 rounded-full text-xs",
                t === "pending" && count > 0 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600",
              )}>{count}</span>
            </button>
          );
        })}
      </div>

      {currentList.length === 0 ? (
        <p className="text-text-secondary">
          {tab === "pending" && "Нет отзывов на модерации."}
          {tab === "approved" && "Нет опубликованных отзывов."}
          {tab === "rejected" && "Нет отклонённых отзывов."}
        </p>
      ) : tab === "approved" ? (
        <SortableList items={approved} onReorder={reorder} renderItem={card} />
      ) : (
        <div className="space-y-2">
          {currentList.map((item) => (
            <div key={item.id} className={cn(
              "bg-white rounded-2xl shadow-soft p-4",
              tab === "pending" && "border-l-4 border-yellow-400",
              tab === "rejected" && "border-l-4 border-gray-300 opacity-75",
            )}>{card(item)}</div>
          ))}
        </div>
      )}

      <ConfirmDialog open={toDelete !== null} title="Удалить отзыв?" message="Действие необратимо." onCancel={() => setToDelete(null)} onConfirm={() => toDelete && doDelete(toDelete)} />
    </div>
  );
}
