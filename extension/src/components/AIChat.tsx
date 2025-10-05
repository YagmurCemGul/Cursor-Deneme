/**
 * AI Chat Component
 * Conversational interface for iterative resume improvement
 */

import { useState, useEffect, useRef } from 'react';
import type { ResumeProfile, JobPost } from '../lib/types';
import { ConversationManager, ConversationTurn, ProfileChange, saveConversation } from '../lib/conversationManager';
import { Button } from './ui';

interface AIChatProps {
  profile: ResumeProfile;
  job: JobPost;
  onProfileUpdate?: (profile: ResumeProfile) => void;
  onClose?: () => void;
}

export function AIChat({ profile, job, onProfileUpdate, onClose }: AIChatProps) {
  const [manager, setManager] = useState<ConversationManager | null>(null);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<ProfileChange[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize conversation
  useEffect(() => {
    const conversationManager = new ConversationManager(profile, job);
    setManager(conversationManager);
    setTurns(conversationManager.getHistory());
  }, [profile.id, job.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  // Send message
  const handleSendMessage = async () => {
    if (!manager || !inputMessage.trim() || isSending) return;

    const message = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);
    setShowQuickActions(false);

    try {
      const aiTurn = await manager.sendMessage(message);
      setTurns([...manager.getHistory()]);
      
      // Save conversation
      await saveConversation(manager.export());

      // Check if AI provided changes
      if (aiTurn.context?.changes && aiTurn.context.changes.length > 0) {
        setPendingChanges(aiTurn.context.changes);
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Add error message
      const errorTurn: ConversationTurn = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please check your API settings and try again.',
        timestamp: new Date()
      };
      setTurns([...turns, errorTurn]);
    } finally {
      setIsSending(false);
    }
  };

  // Quick action buttons
  const handleQuickAction = async (action: string) => {
    setInputMessage(action);
    // Auto-send after a brief delay
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // Apply pending changes
  const handleApplyChanges = () => {
    if (!manager || pendingChanges.length === 0) return;

    const updatedProfile = manager.applyChanges(pendingChanges);
    setPendingChanges([]);
    
    // Notify parent
    if (onProfileUpdate) {
      onProfileUpdate(updatedProfile);
    }

    // Add confirmation message
    const confirmTurn: ConversationTurn = {
      id: crypto.randomUUID(),
      role: 'system',
      content: `✅ Applied ${pendingChanges.length} changes to your profile!`,
      timestamp: new Date()
    };
    setTurns([...manager.getHistory(), confirmTurn]);
    
    // Save conversation
    saveConversation(manager.export());
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '600px',
      background: 'white',
      borderRadius: 16,
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>💬</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>AI Resume Coach</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              {manager ? manager.getSummary().split('.')[0] : 'Initializing...'}
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 8,
              padding: '6px 12px',
              color: 'white',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            ✕ Close
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        {turns.map((turn) => (
          <MessageBubble key={turn.id} turn={turn} />
        ))}
        
        {isSending && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#64748b' }}>
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span style={{ fontSize: 13 }}>AI is thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {showQuickActions && turns.length > 0 && (
        <div style={{
          padding: '12px 20px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap'
        }}>
          <QuickActionButton onClick={() => handleQuickAction('Improve my summary')}>
            📝 Improve Summary
          </QuickActionButton>
          <QuickActionButton onClick={() => handleQuickAction('What skills should I add?')}>
            🎯 Add Skills
          </QuickActionButton>
          <QuickActionButton onClick={() => handleQuickAction('Optimize my experience descriptions')}>
            ⚡ Optimize Experience
          </QuickActionButton>
          <QuickActionButton onClick={() => handleQuickAction('How can I improve my match score?')}>
            📊 Improve Score
          </QuickActionButton>
        </div>
      )}

      {/* Pending Changes */}
      {pendingChanges.length > 0 && (
        <div style={{
          padding: '12px 20px',
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>💡</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>
                {pendingChanges.length} suggested changes
              </div>
              <div style={{ fontSize: 11, color: '#92400e', opacity: 0.8 }}>
                {pendingChanges.map(c => c.description).join(', ')}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setPendingChanges([])}
              style={{
                padding: '6px 12px',
                background: 'white',
                border: '1px solid #fbbf24',
                borderRadius: 8,
                fontSize: 12,
                cursor: 'pointer',
                color: '#92400e'
              }}
            >
              Dismiss
            </button>
            <button
              onClick={handleApplyChanges}
              style={{
                padding: '6px 12px',
                background: '#f59e0b',
                border: 'none',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                color: 'white'
              }}
            >
              ✓ Apply Changes
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: 20,
        background: 'white',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        gap: 12
      }}>
        <textarea
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about your resume... (Press Enter to send)"
          disabled={isSending}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '2px solid #e2e8f0',
            borderRadius: 12,
            fontSize: 14,
            resize: 'none',
            minHeight: 60,
            maxHeight: 120,
            fontFamily: 'inherit',
            outline: 'none'
          }}
        />
        <Button
          variant="primary"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isSending}
          style={{
            padding: '12px 24px',
            alignSelf: 'flex-end',
            minWidth: 100
          }}
        >
          {isSending ? '⏳' : '📤'} Send
        </Button>
      </div>

      {/* Typing indicator styles */}
      <style>{`
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 12px;
        }
        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #94a3b8;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ turn }: { turn: ConversationTurn }) {
  const isUser = turn.role === 'user';
  const isSystem = turn.role === 'system';

  if (isSystem) {
    return (
      <div style={{
        padding: '12px 16px',
        background: '#f1f5f9',
        borderRadius: 10,
        border: '1px solid #cbd5e1',
        fontSize: 13,
        color: '#475569',
        textAlign: 'center'
      }}>
        {turn.content}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      alignItems: 'flex-start',
      gap: 10
    }}>
      {!isUser && (
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          flexShrink: 0
        }}>
          🤖
        </div>
      )}
      
      <div style={{
        maxWidth: '70%',
        padding: '12px 16px',
        background: isUser 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
          : '#f8fafc',
        color: isUser ? 'white' : '#1e293b',
        borderRadius: 12,
        fontSize: 14,
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word'
      }}>
        {turn.content}
        
        <div style={{
          marginTop: 8,
          fontSize: 11,
          opacity: 0.7,
          textAlign: 'right'
        }}>
          {new Date(turn.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>

      {isUser && (
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#e0e7ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          flexShrink: 0
        }}>
          👤
        </div>
      )}
    </div>
  );
}

// Quick Action Button
function QuickActionButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        background: 'white',
        border: '1px solid #cbd5e1',
        borderRadius: 8,
        fontSize: 12,
        cursor: 'pointer',
        color: '#475569',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#e0e7ff';
        e.currentTarget.style.borderColor = '#667eea';
        e.currentTarget.style.color = '#4338ca';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'white';
        e.currentTarget.style.borderColor = '#cbd5e1';
        e.currentTarget.style.color = '#475569';
      }}
    >
      {children}
    </button>
  );
}
