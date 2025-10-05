/**
 * Tips Banner
 * Display contextual tips and suggestions
 */

import React, { useState, useEffect } from 'react';
import type { ResumeProfile, JobPost } from '../lib/types';
import { generateContextualTips, getProgressTips, type ContextualTip } from '../lib/contextualTips';

interface TipsBannerProps {
  profile: ResumeProfile | null;
  job?: JobPost;
  context?: string;
}

export function TipsBanner({ profile, job, context }: TipsBannerProps) {
  const [tips, setTips] = useState<ContextualTip[]>([]);
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!profile) return;

    const allTips: ContextualTip[] = [];

    // Get contextual tips
    const contextualTips = generateContextualTips(profile, job, context);
    allTips.push(...contextualTips);

    // Get progress tips
    const completionPercentage = calculateCompletionPercentage(profile);
    const progressTip = getProgressTips(completionPercentage);
    if (progressTip) {
      allTips.push(progressTip);
    }

    // Filter dismissed tips
    const visibleTips = allTips.filter(tip => !dismissedTips.has(tip.id));
    setTips(visibleTips.slice(0, 3)); // Show max 3 tips
  }, [profile, job, context, dismissedTips]);

  const handleDismiss = (tipId: string) => {
    setDismissedTips(prev => new Set([...prev, tipId]));
  };

  if (tips.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {tips.map((tip) => (
        <TipCard
          key={tip.id}
          tip={tip}
          onDismiss={() => handleDismiss(tip.id)}
        />
      ))}
    </div>
  );
}

function TipCard({ tip, onDismiss }: { tip: ContextualTip; onDismiss: () => void }) {
  const getColors = (type: string) => {
    switch (type) {
      case 'success':
        return { bg: '#dcfce7', border: '#10b981', text: '#166534', icon: '✅' };
      case 'warning':
        return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: '⚠️' };
      case 'info':
        return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: 'ℹ️' };
      case 'tip':
        return { bg: '#f3e8ff', border: '#8b5cf6', text: '#5b21b6', icon: '💡' };
      default:
        return { bg: '#f1f5f9', border: '#64748b', text: '#475569', icon: '💬' };
    }
  };

  const colors = getColors(tip.type);

  return (
    <div style={{
      background: colors.bg,
      border: `2px solid ${colors.border}`,
      borderRadius: 10,
      padding: 16,
      display: 'flex',
      gap: 12,
      alignItems: 'start'
    }}>
      <div style={{ fontSize: 24, lineHeight: 1 }}>{colors.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: 600,
          fontSize: 14,
          color: colors.text,
          marginBottom: 4
        }}>
          {tip.title}
        </div>
        <div style={{
          fontSize: 13,
          color: colors.text,
          opacity: 0.9,
          marginBottom: tip.action ? 12 : 0
        }}>
          {tip.message}
        </div>
        {tip.action && (
          <button
            onClick={() => {
              // Handle action based on handler
              console.log('Action:', tip.action.handler);
            }}
            style={{
              padding: '6px 12px',
              background: colors.border,
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {tip.action.label}
          </button>
        )}
      </div>
      {tip.dismissible && (
        <button
          onClick={onDismiss}
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.1)',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            color: colors.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

function calculateCompletionPercentage(profile: ResumeProfile): number {
  let score = 0;
  let total = 8;

  if (profile.name) score++;
  if (profile.email) score++;
  if (profile.phone) score++;
  if (profile.summary && profile.summary.length >= 50) score++;
  if (profile.skills.length >= 8) score++;
  if (profile.experience.length >= 1) score++;
  if (profile.education.length >= 1) score++;
  if (profile.projects && profile.projects.length >= 1) score++;

  return Math.round((score / total) * 100);
}
