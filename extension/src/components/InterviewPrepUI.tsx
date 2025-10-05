/**
 * Interview Preparation UI
 * Practice interviews with AI feedback
 */

import React, { useState, useEffect } from 'react';
import type { ResumeProfile, JobPost } from '../lib/types';
import { generateInterviewPrepPlan, practiceQuestion, type InterviewPrepPlan, type InterviewQuestion } from '../lib/interviewPrep';

interface InterviewPrepUIProps {
  profile: ResumeProfile;
  job: JobPost;
}

export function InterviewPrepUI({ profile, job }: InterviewPrepUIProps) {
  const [plan, setPlan] = useState<InterviewPrepPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('behavioral');
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateInterviewPrepPlan(profile, job);
      setPlan(result);
    } catch (error: any) {
      console.error('Failed to generate prep plan:', error);
      
      // Show helpful error message
      let errorMessage = 'Failed to generate interview prep plan.';
      
      if (error.message) {
        if (error.message.includes('No API key found')) {
          errorMessage = '❌ No API key found.\n\nPlease configure your OpenAI API key:\n1. Click the ⚙️ Settings button in the top navigation\n2. Enter your OpenAI API key\n3. Click Save\n\nGet your API key at: https://platform.openai.com/api-keys';
        } else if (error.message.includes('rate limit')) {
          errorMessage = '⏱️ Rate limit exceeded.\n\n' + error.message;
        } else if (error.message.includes('quota')) {
          errorMessage = '💳 API quota exceeded.\n\n' + error.message;
        } else {
          errorMessage = '❌ Error: ' + error.message;
        }
      }
      
      alert(errorMessage);
    }
    setLoading(false);
  };

  const handlePractice = async () => {
    if (!currentQuestion || !userAnswer.trim()) return;
    
    setSubmitting(true);
    try {
      const result = await practiceQuestion(currentQuestion, userAnswer, profile);
      setFeedback(result);
    } catch (error: any) {
      console.error('Practice error:', error);
      
      let errorMessage = 'Failed to get feedback. ';
      if (error.message && error.message.includes('No API key')) {
        errorMessage += 'Please configure your API key in Settings.';
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    }
    setSubmitting(false);
  };

  const startPractice = (question: InterviewQuestion) => {
    setCurrentQuestion(question);
    setUserAnswer('');
    setFeedback(null);
    setPracticeMode(true);
  };

  const getCategoryQuestions = (category: string) => {
    if (!plan) return [];
    switch (category) {
      case 'behavioral': return plan.behavioralQuestions;
      case 'technical': return plan.technicalQuestions;
      case 'situational': return plan.situationalQuestions;
      case 'company': return plan.companySpecificQuestions;
      default: return [];
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
        <div style={{ fontSize: 18, color: '#64748b' }}>Generating interview prep plan...</div>
        <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 8 }}>
          Creating 20+ personalized questions
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{
        padding: 40,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 16,
        color: 'white'
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎤</div>
        <h2 style={{ margin: '0 0 16px', fontSize: 28 }}>Interview Preparation</h2>
        <p style={{ margin: '0 0 24px', fontSize: 16, opacity: 0.9, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          Get AI-generated interview questions tailored to your profile and the job. Practice your answers and receive instant feedback.
        </p>
        <button
          onClick={handleGenerate}
          style={{
            padding: '14px 32px',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          🚀 Generate Prep Plan
        </button>
      </div>
    );
  }

  if (practiceMode && currentQuestion) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setPracticeMode(false)}
            style={{
              padding: '8px 16px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            ← Back to Questions
          </button>
          <div style={{ flex: 1, fontSize: 14, color: '#64748b' }}>
            Practice Mode • {currentQuestion.difficulty.toUpperCase()}
          </div>
        </div>

        {/* Question Card */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#667eea',
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {currentQuestion.category}
          </div>
          <h3 style={{ margin: '0 0 16px', fontSize: 20, color: '#1e293b' }}>
            {currentQuestion.question}
          </h3>
          {currentQuestion.context && (
            <div style={{
              padding: 12,
              background: '#f8fafc',
              borderRadius: 8,
              fontSize: 14,
              color: '#64748b',
              marginBottom: 16
            }}>
              💡 Context: {currentQuestion.context}
            </div>
          )}
          {currentQuestion.tip && (
            <div style={{
              padding: 12,
              background: '#fef3c7',
              borderRadius: 8,
              fontSize: 14,
              color: '#92400e',
              marginBottom: 16
            }}>
              💭 Tip: {currentQuestion.tip}
            </div>
          )}
        </div>

        {/* Answer Input */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #e5e7eb'
        }}>
          <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
            Your Answer:
          </div>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here... (Use the STAR method: Situation, Task, Action, Result)"
            style={{
              width: '100%',
              minHeight: 150,
              padding: 12,
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
            disabled={submitting}
          />
          <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
            <button
              onClick={handlePractice}
              disabled={!userAnswer.trim() || submitting}
              style={{
                padding: '10px 24px',
                background: submitting ? '#94a3b8' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? '⏳ Analyzing...' : '✓ Get AI Feedback'}
            </button>
            <div style={{ fontSize: 12, color: '#64748b', alignSelf: 'center' }}>
              {userAnswer.split(' ').filter(w => w).length} words
            </div>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            borderRadius: 12,
            padding: 24,
            border: '2px solid #3b82f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 700,
                color: feedback.score >= 75 ? '#10b981' : feedback.score >= 50 ? '#3b82f6' : '#f59e0b'
              }}>
                {feedback.score}
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: 18, color: '#1e293b' }}>AI Feedback</h4>
                <div style={{ fontSize: 14, color: '#64748b' }}>
                  {feedback.score >= 75 && '🌟 Excellent answer!'}
                  {feedback.score >= 50 && feedback.score < 75 && '✅ Good, with room for improvement'}
                  {feedback.score < 50 && '⚠️ Needs improvement'}
                </div>
              </div>
            </div>

            {feedback.strengths.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                  💪 Strengths:
                </div>
                {feedback.strengths.map((s: string, i: number) => (
                  <div key={i} style={{
                    padding: '8px 12px',
                    background: 'white',
                    borderRadius: 6,
                    fontSize: 13,
                    color: '#166534',
                    marginBottom: 4
                  }}>
                    ✓ {s}
                  </div>
                ))}
              </div>
            )}

            {feedback.improvements.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                  📈 Areas to Improve:
                </div>
                {feedback.improvements.map((imp: string, i: number) => (
                  <div key={i} style={{
                    padding: '8px 12px',
                    background: 'white',
                    borderRadius: 6,
                    fontSize: 13,
                    color: '#92400e',
                    marginBottom: 4
                  }}>
                    → {imp}
                  </div>
                ))}
              </div>
            )}

            {feedback.enhancedAnswer && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                  ✨ Enhanced Version:
                </div>
                <div style={{
                  padding: 16,
                  background: 'white',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#1e293b',
                  lineHeight: 1.6,
                  fontStyle: 'italic'
                }}>
                  "{feedback.enhancedAnswer}"
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 12,
        padding: 24,
        color: 'white'
      }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 24 }}>🎤 Interview Prep Plan</h2>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
          For: <strong>{job.title}</strong> at <strong>{job.company}</strong>
        </p>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid #e5e7eb' }}>
        <CategoryTab
          label="Behavioral"
          count={plan.behavioralQuestions.length}
          active={selectedCategory === 'behavioral'}
          onClick={() => setSelectedCategory('behavioral')}
        />
        <CategoryTab
          label="Technical"
          count={plan.technicalQuestions.length}
          active={selectedCategory === 'technical'}
          onClick={() => setSelectedCategory('technical')}
        />
        <CategoryTab
          label="Situational"
          count={plan.situationalQuestions.length}
          active={selectedCategory === 'situational'}
          onClick={() => setSelectedCategory('situational')}
        />
        <CategoryTab
          label="Company"
          count={plan.companySpecificQuestions.length}
          active={selectedCategory === 'company'}
          onClick={() => setSelectedCategory('company')}
        />
      </div>

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {getCategoryQuestions(selectedCategory).map((q, index) => (
          <QuestionCard
            key={index}
            question={q}
            index={index + 1}
            onPractice={() => startPractice(q)}
          />
        ))}
      </div>

      {/* Company Research */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 24,
        border: '2px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#1e293b' }}>
          🏢 Company Research
        </h3>
        <p style={{ margin: '0 0 16px', fontSize: 14, color: '#64748b' }}>
          {plan.companyResearch}
        </p>
      </div>

      {/* STAR Stories */}
      {plan.starStoryBank.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#1e293b' }}>
            ⭐ STAR Story Bank
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
            {plan.starStoryBank.map((story, i) => (
              <div key={i} style={{
                padding: 16,
                background: '#f8fafc',
                borderRadius: 8
              }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', marginBottom: 8 }}>
                  {story.title}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  <strong>S:</strong> {story.situation}<br />
                  <strong>T:</strong> {story.task}<br />
                  <strong>A:</strong> {story.action}<br />
                  <strong>R:</strong> {story.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryTab({ label, count, active, onClick }: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 20px',
        background: active ? '#667eea' : 'transparent',
        color: active ? 'white' : '#64748b',
        border: 'none',
        borderBottom: active ? '2px solid #667eea' : '2px solid transparent',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 600,
        transition: 'all 0.2s'
      }}
    >
      {label} ({count})
    </button>
  );
}

function QuestionCard({ question, index, onPractice }: {
  question: InterviewQuestion;
  index: number;
  onPractice: () => void;
}) {
  const getDifficultyColor = (diff: string) => {
    if (diff === 'easy') return '#10b981';
    if (diff === 'medium') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      padding: 20,
      border: '2px solid #e5e7eb',
      display: 'flex',
      alignItems: 'start',
      gap: 16
    }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: '#667eea',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 700,
        flexShrink: 0
      }}>
        {index}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          {question.question}
        </div>
        {question.tip && (
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
            💡 {question.tip}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            padding: '4px 8px',
            background: `${getDifficultyColor(question.difficulty)}20`,
            color: getDifficultyColor(question.difficulty),
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase'
          }}>
            {question.difficulty}
          </span>
        </div>
      </div>
      <button
        onClick={onPractice}
        style={{
          padding: '8px 16px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          flexShrink: 0
        }}
      >
        🎯 Practice
      </button>
    </div>
  );
}
