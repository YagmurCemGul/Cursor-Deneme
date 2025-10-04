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

  const handleAdd = () => {
    if (!newQuestionText.trim()) return;
    
    const newQuestion: CustomQuestion = {
      id: Date.now().toString(),
      question: newQuestionText,
      type: newQuestionType,
      options: (newQuestionType === 'choice' || newQuestionType === 'selection' || newQuestionType === 'checkbox') ? [] : undefined,
      answer: newQuestionType === 'checkbox' ? [] : ''
    };
    
    onChange([...questions, newQuestion]);
    setNewQuestionText('');
    setNewQuestionType('text');
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
        return (
          <textarea
            className="form-textarea"
            value={question.answer as string}
            onChange={(e) => handleUpdate(question.id, 'answer', e.target.value)}
            placeholder={t(language, 'questions.answerPlaceholder')}
          />
        );
      
      case 'choice':
      case 'selection':
        return (
          <div className="radio-group">
            {question.options?.map((option, idx) => (
              <div key={idx} className="radio-item">
                <input
                  type="radio"
                  id={`${question.id}-${idx}`}
                  name={question.id}
                  checked={question.answer === option}
                  onChange={() => handleUpdate(question.id, 'answer', option)}
                />
                <label htmlFor={`${question.id}-${idx}`}>{option}</label>
              </div>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="checkbox-group">
            {question.options?.map((option, idx) => (
              <div key={idx} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`${question.id}-${idx}`}
                  checked={(question.answer as string[]).includes(option)}
                  onChange={(e) => {
                    const currentAnswers = question.answer as string[];
                    const newAnswers = e.target.checked
                      ? [...currentAnswers, option]
                      : currentAnswers.filter(a => a !== option);
                    handleUpdate(question.id, 'answer', newAnswers);
                  }}
                />
                <label htmlFor={`${question.id}-${idx}`}>{option}</label>
              </div>
            ))}
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
              onChange={(e) => setNewQuestionType(e.target.value as CustomQuestion['type'])}
            >
              <option value="text">{t(language, 'questions.textInput')}</option>
              <option value="form_group">{t(language, 'questions.formGroup')}</option>
              <option value="choice">{t(language, 'questions.choice')}</option>
              <option value="fieldset">{t(language, 'questions.fieldset')}</option>
              <option value="selection">{t(language, 'questions.selection')}</option>
              <option value="checkbox">{t(language, 'questions.checkbox')}</option>
            </select>
          </div>
          
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
                  <div className="card-meta">{t(language, 'questions.type')}: {question.type}</div>
                </div>
                <button
                  className="btn btn-danger btn-icon"
                  onClick={() => handleRemove(question.id)}
                >
                  🗑️
                </button>
              </div>
              
              <div className="form-group">
                <label className="form-label">{t(language, 'questions.answer')}</label>
                {renderAnswerInput(question)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
