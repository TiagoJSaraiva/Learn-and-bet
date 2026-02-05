export type DifficultyKey = "basic" | "intermediate" | "advanced";

export type DifficultyConfig = {
  label: string;
  startCost: number;
  rewardPerCorrect: number;
  timeLimitSeconds: number;
};

export type QuizQuestion = {
  id: string;
  promptHtml: string;
  answers: string[];
  correctAnswer: string;
  image: string | null;
};

export type Quiz = {
  id: string;
  name: string;
  description: string;
  difficulty: DifficultyKey;
  image: string;
  questions: QuizQuestion[];
};

export type QuizSummary = Omit<Quiz, "questions">;

export type QuizConfig = {
  initialMoney: number;
  difficulties: Record<DifficultyKey, DifficultyConfig>;
};
