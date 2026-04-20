"use client";

import { useEffect } from "react";

export function ConfirmDialog({ open, title, message, onConfirm, onCancel }: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <p className="mt-2 text-sm text-text-secondary">{message}</p>
        <div className="mt-5 flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-full bg-gray-100 hover:bg-gray-200">Отмена</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-full bg-red-600 text-white hover:bg-red-700">Удалить</button>
        </div>
      </div>
    </div>
  );
}
