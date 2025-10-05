import React, { useState } from 'react';
import { CVData } from '../types';
import {
  generateInterviewQuestions,
  InterviewQuestion,
  filterQuestionsByCategory,
  filterQuestionsByDifficulty,
  sortQuestionsByRelevance,
} from '../utils/interviewQuestionsGenerator';
import { FiHelpCircle, FiFilter, FiDownload, FiCopy } from 'react-icons/fi';

interface InterviewQuestionsGeneratorProps {
  cvData: CVData;
  jobDescription?: string;
}

const InterviewQuestionsGenerator: React.FC<InterviewQuestionsGeneratorProps> = ({
  cvData,
  jobDescription,
}) => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState(15);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']);

  // Validate props
  if (!cvData) {
    return (
      <div className="interview-questions-generator">
        <div className="error-message">
          <p>No CV data available. Please fill in your CV information first.</p>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateInterviewQuestions(
        cvData,
        jobDescription,
        numberOfQuestions
      );
      
      setQuestions(result?.questions || []);
      setCategories(['All', ...(result?.categories || [])]);
    } catch (err) {
      setError('Failed to generate interview questions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredQuestions = () => {
    let filtered = questions || [];
    
    if (selectedCategory !== 'All') {
      filtered = filterQuestionsByCategory(filtered, selectedCategory);
    }
    
    if (selectedDifficulty !== 'All') {
      filtered = filterQuestionsByDifficulty(
        filtered,
        selectedDifficulty as 'Easy' | 'Medium' | 'Hard'
      );
    }
    
    return sortQuestionsByRelevance(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCopyAll = () => {
    const text = getFilteredQuestions()
      .map((q, index) => `${index + 1}. [${q.difficulty}] ${q.question}\n   Category: ${q.category}\n   Based on: ${q.basedOn}\n`)
      .join('\n');
    
    navigator.clipboard.writeText(text);
  };

  const handleExport = () => {
    const filtered = getFilteredQuestions();
    const text = filtered
      .map((q, index) => `${index + 1}. [${q.difficulty}] ${q.question}\n   Category: ${q.category}\n   Based on: ${q.basedOn}\n`)
      .join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interview-questions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredQuestions = getFilteredQuestions();

  return (
    <div className="interview-questions-generator">
      <div className="generator-header">
        <div className="header-content">
          <FiHelpCircle className="header-icon" />
          <div>
            <h2>Interview Questions Generator</h2>
            <p>Generate practical interview questions based on your CV and job requirements</p>
          </div>
        </div>
      </div>

      <div className="generator-controls">
        <div className="control-group">
          <label htmlFor="num-questions">Number of Questions:</label>
          <input
            id="num-questions"
            type="number"
            min="5"
            max="30"
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
            disabled={loading}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || (!cvData.personalInfo?.firstName && !cvData.personalInfo?.lastName)}
          className="generate-btn"
        >
          {loading ? 'Generating...' : 'Generate Questions'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {questions.length > 0 && (
        <>
          <div className="questions-filters">
            <div className="filter-group">
              <FiFilter className="filter-icon" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="action-buttons">
              <button onClick={handleCopyAll} className="icon-btn" title="Copy All">
                <FiCopy /> Copy All
              </button>
              <button onClick={handleExport} className="icon-btn" title="Export">
                <FiDownload /> Export
              </button>
            </div>
          </div>

          <div className="questions-stats">
            <p>
              Showing {filteredQuestions.length} of {questions.length} questions
            </p>
          </div>

          <div className="questions-list">
            {filteredQuestions.map((question, index) => (
              <div key={question.id} className="question-card">
                <div className="question-header">
                  <span className="question-number">Q{index + 1}</span>
                  <div className="question-meta">
                    <span className={`difficulty-badge ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                    <span className="category-badge">{question.category}</span>
                    <span className="relevance-badge">
                      Relevance: {question.relevance}%
                    </span>
                  </div>
                </div>

                <div className="question-content">
                  <p className="question-text">{question.question}</p>
                  <p className="question-source">
                    <strong>Based on:</strong> {question.basedOn}
                  </p>
                </div>

                <button
                  onClick={() => navigator.clipboard.writeText(question.question)}
                  className="copy-question-btn"
                  title="Copy question"
                >
                  <FiCopy />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {questions.length === 0 && !loading && !error && (
        <div className="empty-state">
          <FiHelpCircle className="empty-icon" />
          <p>Generate interview questions to prepare for your job interview</p>
          <p className="empty-hint">
            Questions will be tailored to your experience and the job requirements
          </p>
        </div>
      )}

      <style>{`
        .interview-questions-generator {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .generator-header {
          margin-bottom: 24px;
        }

        .header-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .header-icon {
          width: 32px;
          height: 32px;
          color: #3b82f6;
          flex-shrink: 0;
        }

        .generator-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
        }

        .generator-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .generator-controls {
          display: flex;
          gap: 16px;
          align-items: flex-end;
          margin-bottom: 24px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .control-group label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .control-group input {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          width: 120px;
        }

        .generate-btn {
          padding: 10px 24px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .generate-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .generate-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .error-message {
          padding: 12px 16px;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .error-message p {
          margin: 0;
          color: #dc2626;
          font-size: 14px;
        }

        .questions-filters {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 16px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-icon {
          color: #6b7280;
        }

        .filter-group select {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: white;
        }

        .action-buttons {
          margin-left: auto;
          display: flex;
          gap: 8px;
        }

        .icon-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .questions-stats {
          margin-bottom: 16px;
          font-size: 14px;
          color: #6b7280;
        }

        .questions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .question-card {
          position: relative;
          padding: 20px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          transition: box-shadow 0.2s;
        }

        .question-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .question-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .question-number {
          font-weight: 600;
          font-size: 18px;
          color: #3b82f6;
        }

        .question-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .difficulty-badge,
        .category-badge,
        .relevance-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .category-badge {
          background: #dbeafe;
          color: #1e40af;
        }

        .relevance-badge {
          background: #f3f4f6;
          color: #374151;
        }

        .question-content {
          margin-bottom: 8px;
        }

        .question-text {
          font-size: 16px;
          line-height: 1.6;
          color: #1f2937;
          margin: 0 0 12px 0;
        }

        .question-source {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
        }

        .copy-question-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 6px;
          background: transparent;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s;
        }

        .copy-question-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          color: #d1d5db;
        }

        .empty-state p {
          margin: 8px 0;
          font-size: 16px;
        }

        .empty-hint {
          font-size: 14px;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default InterviewQuestionsGenerator;
