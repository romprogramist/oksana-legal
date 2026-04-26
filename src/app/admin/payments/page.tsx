"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Status = "pending" | "authorized" | "succeeded" | "failed";
type Row = {
  id: string;
  paymentLinkId: string;
  operationId: string | null;
  contractNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  amountKopecks: number;
  status: Status;
  createdAt: string;
  paidAt: string | null;
};

const TABS: Array<{ key: Status | "all"; label: string }> = [
  { key: "all", label: "Все" },
  { key: "pending", label: "Ожидают" },
  { key: "succeeded", label: "Оплачены" },
  { key: "failed", label: "Не прошли" },
];

const STATUS_LABEL: Record<Status, string> = {
  pending: "Ожидает",
  authorized: "Холд",
  succeeded: "Оплачен",
  failed: "Не прошёл",
};

function formatRub(kopecks: number): string {
  return (kopecks / 100).toLocaleString("ru-RU", { minimumFractionDigits: 2 }) + " ₽";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [tab, setTab] = useState<Status | "all">("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (tab !== "all") params.set("status", tab);
    if (q.trim()) params.set("q", q.trim());
    const res = await fetch(`/api/admin/payments?${params}`);
    if (res.ok) setRows(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    const id = setTimeout(load, 200); // debounce search input
    return () => clearTimeout(id);
  }, [tab, q]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Платежи</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm transition-colors",
              tab === t.key ? "bg-primary text-white" : "bg-gray-100 text-text-secondary hover:bg-gray-200"
            )}
          >
            {t.label}
          </button>
        ))}
        <input
          type="search"
          placeholder="Поиск: договор, ФИО, телефон"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="ml-auto px-3 py-1.5 rounded-full text-sm border border-gray-200 focus:border-primary focus:outline-none w-72"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-text-secondary">
            <tr>
              <th className="text-left px-4 py-2">Дата</th>
              <th className="text-left px-4 py-2">Договор</th>
              <th className="text-left px-4 py-2">ФИО</th>
              <th className="text-left px-4 py-2">Телефон</th>
              <th className="text-right px-4 py-2">Сумма</th>
              <th className="text-left px-4 py-2">Статус</th>
              <th className="text-left px-4 py-2">Op ID</th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-text-secondary">Загрузка…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-text-secondary">Платежей нет</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="px-4 py-2">{formatDate(r.createdAt)}</td>
                <td className="px-4 py-2 font-mono">{r.contractNumber}</td>
                <td className="px-4 py-2">{r.firstName} {r.lastName}</td>
                <td className="px-4 py-2">{r.phone}</td>
                <td className="px-4 py-2 text-right font-semibold">{formatRub(r.amountKopecks)}</td>
                <td className="px-4 py-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs",
                    r.status === "succeeded" && "bg-green-100 text-green-700",
                    r.status === "failed" && "bg-red-100 text-red-700",
                    r.status === "pending" && "bg-gray-100 text-gray-700",
                    r.status === "authorized" && "bg-yellow-100 text-yellow-700",
                  )}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono text-xs text-text-secondary">{r.operationId ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
