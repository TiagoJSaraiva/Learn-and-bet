"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Popup } from "@/app/components/Popup";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/app/components/AuthProvider";

type ProfileClientProps = {
  userEmail: string;
  profile: {
    id: string;
    name: string | null;
    nickname: string | null;
    money: number;
    quizzes_done_amount: number;
  };
};

export function ProfileClient({ userEmail, profile }: ProfileClientProps) {
  const router = useRouter();
  const { updateMoney, profile: liveProfile, refreshProfile } = useAuth();
  const resolvedProfile = liveProfile ?? profile;
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [nickname, setNickname] = useState(resolvedProfile.nickname ?? "");
  const [savingNickname, setSavingNickname] = useState(false);

  const handleLogout = async () => {
    setLoadingLogout(true);
    await supabaseBrowserClient.auth.signOut();
    await updateMoney(200);
    setLoadingLogout(false);
    setPopupMessage("Logou realizado com sucesso!");
    router.replace("/");
  };

  useEffect(() => {
    setNickname(resolvedProfile.nickname ?? "");
  }, [resolvedProfile.nickname]);

  const handleSaveNickname = async () => {
    const trimmed = nickname.trim();

    if (!trimmed) {
      setPopupMessage("Informe um apelido válido.");
      return;
    }

    if (trimmed.length > 20) {
      setPopupMessage("O apelido deve ter no máximo 20 caracteres.");
      return;
    }

    setSavingNickname(true);
    const { data } = await supabaseBrowserClient.auth.getSession();
    const accessToken = data.session?.access_token;

    if (!accessToken) {
      setSavingNickname(false);
      setPopupMessage("Não foi possível validar a sessão.");
      return;
    }

    const response = await fetch("/api/profile/nickname", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ nickname: trimmed }),
    });

    setSavingNickname(false);

    if (response.status === 409) {
      setPopupMessage(
        "Esse apelido não está disponível. Tente novamente com outro."
      );
      return;
    }

    if (!response.ok) {
      setPopupMessage("Não foi possível salvar o apelido.");
      return;
    }

    await refreshProfile();
    setPopupMessage("Apelido atualizado com sucesso!");
  };


  return (
    <div className="min-h-screen bg-zinc-50">
      <Popup
        message={popupMessage ?? ""}
        visible={Boolean(popupMessage)}
        onClose={() => setPopupMessage(null)}
      />
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12">
        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900">Perfil</h1>
              <p className="text-sm text-zinc-600">
                Bem-vindo, {resolvedProfile.name ?? "Usuário"}.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-semibold text-zinc-700"
              >
                Voltar pro menu
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loadingLogout}
                className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-semibold text-zinc-700"
              >
                {loadingLogout ? "Saindo..." : "Logout"}
              </button>
            </div>
          </header>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs text-zinc-500">Saldo atual</p>
              <p className="text-xl font-semibold text-zinc-900">
                ${resolvedProfile.money}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs text-zinc-500">Quizzes concluídos</p>
              <p className="text-xl font-semibold text-zinc-900">
                {resolvedProfile.quizzes_done_amount}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs text-zinc-500">Email</p>
              <p className="text-sm font-semibold text-zinc-900">{userEmail}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <label className="text-sm font-medium text-zinc-700">
              Apelido
            </label>
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                maxLength={20}
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                className="flex-1 rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800"
                placeholder="Seu apelido"
              />
              <button
                type="button"
                onClick={handleSaveNickname}
                disabled={savingNickname}
                className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {savingNickname ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">Trocar senha</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Atualize sua senha informando a senha atual e a nova senha.
          </p>
          <button
            type="button"
            onClick={() => router.push("/profile/change-password")}
            className="mt-4 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
          >
            Mudar senha
          </button>
        </section>

        <section className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">Excluir conta</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Esta ação é permanente e não pode ser desfeita.
          </p>
          <button
            type="button"
            onClick={() => router.push("/profile/delete-account")}
            className="mt-4 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white"
          >
            Ir para exclusão de conta
          </button>
        </section>
      </main>
    </div>
  );
}