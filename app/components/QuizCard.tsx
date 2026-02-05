"use client";

import Image from "next/image";

import type { DifficultyConfig, QuizSummary } from "@/lib/types/quiz";

type QuizCardProps = {
  quiz: QuizSummary;
  difficulty: DifficultyConfig;
  onStart: (quizId: string) => void;
};

export function QuizCard({ quiz, difficulty, onStart }: QuizCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="relative h-40 w-full">
        <Image
          src={quiz.image}
          alt={quiz.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
            {difficulty.label}
          </span>
          <span className="text-xs text-zinc-500">Custo: ${difficulty.startCost}</span>
        </div>
        <h3 className="text-lg font-semibold text-zinc-900">{quiz.name}</h3>
        <p className="text-sm text-zinc-600">{quiz.description}</p>
        <div className="mt-auto">
          <button
            type="button"
            onClick={() => onStart(quiz.id)}
            className="w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Ver quiz
          </button>
        </div>
      </div>
    </article>
  );
}
