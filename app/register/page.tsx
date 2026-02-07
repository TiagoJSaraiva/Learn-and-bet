"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { Popup } from "@/app/components/Popup";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);

    const redirectTo = `${window.location.origin}/auth/callback?type=signup`;
    const { error } = await supabaseBrowserClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          name,
        },
      },
    });

    setLoading(false);

    if (error) {
      setPopupMessage(error.message);
      return;
    }

    setAwaitingConfirmation(true);
    setPopupMessage("Enviamos um link para o seu email. Abra para confirmar a conta.");
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Popup
        message={popupMessage ?? ""}
        visible={Boolean(popupMessage)}
        onClose={() => setPopupMessage(null)}
      />
      <main className="mx-auto flex min-h-screen max-w-lg items-center px-6 py-16">
        <div className="flex w-full flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-zinc-900">Criar conta</h1>
            <p className="text-sm text-zinc-600">
              Preencha seus dados e confirme o código enviado por email.
            </p>
          </header>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700"
          >
            Voltar ao menu
          </button>

          {!awaitingConfirmation ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                Nome
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800"
                  placeholder="Seu nome"
                />
              </label>

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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 px-4 py-3 pr-12 text-sm text-zinc-800"
                    placeholder="Crie uma senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-700"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Enviando..." : "Criar conta"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-700">
                Enviamos um link de confirmação para <strong>{email}</strong>.
                Abra o email e clique no link para concluir o cadastro.
              </div>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Já confirmei, entrar
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
