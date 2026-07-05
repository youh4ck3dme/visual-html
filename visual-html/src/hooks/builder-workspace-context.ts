import { createContext } from "react";

import type { BuilderGenerationMetrics } from "@/lib/builder/generation-metrics";
import type { BuilderGenerationTrace } from "@/lib/builder/generation-trace";
import type { HtmlHealthCheckResult } from "@/lib/builder/html-health-check";
import type { BuilderOrchestrationMode } from "@/lib/builder/orchestration-mode";
import type { PromptItem } from "@/lib/builder/prompt-library";
import type { BuilderQualityProfileId } from "@/lib/builder/quality-profiles";
import type { BuilderChatMessage } from "@/lib/builder/workspace-storage";
import type { GenerationMode, OutputSource, VersionRecord } from "@/types/builder";

export type BuilderWorkspaceContextValue = {
  hydrated: boolean;
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
  messages: BuilderChatMessage[];
  generatedCode: string;
  setGeneratedCode: (code: string) => void;
  outputSource: OutputSource;
  setOutputSource: (source: OutputSource) => void;
  versions: VersionRecord[];
  setVersions: React.Dispatch<React.SetStateAction<VersionRecord[]>>;
  generationMode: GenerationMode;
  setGenerationMode: (mode: GenerationMode) => void;
  isGenerating: boolean;
  isCancelling: boolean;
  showCancelledNotice: boolean;
  activeStep: number;
  stepStatusText: string;
  error: string | null;
  inputVal: string;
  setInputVal: (value: string) => void;
  hasByokAccess: boolean;
  setHasByokAccess: (value: boolean) => void;
  serverAiConfigured: boolean;
  orchestrationMode: BuilderOrchestrationMode;
  setOrchestrationMode: (mode: BuilderOrchestrationMode) => void;
  qualityProfileId: BuilderQualityProfileId;
  setQualityProfileId: (id: BuilderQualityProfileId) => void;
  currentGenerationTrace: BuilderGenerationTrace | null;
  lastGenerationMetrics: BuilderGenerationMetrics | null;
  lastHtmlHealthCheck: HtmlHealthCheckResult | null;
  activeTemplateId: string | null;
  setActiveTemplateId: (id: string | null) => void;
  hasAiAccess: boolean;
  cancelActiveGeneration: () => void;
  handleCancelGeneration: () => void;
  handleSendPrompt: (
    promptText: string,
    requestedMode?: GenerationMode,
    templateId?: string,
  ) => Promise<void>;
  handleSelectPrompt: (prompt: PromptItem) => void;
  handleNewChat: () => void;
  handleRestore: (versionId: string) => void;
  resetForTemplateDeepLink: (category: string) => void;
  makeVersionRecord: (code: string, source: OutputSource, label: string) => VersionRecord;
  addAiMessage: (text: string) => void;
  versionLabel: (mode: GenerationMode, online: boolean) => string;
};

export const BuilderWorkspaceContext = createContext<BuilderWorkspaceContextValue | null>(null);
