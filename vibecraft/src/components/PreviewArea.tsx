import React, { useMemo, useState } from 'react';
import { AlertTriangle, Check, Code, Copy, Download, Eye, RotateCcw, Save } from 'lucide-react';
import type { OutputSource, VersionRecord } from '../types/workspace';
import { scanGeneratedHtml } from '../utils/riskScanner';

interface PreviewAreaProps {
  code: string;
  outputSource: OutputSource;
  versions: VersionRecord[];
  hasUnsavedChanges: boolean;
  onCodeChange: (code: string) => void;
  onSaveRevision: () => void;
  onRestoreVersion: (versionId: string) => void;
}

const sourceLabels: Record<OutputSource, string> = {
  empty: 'NO OUTPUT',
  demo: 'DEMO TEMPLATE',
  ai: 'AI GENERATED',
  manual: 'MANUAL EDIT',
};

const sourceColors: Record<OutputSource, string> = {
  empty: 'var(--text-muted)',
  demo: '#f59e0b',
  ai: '#10b981',
  manual: 'var(--accent-cyan)',
};

export const PreviewArea: React.FC<PreviewAreaProps> = ({
  code,
  outputSource,
  versions,
  hasUnsavedChanges,
  onCodeChange,
  onSaveRevision,
  onRestoreVersion,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const risks = useMemo(() => scanGeneratedHtml(code), [code]);

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (code) {
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vibecraft-application.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="preview-panel" style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border-color)',
      height: '100%'
    }}>
      {/* Top Header & Tabs */}
      <div className="panel-header preview-toolbar" style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-secondary)',
        flexShrink: 0
      }}>
        {/* Tab Controls */}
        <div className="tab-segment" style={{
          display: 'flex',
          gap: '4px',
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setActiveTab('preview')}
            aria-pressed={activeTab === 'preview'}
            className="tab-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              background: activeTab === 'preview' ? 'var(--bg-tertiary)' : 'transparent',
              color: activeTab === 'preview' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Eye size={14} />
            Live Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            aria-pressed={activeTab === 'code'}
            className="tab-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              background: activeTab === 'code' ? 'var(--bg-tertiary)' : 'transparent',
              color: activeTab === 'code' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Code size={14} />
            Code View
          </button>
        </div>

        {/* Action Controls */}
        {code && (
          <div className="preview-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              fontSize: '10px',
              color: sourceColors[outputSource],
              border: `1px solid ${sourceColors[outputSource]}`,
              borderRadius: '999px',
              padding: '5px 8px',
              fontWeight: 800,
              letterSpacing: '0.3px',
              whiteSpace: 'nowrap'
            }}>
              {sourceLabels[outputSource]}{hasUnsavedChanges ? ' *' : ''}
            </span>
            {versions.length > 0 && (
              <label style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <RotateCcw size={13} style={{ position: 'absolute', left: '9px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <select
                  aria-label="Restore saved revision"
                  value=""
                  onChange={(event) => onRestoreVersion(event.target.value)}
                  style={{
                    width: '120px',
                    padding: '6px 8px 6px 28px',
                    borderRadius: '6px',
                    fontSize: '11.5px'
                  }}
                >
                  <option value="">History ({versions.length})</option>
                  {[...versions].reverse().map((version) => (
                    <option key={version.id} value={version.id}>
                      {version.label} · {new Date(version.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {hasUnsavedChanges && (
              <button
                onClick={onSaveRevision}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', gap: '6px' }}
              >
                <Save size={13} />
                Save Revision
              </button>
            )}
            <button
              onClick={handleCopy}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', gap: '6px' }}
            >
              {copied ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="btn btn-primary"
              style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', gap: '6px', color: '#000' }}
            >
              <Download size={13} />
              Download
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {risks.length > 0 && (
        <div className="risk-banner" style={{
          padding: '10px 20px',
          borderBottom: '1px solid rgba(245, 158, 11, 0.24)',
          background: 'rgba(245, 158, 11, 0.08)',
          color: '#fbbf24',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
            <strong style={{ fontSize: '12px' }}>Security Warning</strong>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {risks.map((risk) => (
                <span key={risk.id} style={{
                  fontSize: '11px',
                  color: risk.level === 'danger' ? '#fecaca' : '#fde68a',
                  border: `1px solid ${risk.level === 'danger' ? 'rgba(248, 113, 113, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
                  borderRadius: '999px',
                  padding: '3px 7px',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {risk.label}: {risk.detail}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="preview-stage" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {!code ? (
          /* Empty Code State */
          <div className="empty-monitor" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            padding: '24px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: 'var(--text-muted)'
            }}>
              <Eye size={20} />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Preview Monitor
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '240px', lineHeight: '1.4' }}>
              Your generated app layout will render interactively in this section.
            </p>
          </div>
        ) : activeTab === 'preview' ? (
          /* Live Sandbox Preview (Iframe) */
          <iframe
            srcDoc={code}
            title="VibeCraft Sandbox Preview"
            sandbox="allow-scripts allow-modals"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#fff' // White canvas context inside preview so mock templates are visible
            }}
          />
        ) : (
          /* Editable code view */
          <div style={{
            height: '100%',
            padding: '20px',
            backgroundColor: 'var(--bg-primary)'
          }}>
            <textarea
              aria-label="Generated HTML code editor"
              value={code}
              onChange={(event) => onCodeChange(event.target.value)}
              spellCheck={false}
              style={{
              width: '100%',
              height: '100%',
              resize: 'none',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              backgroundColor: '#09090e',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: '#d4d4d8',
              lineHeight: '1.5',
              padding: '14px',
              outline: 'none',
              whiteSpace: 'pre',
              overflow: 'auto'
            }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
