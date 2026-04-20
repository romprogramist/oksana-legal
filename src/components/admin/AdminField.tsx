"use client";

import { ReactNode } from "react";

export function AdminField({ label, children, error }: {
  label: string;
  children: ReactNode;
  error?: string | null;
}) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-text-secondary mb-1.5">{label}</span>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
  );
}

export const inputClass =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary";
