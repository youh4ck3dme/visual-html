import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import type { ChatMessage } from './components/ChatArea';
import { PreviewArea } from './components/PreviewArea';
import { SettingsModal } from './components/SettingsModal';
import { generateCode, hasConfiguredAiProvider } from './utils/gemini';
import type { PromptItem } from './utils/promptLibrary';
import type { GenerationMode, OutputSource, VersionRecord } from './types/workspace';

const initialMessages: ChatMessage[] = [
  {
    id: 'greet',
    sender: 'ai',
    text: 'VibeCraft AI Ready. Select a starter template from the sidebar or describe your application prompt to generate a single-file interactive layout.'
  }
];

interface StoredWorkspace {
  currentCategory: string;
  messages: ChatMessage[];
  generatedCode: string;
  outputSource: OutputSource;
  versions: VersionRecord[];
  generationMode: GenerationMode;
}

const WORKSPACE_STORAGE_KEY = 'vibecraft_workspace_v1';

const readStoredWorkspace = (): StoredWorkspace | null => {
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredWorkspace>;
    if (!Array.isArray(parsed.messages)) return null;

    return {
      currentCategory: parsed.currentCategory || 'portfolios',
      messages: parsed.messages,
      generatedCode: parsed.generatedCode || '',
      outputSource: parsed.outputSource || (parsed.generatedCode ? 'demo' : 'empty'),
      versions: Array.isArray(parsed.versions) ? parsed.versions : [],
      generationMode: parsed.generationMode || (parsed.generatedCode ? 'refine' : 'build'),
    };
  } catch {
    return null;
  }
};

function App() {
  const storedWorkspace = readStoredWorkspace();
  const [currentCategory, setCurrentCategory] = useState(() => storedWorkspace?.currentCategory || 'portfolios');
  const [messages, setMessages] = useState<ChatMessage[]>(() => storedWorkspace?.messages || initialMessages);
  const [generatedCode, setGeneratedCode] = useState<string>(() => storedWorkspace?.generatedCode || '');
  const [outputSource, setOutputSource] = useState<OutputSource>(() => storedWorkspace?.outputSource || 'empty');
  const [versions, setVersions] = useState<VersionRecord[]>(() => storedWorkspace?.versions || []);
  const [generationMode, setGenerationMode] = useState<GenerationMode>(() => storedWorkspace?.generationMode || 'build');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [stepStatusText, setStepStatusText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => hasConfiguredAiProvider());

  const createId = () => crypto.randomUUID();

  const createVersion = (code: string, source: OutputSource, label: string): VersionRecord => ({
    id: createId(),
    label,
    source,
    code,
    createdAt: new Date().toISOString(),
  });

  const latestSavedCode = versions.at(-1)?.code || '';
  const hasUnsavedManualChanges = Boolean(generatedCode) && generatedCode !== latestSavedCode;

  useEffect(() => {
    const workspace: StoredWorkspace = {
      currentCategory,
      messages,
      generatedCode,
      outputSource,
      versions,
      generationMode,
    };

    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
  }, [currentCategory, generatedCode, messages, outputSource, versions, generationMode]);

  const handleSendPrompt = async (promptText: string, requestedMode = generationMode) => {
    if (!promptText.trim()) return;

    setErrorMsg(null);
    setInputVal('');
    
    // Add user prompt to logs
    const userMsgId = createId();
    setMessages(prev => [
      ...prev,
      { id: userMsgId, sender: 'user', text: promptText }
    ]);

    setIsGenerating(true);
    setActiveStep(0);
    setStepStatusText(requestedMode === 'build' ? 'Initializing new app build...' : `Starting ${requestedMode} mode...`);

    try {
      const previousCode = requestedMode === 'build' ? undefined : generatedCode.trim() ? generatedCode : undefined;
      const isOnlineGeneration = hasConfiguredAiProvider();
      const result = await generateCode(promptText, (step, status) => {
        setActiveStep(step);
        setStepStatusText(status);
      }, previousCode, requestedMode);

      if (result.type === 'explanation') {
        setMessages(prev => [
          ...prev,
          {
            id: createId(),
            sender: 'ai',
            text: result.content,
          }
        ]);
        return;
      }

      const code = result.content;
      const nextSource: OutputSource = isOnlineGeneration ? 'ai' : 'demo';
      
      setGeneratedCode(code);
      setOutputSource(nextSource);
      setGenerationMode('refine');
      setVersions(prev => [
        ...prev,
        createVersion(
          code,
          nextSource,
          requestedMode === 'fix'
            ? 'AI Fix'
            : requestedMode === 'refine'
              ? 'AI Refinement'
              : nextSource === 'ai'
                ? 'AI Generation'
                : 'Demo Template'
        ),
      ]);
      setMessages(prev => [
        ...prev,
        {
          id: createId(),
          sender: 'ai',
          text: requestedMode === 'fix'
            ? 'Applied a targeted fix. The preview and code view now reflect the corrected app.'
            : requestedMode === 'refine'
              ? 'Updated your application. The preview and code view now reflect the requested change.'
            : isOnlineGeneration
              ? 'Successfully generated your application! Click "Live Preview" or "Code View" on the right to examine it.'
              : 'Loaded a matching offline demo template. Add Mistral API keys in Settings to generate custom apps from scratch.',
        }
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during generation.';
      setErrorMsg(message);
      setMessages(prev => [
        ...prev,
        { id: createId(), sender: 'ai', text: 'Oops! An error occurred during the compilation step. Review the details below.' }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPrompt = (prompt: PromptItem) => {
    setInputVal(prompt.prompt);
    setGenerationMode('build');
    handleSendPrompt(prompt.prompt, 'build');
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: 'new-greet',
        sender: 'ai',
        text: 'New workspace opened. Select a starter template from the sidebar or write a custom layout description.'
      }
    ]);
    setGeneratedCode('');
    setOutputSource('empty');
    setVersions([]);
    setGenerationMode('build');
    setInputVal('');
    setErrorMsg(null);
  };

  const handleCodeChange = (code: string) => {
    setGeneratedCode(code);
    setOutputSource(code.trim() ? 'manual' : 'empty');
  };

  const handleSaveRevision = () => {
    if (!generatedCode.trim() || !hasUnsavedManualChanges) return;
    setVersions(prev => [
      ...prev,
      createVersion(generatedCode, 'manual', 'Manual Edit'),
    ]);
  };

  const handleRestoreVersion = (versionId: string) => {
    const version = versions.find(item => item.id === versionId);
    if (!version) return;
    setGeneratedCode(version.code);
    setOutputSource(version.source);
    setMessages(prev => [
      ...prev,
      { id: createId(), sender: 'ai', text: `Restored revision: ${version.label}.` }
    ]);
  };

  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
      <Sidebar
        currentCategory={currentCategory}
        onSelectCategory={setCurrentCategory}
        onSelectPrompt={handleSelectPrompt}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewChat={handleNewChat}
        hasApiKey={hasApiKey}
      />

      {/* Central chat interface */}
      <ChatArea
        messages={messages}
        isGenerating={isGenerating}
        activeStep={activeStep}
        stepStatusText={stepStatusText}
        errorMsg={errorMsg}
        onSendPrompt={handleSendPrompt}
        inputVal={inputVal}
        setInputVal={setInputVal}
        hasGeneratedCode={Boolean(generatedCode)}
        generationMode={generationMode}
        onGenerationModeChange={setGenerationMode}
      />

      {/* Right side live sandboxed preview */}
      <PreviewArea
        code={generatedCode}
        outputSource={outputSource}
        versions={versions}
        hasUnsavedChanges={hasUnsavedManualChanges}
        onCodeChange={handleCodeChange}
        onSaveRevision={handleSaveRevision}
        onRestoreVersion={handleRestoreVersion}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigurationChange={() => setHasApiKey(hasConfiguredAiProvider())}
      />
    </div>
  );
}

export default App;
