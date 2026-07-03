import React, { useRef, useEffect } from 'react';
import { ArrowRight, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import type { GenerationMode } from '../types/workspace';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export interface GenerationStep {
  label: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

interface ChatAreaProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  activeStep: number;
  stepStatusText: string;
  errorMsg: string | null;
  onSendPrompt: (prompt: string) => void;
  inputVal: string;
  setInputVal: (val: string) => void;
  hasGeneratedCode: boolean;
  generationMode: GenerationMode;
  onGenerationModeChange: (mode: GenerationMode) => void;
}

const modeOptions: Array<{ mode: GenerationMode; label: string }> = [
  { mode: 'build', label: 'Build' },
  { mode: 'refine', label: 'Refine' },
  { mode: 'fix', label: 'Fix' },
  { mode: 'explain', label: 'Explain' },
];

const modeSubtitles: Record<GenerationMode, string> = {
  build: 'Create a new standalone app',
  refine: 'Change the current app',
  fix: 'Repair the current app',
  explain: 'Explain without changing code',
};

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isGenerating,
  activeStep,
  stepStatusText,
  errorMsg,
  onSendPrompt,
  inputVal,
  setInputVal,
  hasGeneratedCode,
  generationMode,
  onGenerationModeChange
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const steps: GenerationStep[] = [
    { label: 'Connect API & Analyze requirements', status: 'pending' },
    { label: 'Synthesize HTML layout structure', status: 'pending' },
    { label: 'Generate premium CSS styling rules', status: 'pending' },
    { label: 'Compile interactive scripts logic', status: 'pending' }
  ];

  // Map step status based on activeStep
  const mappedSteps = steps.map((step, idx) => {
    if (activeStep > idx) return { ...step, status: 'completed' as const };
    if (activeStep === idx && isGenerating) return { ...step, status: 'active' as const };
    return step;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating, stepStatusText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim() && !isGenerating) {
      onSendPrompt(inputVal.trim());
    }
  };

  return (
    <div className="chat-panel" style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-primary)',
      height: '100%'
    }}>
      {/* Top Header */}
      <div className="panel-header" style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 700 }}>Workspace Studio</h2>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {modeSubtitles[generationMode]}
          </p>
        </div>
        <div style={{
          fontSize: '11px',
          color: generationMode === 'build' ? 'var(--text-secondary)' : '#10b981',
          border: '1px solid var(--border-color)',
          borderRadius: '999px',
          padding: '5px 9px',
          background: 'rgba(255,255,255,0.025)',
          fontWeight: 700
        }}>
          {generationMode.toUpperCase()} MODE
        </div>
      </div>

      {/* Main Chat Log */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.length === 0 ? (
          /* Blank State */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            padding: '20px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(0, 240, 255, 0.05)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: 'var(--accent-cyan)'
            }}>
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              What would you like to build?
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', maxWidth: '320px', lineHeight: '1.4' }}>
              Choose a starter blueprint template from the left panel, or type your own custom layout idea in the prompt bar below.
            </p>
          </div>
        ) : (
          /* Chat List */
          messages.map(msg => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              <div
                className={`message-bubble ${msg.sender === 'user' ? 'glass-panel' : ''}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: msg.sender === 'user' ? '12px 12px 0px 12px' : '12px 12px 12px 0px',
                  backgroundColor: msg.sender === 'user' ? 'rgba(0, 240, 255, 0.05)' : 'rgba(255,255,255,0.015)',
                  border: msg.sender === 'user' ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid var(--border-color)',
                  fontSize: '13.5px',
                  lineHeight: '1.5',
                  color: 'var(--text-primary)',
                  wordBreak: 'break-word'
                }}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}

        {/* Live Code Generation Progress State */}
        {isGenerating && (
          <div style={{ alignSelf: 'flex-start', width: '90%' }}>
            <div className="glass-panel" style={{
              padding: '18px',
              borderRadius: '12px 12px 12px 0px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <RefreshCw size={16} className="spinner-glow" style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                  {stepStatusText}
                </span>
              </div>
              
              <div className="stepper-container" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                {mappedSteps.map((step, idx) => (
                  <div key={idx} className={`step-item ${step.status}`}>
                    <div className="step-icon">
                      {step.status === 'completed' ? '✓' : idx + 1}
                    </div>
                    <span style={{ fontSize: '12px' }}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMsg && (
          <div style={{ alignSelf: 'stretch' }}>
            <div className="glass-panel" style={{
              padding: '14px 18px',
              borderRadius: '12px',
              borderColor: 'rgba(239, 68, 68, 0.2)',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              color: '#ef4444'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '12.5px', lineHeight: '1.4' }}>
                <strong>Error:</strong> {errorMsg}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Prompt Input Field */}
      <form className="panel-header" onSubmit={handleSubmit} style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        <div className="mode-segment" style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '10px',
          background: 'rgba(0, 0, 0, 0.18)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '4px'
        }}>
          {modeOptions.map(({ mode, label }) => {
            const isActive = generationMode === mode;
            const needsCode = mode !== 'build';
            const isDisabled = needsCode && !hasGeneratedCode;

            return (
              <button
                key={mode}
                type="button"
                onClick={() => onGenerationModeChange(mode)}
                disabled={isDisabled || isGenerating}
                aria-pressed={isActive}
                title={modeSubtitles[mode]}
                className="mode-button"
                style={{
                  flex: 1,
                  border: 'none',
                  borderRadius: '7px',
                  padding: '7px 8px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  cursor: isDisabled || isGenerating ? 'not-allowed' : 'pointer',
                  color: isActive ? '#020617' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-cyan)' : 'transparent',
                  opacity: isDisabled ? 0.35 : 1,
                  transition: 'all var(--transition-fast)'
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%'
        }}>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isGenerating}
            placeholder={
              isGenerating
                ? 'AI is working...'
                : generationMode === 'fix'
                  ? 'Describe the bug or broken behavior...'
                  : generationMode === 'explain'
                    ? 'Ask what this app does or how it works...'
                    : generationMode === 'refine'
                      ? 'Ask for a change to this app...'
                      : 'Ask to build your application...'
            }
            style={{
              width: '100%',
              padding: '14px 50px 14px 18px',
              borderRadius: '12px',
              fontSize: '13.5px',
              backgroundColor: 'var(--bg-primary)'
            }}
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isGenerating}
            className="btn btn-primary"
            style={{
              position: 'absolute',
              right: '8px',
              padding: '8px',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              opacity: !inputVal.trim() || isGenerating ? 0.3 : 1
            }}
          >
            {isGenerating ? (
              <RefreshCw size={16} className="spinner-glow" />
            ) : (
              <ArrowRight size={16} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
