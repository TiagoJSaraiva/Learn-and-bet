"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { Popup } from "@/app/components/Popup";
import { useAuth } from "@/app/components/AuthProvider";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentPassword || !newPassword) {
      setPopupMessage("Informe a senha atual e a nova senha.");
      return;
    }

    setSubmitting(true);

    const { error: signInError } =
      await supabaseBrowserClient.auth.signInWithPassword({
        email: user?.email ?? "",
        password: currentPassword,
      });

    if (signInError) {
      setSubmitting(false);
      setPopupMessage("Senha atual inválida.");
      return;
    }

    const { error: updateError } = await supabaseBrowserClient.auth.updateUser({
      password: newPassword,
    });

    setSubmitting(false);

    if (updateError) {
      setPopupMessage(updateError.message);
      return;
    }

    setPopupMessage("Senha atualizada com sucesso!");
    setTimeout(() => router.push("/profile"), 700);
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <span className="text-sm text-zinc-500">Carregando...</span>
      </div>
    );
  }

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
            <h1 className="text-2xl font-semibold text-zinc-900">Mudar senha</h1>
            <p className="text-sm text-zinc-600">
              Informe a senha atual e a nova senha.
            </p>
          </header>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Senha atual
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3 pr-12 text-sm text-zinc-800"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-700"
                aria-label={showCurrent ? "Ocultar senha" : "Mostrar senha"}
              >
                {showCurrent ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Nova senha
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3 pr-12 text-sm text-zinc-800"
              />
              <button
                type="button"
                onClick={() => setShowNew((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-700"
                aria-label={showNew ? "Ocultar senha" : "Mostrar senha"}
              >
                {showNew ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Salvando..." : "Atualizar senha"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700"
            >
              Voltar ao perfil
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}