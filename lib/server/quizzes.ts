import "server-only";

import type { Quiz, QuizQuestion, QuizSummary } from "@/lib/types/quiz";

const basePrompt = "Encontre o valor de <b>x</b> na equação a seguir:";

const buildPromptHtml = (expression: string) =>
  `${basePrompt} <p class="quiz-equation">${expression}</p>`;

const buildOptions = (correctValue: number) => {
  const candidates = new Set<number>();
  candidates.add(correctValue);
  let delta = 1;
  while (candidates.size < 5) {
    const plus = correctValue + delta;
    const minus = correctValue - delta;
    candidates.add(plus);
    if (minus > 0) {
      candidates.add(minus);
    }
    delta += 1;
  }
  const options = Array.from(candidates)
    .slice(0, 5)
    .map((value) => `x = ${value}`);
  const shift = Math.abs(correctValue) % options.length;
  return options.slice(shift).concat(options.slice(0, shift));
};

const createQuestion = (
  id: number,
  expression: string,
  correctValue: number
): QuizQuestion => {
  const correctAnswer = `x = ${correctValue}`;
  const answers = buildOptions(correctValue);

  if (!answers.includes(correctAnswer)) {
    answers[0] = correctAnswer;
  }

  return {
    id: `math-${id}`,
    promptHtml: buildPromptHtml(expression),
    answers,
    correctAnswer,
    image: null,
  };
};

const additionPairs: Array<[number, number]> = [
  [3, 5],
  [4, 7],
  [6, 8],
  [9, 2],
  [10, 5],
  [12, 4],
  [7, 9],
  [11, 6],
  [14, 3],
  [8, 12],
  [5, 13],
  [15, 4],
  [16, 2],
  [9, 9],
];

const subtractionPairs: Array<[number, number]> = [
  [10, 3],
  [12, 5],
  [15, 4],
  [18, 6],
  [20, 8],
  [14, 9],
  [16, 7],
  [22, 11],
  [25, 13],
  [30, 15],
  [19, 8],
  [17, 6],
  [21, 4],
  [28, 9],
];

const multiplicationPairs: Array<[number, number]> = [
  [2, 3],
  [3, 4],
  [4, 5],
  [6, 3],
  [7, 2],
  [8, 3],
  [5, 6],
  [9, 2],
  [4, 7],
  [3, 8],
  [6, 4],
  [5, 5],
  [2, 9],
  [7, 4],
];

const divisionPairs: Array<[number, number]> = [
  [12, 3],
  [18, 6],
  [20, 5],
  [24, 6],
  [25, 5],
  [27, 9],
  [32, 4],
  [36, 6],
  [40, 8],
  [42, 7],
  [48, 6],
  [45, 9],
  [54, 6],
  [56, 7],
];

const exponentPairs: Array<[number, number]> = [
  [2, 2],
  [2, 3],
  [2, 4],
  [3, 2],
  [3, 3],
  [4, 2],
  [4, 3],
  [5, 2],
  [6, 2],
  [7, 2],
  [8, 2],
  [9, 2],
];

const sqrtValues = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169];

const equationItems = [
  ...additionPairs.map(([a, b]) => ({
    expression: `x = ${a} + ${b}`,
    value: a + b,
  })),
  ...subtractionPairs.map(([a, b]) => ({
    expression: `x = ${a} - ${b}`,
    value: a - b,
  })),
  ...multiplicationPairs.map(([a, b]) => ({
    expression: `x = ${a} × ${b}`,
    value: a * b,
  })),
  ...divisionPairs.map(([a, b]) => ({
    expression: `x = ${a} ÷ ${b}`,
    value: a / b,
  })),
  ...exponentPairs.map(([base, exp]) => ({
    expression: `x = ${base}<sup>${exp}</sup>`,
    value: base ** exp,
  })),
  ...sqrtValues.map((value) => ({
    expression: `x = √${value}`,
    value: Math.sqrt(value),
  })),
];

if (equationItems.length !== 80) {
  throw new Error(`Expected 80 questions, received ${equationItems.length}.`);
}

const mathQuestions: QuizQuestion[] = equationItems.map((item, index) =>
  createQuestion(index + 1, item.expression, item.value)
);

const quizzes: Quiz[] = [
  {
    id: "matematica-rapida",
    name: "Matemática Rápida",
    description:
      "Equações rápidas de matemática básica para aquecer o raciocínio e ganhar ritmo.",
    difficulty: "basic",
    image: "/images/quizzes/matematica-rapida.svg",
    questions: mathQuestions,
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const quizSummaries: QuizSummary[] = quizzes.map(({ questions, ...quiz }) => quiz);

const quizById = (id: string) => quizzes.find((quiz) => quiz.id === id) ?? null;

export { quizzes, quizSummaries, quizById };
