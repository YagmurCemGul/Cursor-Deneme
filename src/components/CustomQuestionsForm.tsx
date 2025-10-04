import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CustomQuestion } from '../types';
import { t, Lang } from '../i18n';
import { RichTextEditor } from './RichTextEditor';

interface CustomQuestionsFormProps {
  questions: CustomQuestion[];
  onChange: (questions: CustomQuestion[]) => void;
  language: Lang;
}

export const CustomQuestionsForm: React.FC<CustomQuestionsFormProps> = ({
  questions,
  onChange,
  language,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<CustomQuestion['type']>('text');
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>([]);
  const [currentOptionText, setCurrentOptionText] = useState('');
  const [newQuestionRequired, setNewQuestionRequired] = useState(false);
  const [newQuestionMaxLength, setNewQuestionMaxLength] = useState<number>(500);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Normalize questions on mount to ensure proper answer initialization
  React.useEffect(() => {
    const normalizedQuestions = questions.map((q) => normalizeQuestion(q));
    const needsUpdate = normalizedQuestions.some((nq, idx) => {
      const originalQuestion = questions[idx];
      return (
        originalQuestion && JSON.stringify(nq.answer) !== JSON.stringify(originalQuestion.answer)
      );
    });
    if (needsUpdate) {
      onChange(normalizedQuestions);
    }
  }, []);

  // Validate all questions
  const validateQuestions = useCallback(() => {
    const errors = new Set<string>();
    questions.forEach((question) => {
      if (question.required) {
        if (question.type === 'checkbox') {
          const checkboxAnswers = Array.isArray(question.answer) ? question.answer : [];
          if (checkboxAnswers.length === 0) {
            errors.add(question.id);
          }
        } else if (question.type === 'file') {
          if (!question.fileData) {
            errors.add(question.id);
          }
        } else {
          const textAnswer = Array.isArray(question.answer) ? '' : question.answer || '';
          if (!textAnswer.trim()) {
            errors.add(question.id);
          }
        }
      }
    });
    setValidationErrors(errors);
    return errors.size === 0;
  }, [questions]);

  // Auto-save with debounce
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setAutoSaveStatus('saving');

    autoSaveTimerRef.current = setTimeout(() => {
      setAutoSaveStatus('saved');
      validateQuestions();
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 2000);
    }, 1000);
  }, [validateQuestions]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const requiresOptions = (type: CustomQuestion['type']) => {
    return type === 'choice' || type === 'selection' || type === 'checkbox';
  };

  const supportsCharacterLimit = (type: CustomQuestion['type']) => {
    return type === 'form_group' || type === 'fieldset';
  };

  // Normalize question to ensure answer field is properly initialized
  const normalizeQuestion = (question: CustomQuestion): CustomQuestion => {
    if (question.type === 'checkbox') {
      // Checkbox should have array answer
      return {
        ...question,
        answer: Array.isArray(question.answer) ? question.answer : [],
      };
    } else if (question.type === 'file') {
      // File type should have empty string answer
      return {
        ...question,
        answer: '',
      };
    } else {
      // Text, form_group, fieldset, choice, selection should have string answer
      return {
        ...question,
        answer: typeof question.answer === 'string' ? question.answer : '',
      };
    }
  };

  const handleAddOption = () => {
    if (currentOptionText.trim()) {
      setNewQuestionOptions([...newQuestionOptions, currentOptionText.trim()]);
      setCurrentOptionText('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setNewQuestionOptions(newQuestionOptions.filter((_, idx) => idx !== index));
  };

  const handleTypeChange = (type: CustomQuestion['type']) => {
    setNewQuestionType(type);
    // Reset options when changing type
    if (!requiresOptions(type)) {
      setNewQuestionOptions([]);
      setCurrentOptionText('');
    }
    // Set default max length for character-limited types
    if (supportsCharacterLimit(type) && !newQuestionMaxLength) {
      setNewQuestionMaxLength(500);
    }
  };

  const handleAdd = () => {
    if (!newQuestionText.trim()) return;

    // Validate options for option-based question types
    if (requiresOptions(newQuestionType) && newQuestionOptions.length === 0) {
      alert(t(language, 'questions.optionsRequired'));
      return;
    }

    const newQuestion: CustomQuestion = {
      id: Date.now().toString(),
      question: newQuestionText,
      type: newQuestionType,
      options: requiresOptions(newQuestionType) ? newQuestionOptions : undefined,
      answer: newQuestionType === 'checkbox' ? [] : '',
      required: newQuestionRequired,
      ...(supportsCharacterLimit(newQuestionType) && { maxLength: newQuestionMaxLength }),
    };

    onChange([...questions, newQuestion]);
    setNewQuestionText('');
    setNewQuestionType('text');
    setNewQuestionOptions([]);
    setCurrentOptionText('');
    setNewQuestionRequired(false);
    setNewQuestionMaxLength(500);
    setIsAdding(false);
  };

  const handleUpdate = (id: string, field: keyof CustomQuestion, value: any) => {
    onChange(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
    triggerAutoSave();
  };

  const handleRemove = (id: string) => {
    onChange(questions.filter((q) => q.id !== id));
    setValidationErrors((prev) => {
      const newErrors = new Set(prev);
      newErrors.delete(id);
      return newErrors;
    });
  };

  const handleFileUpload = (questionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert(t(language, 'questions.fileTooLarge'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      handleUpdate(questionId, 'fileData', {
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (questionId: string) => {
    handleUpdate(questionId, 'fileData', undefined);
  };

  const renderAnswerInput = (question: CustomQuestion) => {
    const hasError = validationErrors.has(question.id);

    switch (question.type) {
      case 'text': {
        const textAnswer = Array.isArray(question.answer) ? '' : question.answer || '';
        return (
          <textarea
            className={`form-textarea ${hasError ? 'error' : ''}`}
            value={textAnswer}
            onChange={(e) => handleUpdate(question.id, 'answer', e.target.value)}
            placeholder={t(language, 'questions.answerPlaceholder')}
            rows={3}
            style={hasError ? { borderColor: '#dc3545' } : {}}
          />
        );
      }

      case 'form_group': {
        const textAnswer = Array.isArray(question.answer) ? '' : question.answer || '';
        const maxLength = question.maxLength || 500;
        const remaining = maxLength - textAnswer.length;

        return (
          <div>
            <RichTextEditor
              value={textAnswer}
              onChange={(value) => handleUpdate(question.id, 'answer', value)}
              placeholder={t(language, 'questions.answerPlaceholder')}
              language={language}
              maxLength={maxLength}
              showWordCount={true}
            />
            <div
              style={{
                marginTop: '4px',
                fontSize: '0.85em',
                color: remaining < 50 ? '#dc3545' : 'var(--text-secondary)',
              }}
            >
              {remaining} {t(language, 'questions.charactersRemaining')}
            </div>
          </div>
        );
      }

      case 'fieldset': {
        const textAnswer = Array.isArray(question.answer) ? '' : question.answer || '';
        const maxLength = question.maxLength || 500;
        const remaining = maxLength - textAnswer.length;

        return (
          <div>
            <textarea
              className={`form-textarea ${hasError ? 'error' : ''}`}
              value={textAnswer}
              onChange={(e) => handleUpdate(question.id, 'answer', e.target.value)}
              placeholder={t(language, 'questions.answerPlaceholder')}
              rows={5}
              maxLength={maxLength}
              style={hasError ? { borderColor: '#dc3545' } : {}}
            />
            <div
              style={{
                marginTop: '4px',
                fontSize: '0.85em',
                color: remaining < 50 ? '#dc3545' : 'var(--text-secondary)',
              }}
            >
              {remaining} {t(language, 'questions.charactersRemaining')}
            </div>
          </div>
        );
      }

      case 'choice':
      case 'selection': {
        const radioAnswer = Array.isArray(question.answer) ? '' : question.answer || '';
        return (
          <div className="radio-group">
            {question.options && question.options.length > 0 ? (
              question.options.map((option, idx) => (
                <div key={idx} className="radio-item">
                  <input
                    type="radio"
                    id={`${question.id}-${idx}`}
                    name={question.id}
                    checked={radioAnswer === option}
                    onChange={() => handleUpdate(question.id, 'answer', option)}
                  />
                  <label htmlFor={`${question.id}-${idx}`}>{option}</label>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                {t(language, 'questions.optionsRequired')}
              </div>
            )}
          </div>
        );
      }

      case 'checkbox': {
        const checkboxAnswers = Array.isArray(question.answer) ? question.answer : [];
        return (
          <div className="checkbox-group">
            {question.options && question.options.length > 0 ? (
              question.options.map((option, idx) => (
                <div key={idx} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`${question.id}-${idx}`}
                    checked={checkboxAnswers.includes(option)}
                    onChange={(e) => {
                      const newAnswers = e.target.checked
                        ? [...checkboxAnswers, option]
                        : checkboxAnswers.filter((a) => a !== option);
                      handleUpdate(question.id, 'answer', newAnswers);
                    }}
                  />
                  <label htmlFor={`${question.id}-${idx}`}>{option}</label>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                {t(language, 'questions.optionsRequired')}
              </div>
            )}
          </div>
        );
      }

      case 'file': {
        return (
          <div style={{ marginTop: '8px' }}>
            {question.fileData ? (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>📎 {question.fileData.name}</div>
                  <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>
                    {(question.fileData.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-danger btn-icon"
                  onClick={() => handleRemoveFile(question.id)}
                  title={t(language, 'questions.removeFile')}
                  style={{ minWidth: 'auto', padding: '4px 8px' }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <label
                  htmlFor={`file-${question.id}`}
                  className="btn btn-secondary"
                  style={{ cursor: 'pointer', display: 'inline-block' }}
                >
                  📁 {t(language, 'questions.chooseFile')}
                </label>
                <input
                  type="file"
                  id={`file-${question.id}`}
                  onChange={(e) => handleFileUpload(question.id, e)}
                  style={{ display: 'none' }}
                  accept="*/*"
                />
                <div style={{ marginTop: '4px', fontSize: '0.85em', color: 'var(--text-secondary)' }}>
                  {t(language, 'questions.noFileChosen')}
                </div>
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="section-title">
          ❓ {t(language, 'questions.section')}
          <button className="btn btn-primary btn-icon" onClick={() => setIsAdding(!isAdding)}>
            {isAdding ? `✕ ${t(language, 'questions.cancel')}` : `+ ${t(language, 'questions.add')}`}
          </button>
        </h2>
        {autoSaveStatus !== 'idle' && (
          <div
            style={{
              fontSize: '0.85em',
              color: autoSaveStatus === 'saving' ? 'var(--text-secondary)' : '#28a745',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {autoSaveStatus === 'saving' ? '💾' : '✓'}{' '}
            {t(language, autoSaveStatus === 'saving' ? 'questions.autoSaving' : 'questions.autoSaved')}
          </div>
        )}
      </div>

      {validationErrors.size > 0 && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '6px',
            marginBottom: '16px',
            color: '#856404',
          }}
        >
          ⚠️ {t(language, 'questions.validationError')}
        </div>
      )}

      {isAdding && (
        <div className="card add-question-card">
          <div className="form-group">
            <label className="form-label">{t(language, 'questions.questionText')}</label>
            <input
              type="text"
              className="form-input"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder={t(language, 'questions.questionPlaceholder')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t(language, 'questions.questionType')}</label>
            <select
              className="form-select"
              value={newQuestionType}
              onChange={(e) => handleTypeChange(e.target.value as CustomQuestion['type'])}
            >
              <option value="text">{t(language, 'questions.textInput')}</option>
              <option value="form_group">{t(language, 'questions.formGroup')}</option>
              <option value="choice">{t(language, 'questions.choice')}</option>
              <option value="fieldset">{t(language, 'questions.fieldset')}</option>
              <option value="selection">{t(language, 'questions.selection')}</option>
              <option value="checkbox">{t(language, 'questions.checkbox')}</option>
              <option value="file">{t(language, 'questions.fileUpload')}</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={newQuestionRequired}
                onChange={(e) => setNewQuestionRequired(e.target.checked)}
              />
              <span>{t(language, 'questions.markAsRequired')}</span>
            </label>
          </div>

          {supportsCharacterLimit(newQuestionType) && (
            <div className="form-group">
              <label className="form-label">{t(language, 'questions.characterLimit')}</label>
              <input
                type="number"
                className="form-input"
                value={newQuestionMaxLength}
                onChange={(e) => setNewQuestionMaxLength(parseInt(e.target.value) || 500)}
                min="50"
                max="5000"
              />
            </div>
          )}

          {requiresOptions(newQuestionType) && (
            <div className="form-group">
              <label className="form-label">
                {t(language, 'questions.options')}
                <span className="form-help-text"> - {t(language, 'questions.optionsHelp')}</span>
              </label>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  className="form-input"
                  value={currentOptionText}
                  onChange={(e) => setCurrentOptionText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                  placeholder={t(language, 'questions.optionPlaceholder')}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddOption}
                  disabled={!currentOptionText.trim()}
                >
                  + {t(language, 'questions.addOption')}
                </button>
              </div>

              {newQuestionOptions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {newQuestionOptions.map((option, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <span style={{ flex: 1 }}>
                        {newQuestionType === 'checkbox' ? '☑' : '◉'} {option}
                      </span>
                      <button
                        type="button"
                        className="btn btn-danger btn-icon"
                        onClick={() => handleRemoveOption(idx)}
                        title={t(language, 'questions.removeOption')}
                        style={{ minWidth: 'auto', padding: '4px 8px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button className="btn btn-success" onClick={handleAdd}>
            ✓ {t(language, 'questions.add')}
          </button>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">❓</div>
          <div className="empty-state-text">{t(language, 'questions.emptyState')}</div>
        </div>
      ) : (
        <div className="card-list">
          {questions.map((question) => (
            <div
              key={question.id}
              className="card"
              style={validationErrors.has(question.id) ? { borderColor: '#dc3545' } : {}}
            >
              <div className="card-header">
                <div>
                  <div className="card-title">
                    {question.question}
                    {question.required && (
                      <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
                    )}
                  </div>
                  <div className="card-meta">
                    {t(language, 'questions.type')}: {question.type}
                    {question.required && (
                      <span
                        style={{
                          marginLeft: '8px',
                          padding: '2px 6px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '0.75em',
                        }}
                      >
                        {t(language, 'questions.required')}
                      </span>
                    )}
                    {question.options && question.options.length > 0 && (
                      <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>
                        ({question.options.length} {t(language, 'questions.options').toLowerCase()})
                      </span>
                    )}
                    {question.maxLength && (
                      <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>
                        (max: {question.maxLength} chars)
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="btn btn-danger btn-icon"
                  onClick={() => handleRemove(question.id)}
                >
                  🗑️
                </button>
              </div>

              {question.options &&
                question.options.length === 0 &&
                requiresOptions(question.type) && (
                  <div
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--warning-bg, #fff3cd)',
                      border: '1px solid var(--warning-border, #ffc107)',
                      borderRadius: '6px',
                      marginBottom: '12px',
                      color: 'var(--warning-text, #856404)',
                    }}
                  >
                    ⚠️ {t(language, 'questions.optionsRequired')}
                  </div>
                )}

              <div className="form-group">
                <label className="form-label">
                  {t(language, 'questions.answer')}
                  {(question.type === 'form_group' || question.type === 'fieldset') && (
                    <span
                      style={{
                        marginLeft: '8px',
                        fontSize: '0.85em',
                        color: 'var(--text-secondary)',
                        fontWeight: 'normal',
                      }}
                    >
                      ({t(language, 'questions.multilineInput')})
                    </span>
                  )}
                </label>
                {renderAnswerInput(question)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
