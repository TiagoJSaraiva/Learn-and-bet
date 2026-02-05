"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { QuizCard } from "@/app/components/QuizCard";
import type { QuizConfig, QuizSummary } from "@/lib/types/quiz";

const moneyStorageKey = "learn-bet.money";

const getStoredMoney = (fallback: number) => {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(moneyStorageKey);
  if (!stored) return fallback;
  const parsed = Number(stored);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const setStoredMoney = (value: number) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(moneyStorageKey, value.toString());
};

export default function QuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [money, setMoney] = useState<number | null>(null);

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
      const storedMoney = getStoredMoney(configData.initialMoney);
      setMoney(storedMoney);
      setStoredMoney(storedMoney);
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
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">Quizzes</h1>
            <p className="text-sm text-zinc-600">
              Escolha um tema para iniciar sua próxima sessão.
            </p>
          </div>
          <div className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-700 shadow-sm">
            Saldo atual: ${money}
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
