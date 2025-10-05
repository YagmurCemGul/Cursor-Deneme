/**
 * Streaming Optimization Component
 * Real-time streaming UI for CV optimization
 */

import React, { useState, useCallback } from 'react';
import { CVData } from '../types';
import { createStreamingProvider, StreamChunk } from '../utils/streamingAI';
import { AIProvider } from '../utils/aiProviders';

interface StreamingOptimizationProps {
  cvData: CVData;
  jobDescription: string;
  provider?: AIProvider;
  apiKey: string;
  onComplete?: (result: string) => void;
}

export function StreamingOptimization({
  cvData,
  jobDescription,
  provider = 'openai',
  apiKey,
  onComplete
}: StreamingOptimizationProps) {
  const [streaming, setStreaming] = useState(false);
  const [content, setContent] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startStreaming = useCallback(async () => {
    setStreaming(true);
    setContent('');
    setProgress(0);
    setError(null);

    try {
      const streamingProvider = createStreamingProvider(provider, apiKey);
      const stream = streamingProvider.streamOptimizeCV(cvData, jobDescription, {
        onChunk: (chunk: StreamChunk) => {
          if (chunk.content) {
            setContent(prev => prev + chunk.content);
            setProgress(chunk.progress || 0);
          }
        },
        onError: (err) => {
          setError(err.message);
          setStreaming(false);
        }
      });

      // Consume stream
      for await (const chunk of stream) {
        if (chunk.type === 'complete') {
          setProgress(100);
          setStreaming(false);
          
          if (onComplete) {
            onComplete(content);
          }
        } else if (chunk.type === 'error') {
          setError(chunk.error || 'Unknown error');
          setStreaming(false);
        }
      }
    } catch (err: any) {
      setError(err.message);
      setStreaming(false);
    }
  }, [cvData, jobDescription, provider, apiKey, onComplete]);

  const cancelStreaming = () => {
    setStreaming(false);
    setProgress(0);
  };

  return (
    <div className="streaming-optimization">
      <style>{`
        .streaming-optimization {
          padding: 20px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .stream-controls {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }
        .stream-button {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .stream-button.primary {
          background: #3b82f6;
          color: white;
        }
        .stream-button.primary:hover {
          background: #2563eb;
        }
        .stream-button.secondary {
          background: #ef4444;
          color: white;
        }
        .stream-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .progress-bar {
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          transition: width 0.3s ease;
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        .stream-content {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          min-height: 200px;
          max-height: 500px;
          overflow-y: auto;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #374151;
          white-space: pre-wrap;
        }
        .stream-content.streaming {
          position: relative;
        }
        .stream-content.streaming::after {
          content: '▊';
          animation: blink 1s infinite;
          margin-left: 2px;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .stream-placeholder {
          color: #9ca3af;
          font-style: italic;
        }
        .stream-error {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 12px;
        }
        .stream-stats {
          display: flex;
          gap: 16px;
          margin-top: 12px;
          font-size: 12px;
          color: #6b7280;
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>

      <div className="stream-controls">
        <button
          className="stream-button primary"
          onClick={startStreaming}
          disabled={streaming}
        >
          {streaming ? '⏳ Streaming...' : '▶️ Start Streaming'}
        </button>
        
        {streaming && (
          <button
            className="stream-button secondary"
            onClick={cancelStreaming}
          >
            ⏹️ Cancel
          </button>
        )}
      </div>

      {streaming && (
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <div className="stream-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className={`stream-content ${streaming ? 'streaming' : ''}`}>
        {content || (
          <div className="stream-placeholder">
            Click "Start Streaming" to begin real-time optimization...
          </div>
        )}
      </div>

      {content && (
        <div className="stream-stats">
          <div className="stat-item">
            📝 {content.length} characters
          </div>
          <div className="stat-item">
            🎯 {Math.round(progress)}% complete
          </div>
          <div className="stat-item">
            {streaming ? '⚡ Streaming...' : '✅ Complete'}
          </div>
        </div>
      )}
    </div>
  );
}
