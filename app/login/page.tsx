"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Popup } from "@/app/components/Popup";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const { error } = await supabaseBrowserClient.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setPopupMessage(error.message);
      return;
    }

    setPopupMessage("Login realizado com sucesso!");
    setTimeout(() => router.push("/"), 700);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Popup
        message={popupMessage ?? ""}
        visible={Boolean(popupMessage)}
        onClose={() => setPopupMessage(null)}
      />
      <main className="mx-auto flex min-h-screen max-w-lg items-center px-6">
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm"
        >
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-zinc-900">Entrar</h1>
            <p className="text-sm text-zinc-600">
              Acesse sua conta para salvar seu progresso.
            </p>
          </header>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700"
          >
            Voltar ao menu
          </button>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800"
              placeholder="voce@email.com"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Senha
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800"
              placeholder="Digite sua senha"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-zinc-500">
            <Link href="/recover" className="font-medium text-zinc-700">
              Esqueci a senha
            </Link>
            <Link href="/register" className="font-medium text-zinc-700">
              Criar conta
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
