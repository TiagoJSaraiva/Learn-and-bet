"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { Popup } from "@/app/components/Popup";
import { setGlobalPopupMessage } from "@/app/components/GlobalPopup";
import { useAuth } from "@/app/components/AuthProvider";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export default function DeleteAccountPage() {
  const router = useRouter();
  const { user, loading, updateMoney } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const handleDeleteAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password) {
      setPopupMessage("Informe sua senha para confirmar.");
      return;
    }

    setSubmitting(true);

    const { error: signInError } =
      await supabaseBrowserClient.auth.signInWithPassword({
        email: user?.email ?? "",
        password,
      });

    if (signInError) {
      setSubmitting(false);
      setPopupMessage("Senha incorreta.");
      return;
    }

    const { data: sessionData } = await supabaseBrowserClient.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    if (!accessToken) {
      setSubmitting(false);
      setPopupMessage("Não foi possível validar a sessão.");
      return;
    }

    const response = await fetch("/api/account/delete", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      setSubmitting(false);
      setPopupMessage("Não foi possível excluir a conta.");
      return;
    }

    await supabaseBrowserClient.auth.signOut();
    await updateMoney(200);
    setSubmitting(false);
    setGlobalPopupMessage("Conta excluída com sucesso!");
    router.replace("/");
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
          onSubmit={handleDeleteAccount}
          className="flex w-full flex-col gap-6 rounded-3xl border border-red-200 bg-white p-8 shadow-sm"
        >
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-zinc-900">Excluir conta</h1>
            <p className="text-sm text-zinc-600">
              Esta ação é permanente e não pode ser desfeita.
            </p>
          </header>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Senha atual
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3 pr-12 text-sm text-zinc-800"
                placeholder="Sua senha"
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

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Excluindo..." : "Excluir conta"}
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