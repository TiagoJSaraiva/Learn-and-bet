"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Popup } from "@/app/components/Popup";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export default function RecoverPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  const handleSendOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const redirectTo = `${window.location.origin}/auth/reset`;
    const { error } = await supabaseBrowserClient.auth.resetPasswordForEmail(
      email,
      { redirectTo }
    );

    setLoading(false);

    if (error) {
      setPopupMessage(error.message);
      return;
    }

    setEmailSent(true);
    setPopupMessage("Enviamos um link de redefinição para o seu email.");
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Popup
        message={popupMessage ?? ""}
        visible={Boolean(popupMessage)}
        onClose={() => setPopupMessage(null)}
      />
      <main className="mx-auto flex min-h-screen max-w-lg items-center px-6">
        <div className="flex w-full flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-zinc-900">
              Recuperar senha
            </h1>
            <p className="text-sm text-zinc-600">
              Informe seu email para receber um link de Redefinição de senha
            </p>
          </header>

          {!emailSent ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
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
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Enviando..." : "Receber link"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-700">
                Enviamos um link de redefinição para <strong>{email}</strong>.
                Abra o email e clique no link para escolher uma nova senha.
              </div>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Voltar ao login
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-zinc-500">
            <Link href="/login" className="font-medium text-zinc-700">
              Voltar ao login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
