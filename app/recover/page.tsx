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
              Envie o OTP e defina uma nova senha.
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
                {loading ? "Enviando..." : "Enviar código"}
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
}"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Popup } from "@/app/components/Popup";
import { requestRecoveryOtp, verifyEmailOtp } from "@/lib/supabase/auth-client";

type Step = "email" | "otp";

export default function RecoverPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  const handlePopupClose = () => setPopupMessage(null);

  const handleSendOtp = async () => {
    if (!email) {
      setPopupMessage("Informe seu email para recuperar a senha.");
      return;
    }
    setIsSubmitting(true);
    const { error } = await requestRecoveryOtp(email);
    setIsSubmitting(false);

    if (error) {
      setPopupMessage(error.message);
      return;
    }

    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setPopupMessage("Informe o código OTP enviado por email.");
      return;
    }
    setIsSubmitting(true);
    const { error } = await verifyEmailOtp(email, otp);
    setIsSubmitting(false);

    if (error) {
      setPopupMessage(error.message);
      return;
    }

    router.push("/reset-password");
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Popup
        message={popupMessage ?? ""}
        visible={Boolean(popupMessage)}
        onClose={handlePopupClose}
      />
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-semibold text-zinc-900">
              Recuperar senha
            </h1>
            <p className="text-sm text-zinc-600">
              Enviaremos um código OTP para confirmar a redefinição.
            </p>
          </div>

          {step === "email" && (
            <div className="mt-6 flex flex-col gap-4">
              <label className="text-sm font-medium text-zinc-700">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800"
                  placeholder="voce@email.com"
                />
              </label>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSubmitting}
                className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Enviar código
              </button>
            </div>
          )}

          {step === "otp" && (
            <div className="mt-6 flex flex-col gap-4">
              <p className="text-sm text-zinc-600">
                Enviamos um código OTP para {email}.
              </p>
              <label className="text-sm font-medium text-zinc-700">
                Código OTP
                <input
                  type="text"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800"
                  placeholder="Digite o código"
                />
              </label>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isSubmitting}
                className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Confirmar código
              </button>
            </div>
          )}

          <div className="mt-8 border-t border-zinc-100 pt-6 text-sm text-zinc-600">
            Lembrou da senha?{" "}
            <Link href="/login" className="font-semibold text-zinc-900">
              Entrar
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
