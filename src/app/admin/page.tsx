"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface Testimonial { id: number; name: string; content: string; rating: number; isApproved: boolean; createdAt: string; }
interface ContactRequest { id: number; name: string; phone: string; email: string | null; message: string | null; quizAnswers: Record<string, string> | null; createdAt: string; }

export default function AdminPage() {
  const [tab, setTab] = useState<"testimonials" | "contacts">("contacts");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [tRes, cRes] = await Promise.all([fetch("/api/testimonials?all=true"), fetch("/api/contact?list=true")]);
        if (tRes.ok) setTestimonials(await tRes.json());
        if (cRes.ok) setContacts(await cRes.json());
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const pendingCount = testimonials.filter((t) => !t.isApproved).length;

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-text-secondary">Загрузка...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="container-narrow py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Админ-панель</h1>
          <a href="/" className="text-sm text-primary hover:underline">На сайт</a>
        </div>
        <div className="flex gap-4 mb-6">
          <button onClick={() => setTab("contacts")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === "contacts" ? "bg-primary text-white" : "bg-white text-text-secondary hover:bg-gray-100"}`}>Заявки ({contacts.length})</button>
          <button onClick={() => setTab("testimonials")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === "testimonials" ? "bg-primary text-white" : "bg-white text-text-secondary hover:bg-gray-100"}`}>Отзывы {pendingCount > 0 && `(${pendingCount} новых)`}</button>
        </div>

        {tab === "contacts" && (
          <div className="space-y-3">
            {contacts.length === 0 ? <p className="text-text-secondary text-center py-12">Нет заявок</p> : contacts.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl shadow-soft p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-text-primary">{c.name}</p>
                    <p className="text-sm text-primary">{c.phone}</p>
                    {c.email && <p className="text-sm text-text-secondary">{c.email}</p>}
                  </div>
                  <p className="text-xs text-text-secondary">{new Date(c.createdAt).toLocaleString("ru-RU")}</p>
                </div>
                {c.message && <p className="mt-2 text-sm text-text-secondary">{c.message}</p>}
                {c.quizAnswers && <div className="mt-2 text-xs text-text-secondary"><p className="font-medium">Ответы квиза:</p>{Object.entries(c.quizAnswers).map(([k, v]) => <p key={k}>Вопрос {Number(k) + 1}: {v}</p>)}</div>}
              </div>
            ))}
          </div>
        )}

        {tab === "testimonials" && (
          <div className="space-y-3">
            {testimonials.length === 0 ? <p className="text-text-secondary text-center py-12">Нет отзывов</p> : testimonials.map((t) => (
              <div key={t.id} className={`bg-white rounded-2xl shadow-soft p-5 ${!t.isApproved ? "border-l-4 border-yellow-400" : ""}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-text-primary">{t.name}</p>
                    <div className="flex gap-0.5 mt-1">{[1,2,3,4,5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= t.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />)}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${t.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{t.isApproved ? "Опубликован" : "На модерации"}</span>
                </div>
                <p className="mt-2 text-sm text-text-secondary">{t.content}</p>
                <p className="mt-1 text-xs text-text-secondary">{new Date(t.createdAt).toLocaleString("ru-RU")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
