"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type DocumentSample = { id: number; title: string; description: string | null; fileUrl: string; fileSize: number | null; isActive: boolean };

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsListPage() {
  const [items, setItems] = useState<DocumentSample[]>([]);
  const [toDelete, setToDelete] = useState<number | null>(null);

  async function load() {
    const res = await fetch("/api/admin/documents");
    if (res.ok) setItems(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function reorder(ids: number[]) {
    const prev = items;
    setItems(ids.map((id) => prev.find((x) => x.id === id)!).filter(Boolean));
    const res = await fetch("/api/admin/documents/reorder", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids }) });
    if (!res.ok) { setItems(prev); alert("Не удалось сохранить порядок"); }
    else load();
  }

  async function doDelete(id: number) {
    await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
    setToDelete(null); load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Образцы документов ({items.length})</h1>
        <Link href="/admin/documents/new" className="px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-primary/90">+ Добавить</Link>
      </div>
      {items.length === 0 ? <p className="text-text-secondary">Нет документов.</p> : (
        <SortableList
          items={items}
          onReorder={reorder}
          renderItem={(item) => (
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className={item.isActive ? "font-medium text-text-primary" : "font-medium text-gray-400 line-through"}>{item.title}</p>
                {item.description && <p className="text-xs text-text-secondary line-clamp-1">{item.description}</p>}
                <p className="text-xs text-text-secondary mt-1">
                  <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">Файл</a>
                  {item.fileSize ? ` · ${formatSize(item.fileSize)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/admin/documents/${item.id}`} className="text-sm text-primary hover:underline">Правка</Link>
                <button onClick={() => setToDelete(item.id)} className="text-sm text-red-600 hover:underline">Удалить</button>
              </div>
            </div>
          )}
        />
      )}
      <ConfirmDialog open={toDelete !== null} title="Удалить документ?" message="Действие необратимо. Файл на диске остаётся." onCancel={() => setToDelete(null)} onConfirm={() => toDelete && doDelete(toDelete)} />
    </div>
  );
}
