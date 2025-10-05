import React, { useState } from 'react';
import { CustomQuestion } from '../types';
import { t, Lang } from '../i18n';

interface CustomQuestionsFormProps {
  questions: CustomQuestion[];
  onChange: (questions: CustomQuestion[]) => void;
  language: Lang;
}

export const CustomQuestionsForm: React.FC<CustomQuestionsFormProps> = ({ questions, onChange, language }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<CustomQuestion['type']>('text');
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>([]);
  const [currentOptionText, setCurrentOptionText] = useState('');

  // Normalize questions on mount to ensure proper answer initialization
  React.useEffect(() => {
    const normalizedQuestions = questions.map(q => normalizeQuestion(q));
    const needsUpdate = normalizedQuestions.some((nq, idx) => {
      const originalQuestion = questions[idx];
      return originalQuestion && JSON.stringify(nq.answer) !== JSON.stringify(originalQuestion.answer);
    });
    if (needsUpdate) {
      onChange(normalizedQuestions);
    }
  }, []);

  const requiresOptions = (type: CustomQuestion['type']) => {
    return type === 'choice' || type === 'selection' || type === 'checkbox';
  };

  // Normalize question to ensure answer field is properly initialized
  const normalizeQuestion = (question: CustomQuestion): CustomQuestion => {
    if (question.type === 'checkbox') {
      // Checkbox should have array answer
      return {
        ...question,
        answer: Array.isArray(question.answer) ? question.answer : []
      };
    } else {
      // Text, form_group, fieldset, choice, selection should have string answer
      return {
        ...question,
        answer: typeof question.answer === 'string' ? question.answer : ''
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
      answer: newQuestionType === 'checkbox' ? [] : ''
    };
    
    onChange([...questions, newQuestion]);
    setNewQuestionText('');
    setNewQuestionType('text');
    setNewQuestionOptions([]);
    setCurrentOptionText('');
    setIsAdding(false);
  };

  const handleUpdate = (id: string, field: keyof CustomQuestion, value: string | string[]) => {
    onChange(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleRemove = (id: string) => {
    onChange(questions.filter(q => q.id !== id));
  };

  const renderAnswerInput = (question: CustomQuestion) => {
    switch (question.type) {
      case 'text':
      case 'form_group':
      case 'fieldset':
        // Ensure answer is always a string for text-based inputs
        const textAnswer = Array.isArray(question.answer) ? '' : (question.answer || '');
        return (
          <textarea
            className="form-textarea"
            value={textAnswer}
            onChange={(e) => handleUpdate(question.id, 'answer', e.target.value)}
            placeholder={t(language, 'questions.answerPlaceholder')}
            rows={question.type === 'text' ? 3 : 5}
          />
        );
      
      case 'choice':
      case 'selection':
        // Ensure answer is a string for radio inputs
        const radioAnswer = Array.isArray(question.answer) ? '' : (question.answer || '');
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
      
      case 'checkbox':
        // Ensure answer is an array for checkbox inputs
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
                        : checkboxAnswers.filter(a => a !== option);
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
            </select>
          </div>
          
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
                        border: '1px solid var(--border-color)'
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
                  <div className="card-title">{question.question}</div>
                  <div className="card-meta">
                    {t(language, 'questions.type')}: {question.type}
                    {question.options && question.options.length > 0 && (
                      <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>
                        ({question.options.length} {t(language, 'questions.options').toLowerCase()})
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
              
              {question.options && question.options.length === 0 && requiresOptions(question.type) && (
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: 'var(--warning-bg, #fff3cd)', 
                  border: '1px solid var(--warning-border, #ffc107)',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  color: 'var(--warning-text, #856404)'
                }}>
                  ⚠️ {t(language, 'questions.optionsRequired')}
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">
                  {t(language, 'questions.answer')}
                  {(question.type === 'form_group' || question.type === 'fieldset') && (
                    <span style={{ marginLeft: '8px', fontSize: '0.85em', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
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
