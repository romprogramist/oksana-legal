"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type Service = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  tags: string[];
  sortOrder: number;
  isActive: boolean;
};

export default function ServicesListPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [toDelete, setToDelete] = useState<number | null>(null);

  async function load() {
    const res = await fetch("/api/admin/services");
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function reorder(ids: number[]) {
    const prev = items;
    setItems(ids.map((id) => prev.find((x) => x.id === id)!).filter(Boolean));
    const res = await fetch("/api/admin/services/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) { setItems(prev); alert("Не удалось сохранить порядок"); }
    else load();
  }

  async function doDelete(id: number) {
    const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    setToDelete(null);
    if (res.ok) load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Услуги ({items.length})</h1>
        <Link href="/admin/services/new" className="px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-primary/90">
          + Добавить
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-text-secondary">Нет услуг.</p>
      ) : (
        <SortableList
          items={items}
          onReorder={reorder}
          renderItem={(item) => (
            <div className="flex items-start gap-3">
              {item.imageUrl ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <Image src={item.imageUrl} alt="" fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={item.isActive ? "font-medium text-text-primary" : "font-medium text-gray-400 line-through"}>{item.title}</p>
                {item.description && <p className="text-xs text-text-secondary line-clamp-1">{item.description}</p>}
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.tags.map((t) => <span key={t} className="text-xs text-primary bg-primary/5 px-2 py-0.5 rounded-full">{t}</span>)}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/admin/services/${item.id}`} className="text-sm text-primary hover:underline">Правка</Link>
                <button onClick={() => setToDelete(item.id)} className="text-sm text-red-600 hover:underline">Удалить</button>
              </div>
            </div>
          )}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Удалить услугу?"
        message="Действие необратимо."
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && doDelete(toDelete)}
      />
    </div>
  );
}
