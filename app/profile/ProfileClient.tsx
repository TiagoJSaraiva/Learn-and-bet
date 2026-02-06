"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Popup } from "@/app/components/Popup";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/app/components/AuthProvider";

type ProfileClientProps = {
  userEmail: string;
  profile: {
    id: string;
    name: string | null;
    money: number;
    quizzes_done_amount: number;
  };
};

export function ProfileClient({ userEmail, profile }: ProfileClientProps) {
  const router = useRouter();
  const { updateMoney, profile: liveProfile } = useAuth();
  const resolvedProfile = liveProfile ?? profile;
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleLogout = async () => {
    setLoadingLogout(true);
    await supabaseBrowserClient.auth.signOut();
    await updateMoney(200);
    setLoadingLogout(false);
    setPopupMessage("Logou realizado com sucesso!");
    router.replace("/");
  };

  const handleRequestPasswordOtp = async () => {
    setLoadingOtp(true);
    const redirectTo = `${window.location.origin}/auth/reset`;
    const { error } = await supabaseBrowserClient.auth.resetPasswordForEmail(
      userEmail,
      { redirectTo }
    );
    setLoadingOtp(false);

    if (error) {
      setPopupMessage(error.message);
      return;
    }

    setResetSent(true);
    setPopupMessage("Enviamos um link de redefinição para o seu email.");
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setPopupMessage("Informe sua senha para confirmar.");
      return;
    }

    setDeletingAccount(true);

    const { error: signInError } =
      await supabaseBrowserClient.auth.signInWithPassword({
        email: userEmail,
        password: deletePassword,
      });

    if (signInError) {
      setDeletingAccount(false);
      setPopupMessage("Senha incorreta.");
      return;
    }

    const { data: sessionData } =
      await supabaseBrowserClient.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    if (!accessToken) {
      setDeletingAccount(false);
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
      setDeletingAccount(false);
      setPopupMessage("Não foi possível excluir a conta.");
      return;
    }

    await supabaseBrowserClient.auth.signOut();
    await updateMoney(200);
    setDeletingAccount(false);
    setPopupMessage("Conta excluída com sucesso!");
    router.replace("/");
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
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">Trocar senha</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Envie um código OTP para confirmar a alteração.
          </p>

          {!resetSent ? (
            <button
              type="button"
              onClick={handleRequestPasswordOtp}
              disabled={loadingOtp}
              className="mt-4 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
            >
              {loadingOtp ? "Enviando..." : "Enviar código"}
            </button>
          ) : (
            <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-700">
              Enviamos um link de redefinição para seu email. Abra o email e
              clique no link para definir uma nova senha.
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">Excluir conta</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Esta ação é permanente. Para confirmar, informe sua senha.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <input
              type="password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800"
              placeholder="Senha atual"
            />
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white"
            >
              {deletingAccount ? "Excluindo..." : "Excluir conta"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}