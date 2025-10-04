import React, { useState, useEffect, useRef } from 'react';
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
  const [newQuestionMaxLength, setNewQuestionMaxLength] = useState<number | undefined>(undefined);
  const [autoSaveMessage, setAutoSaveMessage] = useState('');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Auto-save functionality with debouncing
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (questions.length > 0) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        // Trigger auto-save message
        setAutoSaveMessage(t(language, 'questions.autoSaved'));
        setTimeout(() => setAutoSaveMessage(''), 2000);
      }, 1000); // Auto-save after 1 second of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [questions, language]);

  const requiresOptions = (type: CustomQuestion['type']) => {
    return type === 'choice' || type === 'selection' || type === 'checkbox';
  };

  // Normalize question to ensure answer field is properly initialized
  const normalizeQuestion = (question: CustomQuestion): CustomQuestion => {
    if (question.type === 'checkbox') {
      // Checkbox should have array answer
      return {
        ...question,
        answer: Array.isArray(question.answer) ? question.answer : [],
      };
    } else {
      // Text, form_group, fieldset, choice, selection, file_upload should have string answer
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
    // Set default max length for form_group and fieldset
    if (type === 'form_group' || type === 'fieldset') {
      setNewQuestionMaxLength(1000);
    } else {
      setNewQuestionMaxLength(undefined);
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
      ...(newQuestionMaxLength !== undefined && { maxLength: newQuestionMaxLength }),
    };

    onChange([...questions, newQuestion]);
    setNewQuestionText('');
    setNewQuestionType('text');
    setNewQuestionOptions([]);
    setCurrentOptionText('');
    setNewQuestionRequired(false);
    setNewQuestionMaxLength(undefined);
    setIsAdding(false);
  };

  const handleUpdate = (id: string, field: keyof CustomQuestion, value: any) => {
    onChange(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const handleRemove = (id: string) => {
    onChange(questions.filter((q) => q.id !== id));
  };

  const handleFileUpload = (questionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Max file size: 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large. Maximum size is 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl,
      };
      handleUpdate(questionId, 'fileData', fileData);
      handleUpdate(questionId, 'answer', file.name);
    };
    reader.readAsDataURL(file);
  };

  const validateAnswer = (question: CustomQuestion): boolean => {
    if (!question.required) return true;

    if (question.type === 'checkbox') {
      return Array.isArray(question.answer) && question.answer.length > 0;
    } else if (question.type === 'file_upload') {
      return !!question.fileData;
    } else {
      return typeof question.answer === 'string' && question.answer.trim() !== '';
    }
  };

  const getCharacterCount = (text: string, maxLength?: number) => {
    const count = text.length;
    if (!maxLength) return null;

    const remaining = maxLength - count;
    const isOver = remaining < 0;

    return {
      count,
      remaining: Math.abs(remaining),
      isOver,
    };
  };

  const renderAnswerInput = (question: CustomQuestion) => {
    const isInvalid = !validateAnswer(question);

    switch (question.type) {
      case 'text': {
        const textAnswer = Array.isArray(question.answer) ? '' : question.answer || '';
        return (
          <div>
            <textarea
              className={`form-textarea ${isInvalid ? 'input-error' : ''}`}
              value={textAnswer}
              onChange={(e) => handleUpdate(question.id, 'answer', e.target.value)}
              placeholder={t(language, 'questions.answerPlaceholder')}
              rows={3}
            />
            {isInvalid && (
              <div style={{ color: 'var(--danger, #dc3545)', fontSize: '0.85em', marginTop: '4px' }}>
                ⚠️ {t(language, 'questions.validationRequired')}
              </div>
            )}
          </div>
        );
      }

      case 'form_group': {
        const textAnswer = Array.isArray(question.answer) ? '' : question.answer || '';
        const charInfo = getCharacterCount(textAnswer, question.maxLength);

        return (
          <div>
            <RichTextEditor
              value={textAnswer}
              onChange={(value) => handleUpdate(question.id, 'answer', value)}
              placeholder={t(language, 'questions.answerPlaceholder')}
              language={language}
              maxLength={question.maxLength || 2000}
              showWordCount={false}
            />
            {charInfo && (
              <div
                style={{
                  fontSize: '0.85em',
                  marginTop: '4px',
                  color: charInfo.isOver ? 'var(--danger, #dc3545)' : 'var(--text-secondary)',
                }}
              >
                {charInfo.isOver
                  ? t(language, 'questions.charactersOver', { over: charInfo.remaining })
                  : t(language, 'questions.charactersRemaining', { remaining: charInfo.remaining })}
              </div>
            )}
            {isInvalid && (
              <div style={{ color: 'var(--danger, #dc3545)', fontSize: '0.85em', marginTop: '4px' }}>
                ⚠️ {t(language, 'questions.validationRequired')}
              </div>
            )}
          </div>
        );
      }

      case 'fieldset': {
        const textAnswer = Array.isArray(question.answer) ? '' : question.answer || '';
        const charInfo = getCharacterCount(textAnswer, question.maxLength);

        return (
          <div>
            <textarea
              className={`form-textarea ${isInvalid ? 'input-error' : ''}`}
              value={textAnswer}
              onChange={(e) => handleUpdate(question.id, 'answer', e.target.value)}
              placeholder={t(language, 'questions.answerPlaceholder')}
              rows={5}
              maxLength={question.maxLength}
            />
            {charInfo && (
              <div
                style={{
                  fontSize: '0.85em',
                  marginTop: '4px',
                  color: charInfo.isOver ? 'var(--danger, #dc3545)' : 'var(--text-secondary)',
                }}
              >
                {charInfo.isOver
                  ? t(language, 'questions.charactersOver', { over: charInfo.remaining })
                  : t(language, 'questions.charactersRemaining', { remaining: charInfo.remaining })}
              </div>
            )}
            {isInvalid && (
              <div style={{ color: 'var(--danger, #dc3545)', fontSize: '0.85em', marginTop: '4px' }}>
                ⚠️ {t(language, 'questions.validationRequired')}
              </div>
            )}
          </div>
        );
      }

      case 'choice':
      case 'selection': {
        const radioAnswer = Array.isArray(question.answer) ? '' : question.answer || '';
        return (
          <div>
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
            {isInvalid && (
              <div style={{ color: 'var(--danger, #dc3545)', fontSize: '0.85em', marginTop: '4px' }}>
                ⚠️ {t(language, 'questions.validationRequired')}
              </div>
            )}
          </div>
        );
      }

      case 'checkbox': {
        const checkboxAnswers = Array.isArray(question.answer) ? question.answer : [];
        return (
          <div>
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
            {isInvalid && (
              <div style={{ color: 'var(--danger, #dc3545)', fontSize: '0.85em', marginTop: '4px' }}>
                ⚠️ {t(language, 'questions.validationRequired')}
              </div>
            )}
          </div>
        );
      }

      case 'file_upload': {
        return (
          <div>
            {question.fileData ? (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.5em' }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{question.fileData.name}</div>
                    <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>
                      {(question.fileData.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <label
                    htmlFor={`file-change-${question.id}`}
                    className="btn btn-secondary"
                    style={{ cursor: 'pointer', fontSize: '0.9em' }}
                  >
                    {t(language, 'questions.changeFile')}
                  </label>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      handleUpdate(question.id, 'fileData', undefined);
                      handleUpdate(question.id, 'answer', '');
                    }}
                    style={{ fontSize: '0.9em' }}
                  >
                    {t(language, 'questions.removeFile')}
                  </button>
                  <input
                    id={`file-change-${question.id}`}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(question.id, e)}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor={`file-upload-${question.id}`}
                  className={`btn btn-primary ${isInvalid ? 'btn-outline-danger' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  📎 {t(language, 'questions.uploadFile')}
                </label>
                <input
                  id={`file-upload-${question.id}`}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(question.id, e)}
                />
                {isInvalid && (
                  <div style={{ color: 'var(--danger, #dc3545)', fontSize: '0.85em', marginTop: '4px' }}>
                    ⚠️ {t(language, 'questions.validationRequired')}
                  </div>
                )}
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
      <h2 className="section-title">
        ❓ {t(language, 'questions.section')}
        <button className="btn btn-primary btn-icon" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? `✕ ${t(language, 'questions.cancel')}` : `+ ${t(language, 'questions.add')}`}
        </button>
      </h2>

      {autoSaveMessage && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'var(--success-bg, #d4edda)',
            border: '1px solid var(--success-border, #c3e6cb)',
            borderRadius: '6px',
            marginBottom: '12px',
            color: 'var(--success-text, #155724)',
            fontSize: '0.9em',
          }}
        >
          ✓ {autoSaveMessage}
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
              <option value="file_upload">{t(language, 'questions.fileUpload')}</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={newQuestionRequired}
                onChange={(e) => setNewQuestionRequired(e.target.checked)}
              />
              <span>{t(language, 'questions.makeRequired')}</span>
            </label>
          </div>

          {(newQuestionType === 'form_group' || newQuestionType === 'fieldset') && (
            <div className="form-group">
              <label className="form-label">{t(language, 'questions.maxLength')}</label>
              <input
                type="number"
                className="form-input"
                value={newQuestionMaxLength || ''}
                onChange={(e) => setNewQuestionMaxLength(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="e.g., 1000"
                min="1"
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
            <div key={question.id} className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    {question.question}
                    {question.required && (
                      <span
                        style={{
                          marginLeft: '8px',
                          color: 'var(--danger, #dc3545)',
                          fontSize: '0.9em',
                        }}
                      >
                        *
                      </span>
                    )}
                  </div>
                  <div className="card-meta">
                    {t(language, 'questions.type')}: {question.type}
                    {question.options && question.options.length > 0 && (
                      <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>
                        ({question.options.length} {t(language, 'questions.options').toLowerCase()})
                      </span>
                    )}
                    {question.maxLength && (
                      <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>
                        | {t(language, 'questions.maxLength')}: {question.maxLength}
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
                  {question.required && (
                    <span style={{ color: 'var(--danger, #dc3545)', marginLeft: '4px' }}>*</span>
                  )}
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
