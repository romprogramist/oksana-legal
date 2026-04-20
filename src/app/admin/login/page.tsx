"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      if (res.ok) {
        router.push(next);
        router.refresh();
        return;
      }
      if (res.status === 429) setError("Слишком много попыток. Попробуйте через 15 минут.");
      else setError("Неверные учётные данные.");
    } catch {
      setError("Сетевая ошибка. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm bg-white rounded-3xl shadow-soft p-8">
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Вход в админку</h1>

      <label className="block mb-4">
        <span className="text-sm text-text-secondary">Логин</span>
        <input
          type="text"
          autoComplete="username"
          required
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
        />
      </label>

      <label className="block mb-4">
        <span className="text-sm text-text-secondary">Пароль</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
        />
      </label>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Вход..." : "Войти"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Suspense fallback={<div>Загрузка...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
