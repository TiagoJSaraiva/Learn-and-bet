"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import { Popup } from "@/app/components/Popup";
import { useAuth } from "@/app/components/AuthProvider";
import type { Quiz, QuizConfig, QuizQuestion } from "@/lib/types/quiz";

const pickQuestions = (questions: QuizQuestion[], count: number) => {
  const pool = [...questions];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
};

export default function QuizSessionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { money, updateMoney } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!params?.id) return;
      const [quizResponse, configResponse] = await Promise.all([
        fetch(`/api/quiz/${params.id}`),
        fetch("/api/config"),
      ]);

      const configData = await configResponse.json();
      setConfig(configData);
      if (!quizResponse.ok) {
        setQuiz(null);
        return;
      }

      const quizData = await quizResponse.json();
      setQuiz(quizData.quiz);
    };

    load();
  }, [params?.id]);

  const difficulty = useMemo(() => {
    if (!quiz || !config) return null;
    return config.difficulties[quiz.difficulty];
  }, [quiz, config]);

  useEffect(() => {
    if (!isStarted || !difficulty) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimeUp(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, currentIndex, difficulty]);

  const resetQuestionState = () => {
    if (!difficulty) return;
    setTimeLeft(difficulty.timeLimitSeconds);
    setIsTimeUp(false);
    setSelectedAnswer(null);
  };

  const handleStart = () => {
    if (!quiz || !difficulty || !config) return;
    const currentMoney = money ?? config.initialMoney;

    if (currentMoney < difficulty.startCost) {
      setPopupMessage("Saldo insuficiente para iniciar este quiz.");
      return;
    }

    const updatedMoney = currentMoney - difficulty.startCost;
    updateMoney(updatedMoney);
    setSessionQuestions(pickQuestions(quiz.questions, 20));
    setCurrentIndex(0);
    setCorrectCount(0);
    setIsFinished(false);
    resetQuestionState();
    setIsStarted(true);
  };

  const handleAnswer = (answer: string) => {
    if (!quiz || !difficulty || !isStarted || selectedAnswer) return;
    const currentQuestion = sessionQuestions[currentIndex];
    setSelectedAnswer(answer);

    const answeredCorrectly =
      answer === currentQuestion.correctAnswer && !isTimeUp;

    if (isTimeUp) {
      setPopupMessage("Tempo esgotado! A resposta foi marcada como errada.");
    } else if (!answeredCorrectly) {
      setPopupMessage("Resposta incorreta. Continue tentando!");
    }

    if (answeredCorrectly) {
      setCorrectCount((prev) => prev + 1);
      const updated = (money ?? 0) + difficulty.rewardPerCorrect;
      updateMoney(updated);
    }

    setTimeout(() => {
      if (currentIndex + 1 >= sessionQuestions.length) {
        setIsFinished(true);
        setIsStarted(false);
        return;
      }
      resetQuestionState();
      setCurrentIndex((prev) => prev + 1);
    }, 900);
  };

  const handleExit = () => {
    router.push("/quizzes");
  };

  const handlePopupClose = () => setPopupMessage(null);

  if (!config || money === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <span className="text-sm text-zinc-500">Carregando quiz...</span>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-zinc-200 bg-white px-8 py-10 shadow-sm">
          <span className="text-sm text-zinc-500">Quiz não encontrado.</span>
          <button
            type="button"
            onClick={() => router.push("/quizzes")}
            className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-semibold text-white"
          >
            Voltar para quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Popup
        message={popupMessage ?? ""}
        visible={Boolean(popupMessage)}
        onClose={handlePopupClose}
      />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-zinc-200">
              <Image
                src={quiz.image}
                alt={quiz.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900">
                {quiz.name}
              </h1>
              <p className="text-sm text-zinc-600">{quiz.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm">
              {difficulty?.label}
            </span>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm">
              Saldo: ${money}
            </span>
          </div>
        </header>

        {!isStarted && !isFinished && (
          <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-zinc-900">
                Pronto para começar?
              </h2>
              <p className="text-sm text-zinc-600">
                Este quiz custa ${difficulty?.startCost} para iniciar. Cada acerto
                rende ${difficulty?.rewardPerCorrect} e você terá
                {" "}{difficulty?.timeLimitSeconds}s por pergunta.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleStart}
                  className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  Iniciar quiz
                </button>
                <button
                  type="button"
                  onClick={handleExit}
                  className="rounded-full border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
                >
                  Voltar para quizzes
                </button>
              </div>
            </div>
          </section>
        )}

        {isStarted && sessionQuestions.length > 0 && (
          <section className="flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-zinc-500">
                Pergunta {currentIndex + 1} de {sessionQuestions.length}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                  Tempo: {timeLeft}s
                </span>
                {isTimeUp && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                    Tempo esgotado
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleExit}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100"
                >
                  Sair do quiz
                </button>
              </div>
            </div>

            <div
              className="text-base text-zinc-800"
              dangerouslySetInnerHTML={{
                __html: sessionQuestions[currentIndex].promptHtml,
              }}
            />

            {sessionQuestions[currentIndex].image && (
              <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-zinc-200">
                <Image
                  src={sessionQuestions[currentIndex].image as string}
                  alt="Imagem da questão"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {sessionQuestions[currentIndex].answers.map((answer) => {
                const isSelected = selectedAnswer === answer;
                const isCorrect =
                  answer === sessionQuestions[currentIndex].correctAnswer;

                return (
                  <button
                    key={answer}
                    type="button"
                    onClick={() => handleAnswer(answer)}
                    disabled={Boolean(selectedAnswer)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      isSelected
                        ? isCorrect && !isTimeUp
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : "border-red-300 bg-red-50 text-red-600"
                        : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                    } ${selectedAnswer ? "cursor-not-allowed opacity-80" : ""}`}
                  >
                    {answer}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {isFinished && (
          <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-zinc-900">
                Quiz concluído!
              </h2>
              <p className="text-sm text-zinc-600">
                Você acertou {correctCount} de {sessionQuestions.length}
                perguntas. Seu saldo atual é ${money}.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleExit}
                  className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  Voltar para quizzes
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
