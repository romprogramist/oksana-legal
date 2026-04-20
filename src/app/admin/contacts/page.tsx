import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const contacts = await prisma.contactRequest.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Заявки клиентов ({contacts.length})</h1>
      <div className="space-y-3">
        {contacts.length === 0 ? (
          <p className="text-text-secondary text-center py-12">Нет заявок</p>
        ) : (
          contacts.map((c) => (
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
              {c.quizAnswers && typeof c.quizAnswers === "object" && (
                <div className="mt-2 text-xs text-text-secondary">
                  <p className="font-medium">Ответы квиза:</p>
                  {Object.entries(c.quizAnswers as Record<string, string>).map(([k, v]) => (
                    <p key={k}>Вопрос {Number(k) + 1}: {v}</p>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
