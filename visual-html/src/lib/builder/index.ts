import type { PromptItem } from "./types";
import { promptCategories } from "./categories";
import { snakeGamePrompt } from "./snakeGame";
import { ticTacToePrompt } from "./ticTacToe";
import { memoryGamePrompt } from "./memoryGame";
import { pomodoroTimerPrompt } from "./pomodoroTimer";
import { photoPortfolioPrompt } from "./photoPortfolio";
import { kanbanBoardPrompt } from "./kanbanBoard";
import { wordpressLandingPrompt } from "./wordpressLanding";

export type { PromptCategory, PromptItem } from "./types";
export { promptCategories };

export const promptLibrary: PromptItem[] = [
  snakeGamePrompt,
  ticTacToePrompt,
  memoryGamePrompt,
  pomodoroTimerPrompt,
  photoPortfolioPrompt,
  kanbanBoardPrompt,
  wordpressLandingPrompt,
];
