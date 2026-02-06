"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { Popup } from "@/app/components/Popup";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthResetPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  const handleUpdatePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    const { error } = await supabaseBrowserClient.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setPopupMessage(error.message);
      return;
    }

    setPopupMessage("Senha atualizada com sucesso!");
    setTimeout(() => router.push("/login"), 700);
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
          onSubmit={handleUpdatePassword}
          className="flex w-full flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm"
        >
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-zinc-900">Nova senha</h1>
            <p className="text-sm text-zinc-600">
              Defina sua nova senha para continuar.
            </p>
          </header>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Nova senha
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3 pr-12 text-sm text-zinc-800"
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
            {loading ? "Salvando..." : "Atualizar senha"}
          </button>
        </form>
      </main>
    </div>
  );
}