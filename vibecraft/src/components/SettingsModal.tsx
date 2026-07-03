import React, { useState } from 'react';
import { X, Key, Shield, HelpCircle, Trash2 } from 'lucide-react';
import type { AiProvider } from '../types/workspace';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigurationChange: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onConfigurationChange }) => {
  const [provider, setProvider] = useState<AiProvider>(() => localStorage.getItem('vibecraft_ai_provider') === 'gemini' ? 'gemini' : 'mistral');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('vibecraft_api_key') || '');
  const [model, setModel] = useState(() => localStorage.getItem('vibecraft_model') || 'gemini-2.5-flash');
  const [mistralKey1, setMistralKey1] = useState(() => localStorage.getItem('vibecraft_mistral_api_key_1') || '');
  const [mistralKey2, setMistralKey2] = useState(() => localStorage.getItem('vibecraft_mistral_api_key_2') || '');
  const [mistralModel, setMistralModel] = useState(() => localStorage.getItem('vibecraft_mistral_model') || 'mistral-large-latest');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('vibecraft_ai_provider', provider);
    localStorage.setItem('vibecraft_api_key', apiKey.trim());
    localStorage.setItem('vibecraft_model', model);
    localStorage.setItem('vibecraft_mistral_api_key_1', mistralKey1.trim());
    localStorage.setItem('vibecraft_mistral_api_key_2', mistralKey2.trim());
    localStorage.setItem('vibecraft_mistral_model', mistralModel);
    onConfigurationChange();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleClearKey = () => {
    localStorage.removeItem('vibecraft_api_key');
    localStorage.removeItem('vibecraft_mistral_api_key_1');
    localStorage.removeItem('vibecraft_mistral_api_key_2');
    setApiKey('');
    setMistralKey1('');
    setMistralKey2('');
    onConfigurationChange();
  };

  return (
    <div className="settings-backdrop" style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="glass-panel settings-card" style={{
        width: '90%',
        maxWidth: '450px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        <button onClick={onClose} className="icon-button" style={{
          position: 'absolute',
          top: '20px', right: '20px',
          background: 'none', border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer'
        }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(0, 240, 255, 0.1)',
            padding: '10px',
            borderRadius: '10px',
            color: 'var(--accent-cyan)'
          }}>
            <Key size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>AI Provider Settings</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Configure Mistral or Gemini for real app generation</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="ai-provider" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Active Provider</label>
          <select id="ai-provider" value={provider} onChange={(e) => setProvider(e.target.value as AiProvider)} style={{ width: '100%' }}>
            <option value="mistral">Mistral AI (Primary)</option>
            <option value="gemini">Google Gemini (Fallback)</option>
          </select>
        </div>

        {provider === 'mistral' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="mistral-key-1" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Mistral API Key 1</label>
              <input
                id="mistral-key-1"
                type={showKey ? 'text' : 'password'}
                value={mistralKey1}
                onChange={(e) => setMistralKey1(e.target.value)}
                placeholder="Paste primary Mistral API key"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="mistral-key-2" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Mistral API Key 2</label>
              <input
                id="mistral-key-2"
                type={showKey ? 'text' : 'password'}
                value={mistralKey2}
                onChange={(e) => setMistralKey2(e.target.value)}
                placeholder="Optional fallback Mistral API key"
              />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={12} /> Key 2 is used only if Key 1 fails, rate-limits, or returns an API error.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="mistral-model" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Mistral Model</label>
              <select id="mistral-model" value={mistralModel} onChange={(e) => setMistralModel(e.target.value)} style={{ width: '100%' }}>
                <option value="mistral-large-latest">Mistral Large Latest (Highest quality)</option>
                <option value="mistral-medium-latest">Mistral Medium Latest (Balanced)</option>
                <option value="codestral-latest">Codestral Latest (Code-focused)</option>
              </select>
            </div>
          </>
        )}

        {provider === 'gemini' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="gemini-key" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Gemini API Key</label>
              <input
                id="gemini-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste AIzaSy... API key here"
              />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={12} /> Key stays in this browser storage and is sent only to Google Gemini API when online generation runs.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="gemini-model" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Gemini Model</label>
              <select id="gemini-model" value={model} onChange={(e) => setModel(e.target.value)} style={{ width: '100%' }}>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fastest, default)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Most intelligent, high quality)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fallback)</option>
              </select>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className="btn btn-secondary"
          style={{ padding: '8px 10px', fontSize: '11.5px', alignSelf: 'flex-start' }}
        >
          {showKey ? 'Hide API Keys' : 'Show API Keys'}
        </button>

        <div className="glass-panel" style={{
          padding: '12px 16px',
          fontSize: '11.5px',
          color: 'var(--text-secondary)',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start',
          lineHeight: '1.4'
        }}>
          <HelpCircle size={22} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
          <span>
            Browser API keys are stored only in this browser localStorage and are sent directly from the browser to the selected provider. Production can also use the owner's Mistral server proxy configured through Vercel env. Without either option, VibeCraft runs in <strong>Offline Demo Mode</strong> with built-in templates.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button onClick={handleClearKey} className="btn btn-secondary" style={{ padding: '10px 12px' }} title="Remove stored API key">
            <Trash2 size={16} />
          </button>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary" style={{ flex: 2 }}>
            {saved ? 'Saved!' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};
