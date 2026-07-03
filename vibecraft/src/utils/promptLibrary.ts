import { promptCategories, promptLibrary } from '../blueprints';
import type { PromptCategory, PromptItem } from '../blueprints';

export type { PromptCategory, PromptItem };
export { promptCategories, promptLibrary };

const promptMatchRules: Array<{ id: string; keywords: string[] }> = [
  { id: 'snake-game', keywords: ['snake'] },
  { id: 'tic-tac-toe', keywords: ['tic', 'board'] },
  { id: 'memory-game', keywords: ['memory', 'card'] },
  { id: 'pomodoro-timer', keywords: ['pomodoro', 'timer'] },
  { id: 'photo-portfolio', keywords: ['photo', 'gallery'] },
  { id: 'kanban-board', keywords: ['kanban', 'task'] },
];

export const getPromptMock = (promptText: string): string => {
  const norm = promptText.toLowerCase();
  const matchedRule = promptMatchRules.find(rule => rule.keywords.some(keyword => norm.includes(keyword)));
  if (matchedRule) {
    return promptLibrary.find(prompt => prompt.id === matchedRule.id)?.mockCode || '';
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VibeCraft Preview</title>
  <style>
    body {
      background: #09090b;
      color: #fff;
      font-family: system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 30px;
      border-radius: 16px;
      max-width: 400px;
      text-align: center;
    }
    h1 { color: #3b82f6; }
    p { color: #aaa; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Custom Generation</h1>
    <p>We received your custom prompt: <strong>"${promptText}"</strong></p>
    <p>Please enter Mistral API keys in the settings to generate live bespoke versions using AI.</p>
  </div>
</body>
</html>`;
};
