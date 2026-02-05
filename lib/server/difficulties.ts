import "server-only";

import type { DifficultyConfig, DifficultyKey } from "@/lib/types/quiz";

export const difficultyConfig: Record<DifficultyKey, DifficultyConfig> = {
  basic: {
    label: "Básica",
    startCost: 50,
    rewardPerCorrect: 10,
    timeLimitSeconds: 18,
  },
  intermediate: {
    label: "Intermediária",
    startCost: 80,
    rewardPerCorrect: 18,
    timeLimitSeconds: 14,
  },
  advanced: {
    label: "Avançada",
    startCost: 120,
    rewardPerCorrect: 28,
    timeLimitSeconds: 10,
  },
};
