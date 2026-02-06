"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { QuizCard } from "@/app/components/QuizCard";
import { useAuth } from "@/app/components/AuthProvider";
import type { QuizConfig, QuizSummary } from "@/lib/types/quiz";

function GuestGate({
  onContinue,
  onRegister,
  onLogin,
}: {
  onContinue: () => void;
  onRegister: () => void;
  onLogin: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-zinc-900">Você não está logado</h2>
        <p className="mt-3 text-sm text-zinc-600">
          Para salvar seu progresso, é necessário fazer login.
        </p>
        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              onContinue();
            }}
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700"
          >
            Continuar sem login
          </button>
          <button
            type="button"
            onClick={onRegister}
            className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
          >
            Criar conta
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700"
          >
            Entrar em uma conta existente
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuizzesPage() {
  const router = useRouter();
  const { user, loading: authLoading, money } = useAuth();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [config, setConfig] = useState<QuizConfig | null>(null);

  useEffect(() => {
    const load = async () => {
      const [quizzesResponse, configResponse] = await Promise.all([
        fetch("/api/quizzes"),
        fetch("/api/config"),
      ]);
      const quizzesData = await quizzesResponse.json();
      const configData = await configResponse.json();
      setQuizzes(quizzesData.quizzes);
      setConfig(configData);
    };

    load();
  }, []);

  const handleOpenQuiz = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  if (!config || money === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <span className="text-sm text-zinc-500">Carregando quizzes...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {!authLoading && !user && (
        <GuestGate
          onContinue={() => undefined}
          onRegister={() => router.push("/register")}
          onLogin={() => router.push("/login")}
        />
      )}
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">Quizzes</h1>
            <p className="text-sm text-zinc-600">
              Escolha um tema para iniciar sua próxima sessão.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-100"
            >
              Voltar pro menu
            </button>
            <div className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-700 shadow-sm">
              Saldo atual: ${money}
            </div>
          </div>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              difficulty={config.difficulties[quiz.difficulty]}
              onStart={handleOpenQuiz}
            />
          ))}
        </section>
      </main>
    </div>
  );
}
