import React, { useState, useRef, useEffect, useCallback } from 'react';
import { t, Lang } from '../i18n';
import { JobDescriptionAnalyzer, AnalysisResult } from '../utils/jobDescriptionAnalyzer';
import { AIConfig } from '../utils/aiProviders';

interface HistoryEntry {
  value: string;
  timestamp: number;
}

interface EnhancedJobDescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: Lang;
  aiConfig?: AIConfig;
  maxLength?: number;
}

export const EnhancedJobDescriptionEditor: React.FC<EnhancedJobDescriptionEditorProps> = ({
  value,
  onChange,
  language,
  aiConfig,
  maxLength = 5000,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPos, setCursorPos] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Undo/Redo history
  const [history, setHistory] = useState<HistoryEntry[]>([{ value: '', timestamp: Date.now() }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);

  const analyzer = useRef(new JobDescriptionAnalyzer(aiConfig));

  // Update cursor position
  useEffect(() => {
    if (textareaRef.current && !isUndoRedoAction) {
      textareaRef.current.selectionStart = cursorPos;
      textareaRef.current.selectionEnd = cursorPos;
    }
    setIsUndoRedoAction(false);
  }, [value, cursorPos, isUndoRedoAction]);

  // Handle value changes and update history
  useEffect(() => {
    if (!isUndoRedoAction && value !== history[historyIndex]?.value) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ value, timestamp: Date.now() });
      
      // Limit history to 50 entries
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        setHistoryIndex(historyIndex + 1);
      }
      
      setHistory(newHistory);
    }
  }, [value]);

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setIsUndoRedoAction(true);
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex].value);
    }
  }, [historyIndex, history, onChange]);

  // Redo function
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setIsUndoRedoAction(true);
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex].value);
    }
  }, [historyIndex, history, onChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'z' && e.shiftKey || e.key === 'y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value;

    const newValue = currentValue.substring(0, start) + textToInsert + currentValue.substring(end);
    onChange(newValue);

    const newCursorPos = start + textToInsert.length;
    setCursorPos(newCursorPos);
  };

  const wrapSelection = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      insertAtCursor(prefix + suffix);
      setCursorPos(start + prefix.length);
    } else {
      const selectedText = value.substring(start, end);
      const newValue = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
      onChange(newValue);
      setCursorPos(end + prefix.length + suffix.length);
    }
  };

  // Formatting functions
  const handleBold = () => wrapSelection('**');
  const handleItalic = () => wrapSelection('_');
  const handleUnderline = () => wrapSelection('<u>', '</u>');
  const handleStrikethrough = () => wrapSelection('~~');
  const handleCodeBlock = () => wrapSelection('```\n', '\n```');
  const handleInlineCode = () => wrapSelection('`');
  
  const handleLink = () => {
    const url = prompt(t(language, 'editor.linkUrlPrompt'));
    if (url) {
      const linkText = textareaRef.current?.value.substring(
        textareaRef.current.selectionStart,
        textareaRef.current.selectionEnd
      ) || 'Link';
      wrapSelection('[' + linkText + '](', url + ')');
    }
  };

  const handleBullet = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = value.substring(0, start);
    const lastNewline = beforeCursor.lastIndexOf('\n');
    const currentLine = beforeCursor.substring(lastNewline + 1);

    if (currentLine.trim() === '') {
      insertAtCursor('• ');
    } else {
      insertAtCursor('\n• ');
    }
  };

  const handleNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = value.substring(0, start);
    const lines = beforeCursor.split('\n');
    
    let lastNumber = 0;
    for (let i = lines.length - 1; i >= 0; i--) {
      const match = lines[i]?.match(/^(\d+)\.\s/);
      if (match && match[1]) {
        lastNumber = parseInt(match[1]);
        break;
      }
    }

    const currentLine = lines[lines.length - 1];
    const nextNumber = lastNumber + 1;

    if (currentLine.trim() === '') {
      insertAtCursor(`${nextNumber}. `);
    } else {
      insertAtCursor(`\n${nextNumber}. `);
    }
  };

  // AI Analysis
  const handleAnalyze = async () => {
    if (!value.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzer.current.analyze(value);
      setAnalysisResult(result);
      setShowAnalysis(true);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySuggestion = (originalText: string, suggestion: string) => {
    const newValue = value.replace(originalText, suggestion);
    onChange(newValue);
  };

  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="enhanced-jd-editor">
      <div className="editor-header">
        <h3 className="editor-title">
          📝 {t(language, 'jobEditor.title')}
        </h3>
        <div className="editor-actions">
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={handleAnalyze}
            disabled={!value.trim() || isAnalyzing}
          >
            {isAnalyzing ? '🔄 ' + t(language, 'jobEditor.analyzing') : '🤖 ' + t(language, 'jobEditor.analyze')}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? '📝 ' + t(language, 'jobEditor.edit') : '👁️ ' + t(language, 'jobEditor.preview')}
          </button>
        </div>
      </div>

      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={handleUndo}
            disabled={!canUndo}
            title={t(language, 'editor.undo') + ' (Ctrl+Z)'}
          >
            ↶
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={handleRedo}
            disabled={!canRedo}
            title={t(language, 'editor.redo') + ' (Ctrl+Y)'}
          >
            ↷
          </button>
        </div>
        <span className="toolbar-divider"></span>
        <div className="toolbar-group">
          <button type="button" className="toolbar-btn" onClick={handleBold} title={t(language, 'editor.bold')}>
            <strong>B</strong>
          </button>
          <button type="button" className="toolbar-btn" onClick={handleItalic} title={t(language, 'editor.italic')}>
            <em>I</em>
          </button>
          <button type="button" className="toolbar-btn" onClick={handleUnderline} title={t(language, 'editor.underline')}>
            <u>U</u>
          </button>
          <button type="button" className="toolbar-btn" onClick={handleStrikethrough} title={t(language, 'editor.strikethrough')}>
            <s>S</s>
          </button>
        </div>
        <span className="toolbar-divider"></span>
        <div className="toolbar-group">
          <button type="button" className="toolbar-btn" onClick={handleBullet} title={t(language, 'editor.bulletList')}>
            • {t(language, 'editor.bullet')}
          </button>
          <button type="button" className="toolbar-btn" onClick={handleNumberedList} title={t(language, 'editor.numberedList')}>
            1. {t(language, 'editor.numbered')}
          </button>
        </div>
        <span className="toolbar-divider"></span>
        <div className="toolbar-group">
          <button type="button" className="toolbar-btn" onClick={handleLink} title={t(language, 'editor.link')}>
            🔗
          </button>
          <button type="button" className="toolbar-btn" onClick={handleInlineCode} title={t(language, 'editor.inlineCode')}>
            {'<>'}
          </button>
          <button type="button" className="toolbar-btn" onClick={handleCodeBlock} title={t(language, 'editor.codeBlock')}>
            {'{...}'}
          </button>
        </div>
      </div>

      <div className="editor-content-wrapper">
        {showPreview ? (
          <div className="editor-preview">
            <div className="preview-content" dangerouslySetInnerHTML={{ __html: renderPreview(value) }} />
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            className="form-textarea rich-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t(language, 'job.placeholder')}
            maxLength={maxLength}
            onSelect={(e) => {
              const target = e.target as HTMLTextAreaElement;
              setCursorPos(target.selectionStart);
            }}
          />
        )}
      </div>

      <div className="editor-footer">
        <div className="editor-stats">
          <span className="stat-item">
            {t(language, 'editor.characters')}: {charCount}/{maxLength}
          </span>
          <span className="stat-item">
            {t(language, 'editor.words')}: {wordCount}
          </span>
          {analysisResult && (
            <span className="stat-item">
              {t(language, 'jobEditor.readability')}: {analysisResult.readabilityScore}/100
            </span>
          )}
        </div>
      </div>

      {showAnalysis && analysisResult && (
        <div className="analysis-panel">
          <div className="analysis-header">
            <h4>📊 {t(language, 'jobEditor.analysisResults')}</h4>
            <button className="btn-close" onClick={() => setShowAnalysis(false)}>✕</button>
          </div>

          {/* Tone Analysis */}
          <div className="analysis-section">
            <h5>🎭 {t(language, 'jobEditor.toneAnalysis')}</h5>
            <div className="tone-result">
              <div className="tone-badge tone-{analysisResult.toneAnalysis.overall}">
                {t(language, `jobEditor.tone.${analysisResult.toneAnalysis.overall}`)}
              </div>
              <div className="tone-score">
                {t(language, 'jobEditor.score')}: {analysisResult.toneAnalysis.score}/100
              </div>
            </div>
            {analysisResult.toneAnalysis.recommendations.length > 0 && (
              <ul className="recommendations-list">
                {analysisResult.toneAnalysis.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Grammar Issues */}
          {analysisResult.grammarIssues.length > 0 && (
            <div className="analysis-section">
              <h5>✏️ {t(language, 'jobEditor.grammarIssues')}</h5>
              <div className="issues-list">
                {analysisResult.grammarIssues.slice(0, 10).map((issue, idx) => (
                  <div key={idx} className="issue-item">
                    <div className="issue-type">{issue.type}</div>
                    <div className="issue-text">"{issue.text}"</div>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleApplySuggestion(issue.text, issue.suggestion)}
                    >
                      {t(language, 'jobEditor.fix')}: "{issue.suggestion}"
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {analysisResult.suggestions.length > 0 && (
            <div className="analysis-section">
              <h5>💡 {t(language, 'jobEditor.suggestions')}</h5>
              <ul className="suggestions-list">
                {analysisResult.suggestions.map((suggestion, idx) => (
                  <li key={idx}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Keywords */}
          {analysisResult.keywords.length > 0 && (
            <div className="analysis-section">
              <h5>🔑 {t(language, 'jobEditor.keywords')}</h5>
              <div className="keywords-container">
                {analysisResult.keywords.map((keyword, idx) => (
                  <span key={idx} className="keyword-tag">{keyword}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Render markdown-like preview
 */
function renderPreview(text: string): string {
  let html = text
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Bullets
    .replace(/^• (.+)$/gm, '<li>$1</li>')
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br/>');

  // Wrap lists
  html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
  
  // Wrap in paragraph
  html = '<p>' + html + '</p>';

  return html;
}
