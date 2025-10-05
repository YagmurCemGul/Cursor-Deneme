import React, { useState, useRef, useEffect } from 'react';
import { t, Lang } from '../i18n';
import { DescriptionTemplates } from './DescriptionTemplates';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  language: Lang;
  maxLength?: number;
  showWordCount?: boolean;
  onClear?: () => void;
  templateType?: 'experience' | 'education' | 'certification' | 'project';
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  language,
  maxLength = 2000,
  showWordCount = true,
  onClear,
  templateType
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPos, setCursorPos] = useState<number>(0);

  // Calculate character and word count
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  // Track cursor position
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.selectionStart = cursorPos;
      textareaRef.current.selectionEnd = cursorPos;
    }
  }, [value, cursorPos]);

  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value;

    const newValue = currentValue.substring(0, start) + textToInsert + currentValue.substring(end);
    onChange(newValue);
    
    // Set cursor position after the inserted text
    const newCursorPos = start + textToInsert.length;
    setCursorPos(newCursorPos);
  };

  const handleAddBullet = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const currentValue = value;
    
    // Check if we're at the start of a line
    const beforeCursor = currentValue.substring(0, start);
    const lastNewline = beforeCursor.lastIndexOf('\n');
    const currentLine = beforeCursor.substring(lastNewline + 1);
    
    if (currentLine.trim() === '') {
      // At the start of a line or line is empty
      insertAtCursor('• ');
    } else {
      // In the middle of text, add newline then bullet
      insertAtCursor('\n• ');
    }
  };

  const handleAddNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const currentValue = value;
    
    // Check if we're at the start of a line
    const beforeCursor = currentValue.substring(0, start);
    const lastNewline = beforeCursor.lastIndexOf('\n');
    const currentLine = beforeCursor.substring(lastNewline + 1);
    
    // Count existing numbered items to determine next number
    const lines = beforeCursor.split('\n');
    let lastNumber = 0;
    for (let i = lines.length - 1; i >= 0; i--) {
      const match = lines[i].match(/^(\d+)\.\s/);
      if (match) {
        lastNumber = parseInt(match[1]);
        break;
      }
    }
    
    const nextNumber = lastNumber + 1;
    
    if (currentLine.trim() === '') {
      insertAtCursor(`${nextNumber}. `);
    } else {
      insertAtCursor(`\n${nextNumber}. `);
    }
  };

  const handleFormatBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) {
      // No selection, just insert markers
      insertAtCursor('****');
      setCursorPos(start + 2); // Place cursor between markers
    } else {
      // Wrap selection
      const selectedText = value.substring(start, end);
      const newValue = value.substring(0, start) + '**' + selectedText + '**' + value.substring(end);
      onChange(newValue);
      setCursorPos(end + 4);
    }
  };

  const handleFormatItalic = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) {
      // No selection, just insert markers
      insertAtCursor('__');
      setCursorPos(start + 1);
    } else {
      // Wrap selection
      const selectedText = value.substring(start, end);
      const newValue = value.substring(0, start) + '_' + selectedText + '_' + value.substring(end);
      onChange(newValue);
      setCursorPos(end + 2);
    }
  };

  const handleClearFormatting = () => {
    // Remove markdown formatting
    let cleanedValue = value
      .replace(/\*\*/g, '') // Remove bold
      .replace(/_/g, '')     // Remove italic
      .replace(/^•\s/gm, '') // Remove bullets
      .replace(/^\d+\.\s/gm, ''); // Remove numbered lists
    
    onChange(cleanedValue);
  };

  const handleClear = () => {
    if (window.confirm(t(language, 'editor.confirmClear'))) {
      onChange('');
      if (onClear) onClear();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    const html = e.clipboardData.getData('text/html');
    
    // If HTML is available, try to extract formatted content
    if (html) {
      e.preventDefault();
      
      // Extract list items from HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      const listItems = tempDiv.querySelectorAll('li');
      if (listItems.length > 0) {
        const lines: string[] = [];
        listItems.forEach((li, index) => {
          const text = li.textContent?.trim() || '';
          // Check if it's from an ordered list
          const isOrdered = li.parentElement?.tagName === 'OL';
          if (isOrdered) {
            lines.push(`${index + 1}. ${text}`);
          } else {
            lines.push(`• ${text}`);
          }
        });
        insertAtCursor(lines.join('\n'));
        return;
      }
      
      // Extract paragraphs
      const paragraphs = tempDiv.querySelectorAll('p');
      if (paragraphs.length > 0) {
        const lines = Array.from(paragraphs).map(p => p.textContent?.trim() || '');
        insertAtCursor(lines.join('\n'));
        return;
      }
    }
    
    // Fallback to text-based detection
    if (text.includes('•') || text.includes('\n- ') || text.includes('\n* ') || /^\d+\.\s/.test(text)) {
      e.preventDefault();
      const normalized = text
        .split(/\n/)
        .map(line => {
          line = line.trim();
          // Handle different bullet formats
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return '• ' + line.substring(2);
          }
          // Handle numbered lists
          const numMatch = line.match(/^(\d+)\.\s(.+)/);
          if (numMatch) {
            return numMatch[1] + '. ' + numMatch[2];
          }
          // Already has bullet
          if (line.startsWith('•')) {
            return line;
          }
          return line;
        })
        .filter(Boolean)
        .join('\n');
      
      insertAtCursor(normalized);
    }
  };

  const handleTemplateSelect = (template: string) => {
    if (value && !value.endsWith('\n')) {
      insertAtCursor('\n' + template);
    } else {
      insertAtCursor(template);
    }
  };

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button 
            type="button"
            className="toolbar-btn" 
            onClick={handleFormatBold}
            title={t(language, 'editor.bold')}
          >
            <strong>B</strong>
          </button>
          <button 
            type="button"
            className="toolbar-btn" 
            onClick={handleFormatItalic}
            title={t(language, 'editor.italic')}
          >
            <em>I</em>
          </button>
          <span className="toolbar-divider"></span>
          <button 
            type="button"
            className="toolbar-btn" 
            onClick={handleAddBullet}
            title={t(language, 'editor.bulletList')}
          >
            • {t(language, 'editor.bullet')}
          </button>
          <button 
            type="button"
            className="toolbar-btn" 
            onClick={handleAddNumberedList}
            title={t(language, 'editor.numberedList')}
          >
            1. {t(language, 'editor.numbered')}
          </button>
          <span className="toolbar-divider"></span>
          <button 
            type="button"
            className="toolbar-btn toolbar-btn-warning" 
            onClick={handleClearFormatting}
            title={t(language, 'editor.clearFormatting')}
          >
            {t(language, 'editor.clearFormat')}
          </button>
          <button 
            type="button"
            className="toolbar-btn toolbar-btn-danger" 
            onClick={handleClear}
            title={t(language, 'editor.clearAll')}
          >
            🗑️
          </button>
        </div>
        {templateType && (
          <DescriptionTemplates
            onSelect={handleTemplateSelect}
            language={language}
            type={templateType}
          />
        )}
      </div>
      
      <textarea
        ref={textareaRef}
        className="form-textarea rich-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        onPaste={handlePaste}
        onSelect={(e) => {
          const target = e.target as HTMLTextAreaElement;
          setCursorPos(target.selectionStart);
        }}
      />
      
      {showWordCount && (
        <div className="editor-footer">
          <div className="editor-stats">
            <span className="stat-item">
              {t(language, 'editor.characters')}: {charCount}/{maxLength}
            </span>
            <span className="stat-item">
              {t(language, 'editor.words')}: {wordCount}
            </span>
          </div>
          <div className="editor-hints">
            <span className="hint-text">
              💡 {t(language, 'editor.hint')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
