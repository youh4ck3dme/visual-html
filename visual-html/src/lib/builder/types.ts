export interface PromptItem {
  id: string;
  title: string;
  description: string;
  category: string;
  prompt: string;
  mockCode: string;
}

export interface PromptCategory {
  id: string;
  name: string;
  icon: string;
}
