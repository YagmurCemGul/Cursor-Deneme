/**
 * Contextual Tips System
 * Smart tips and suggestions based on user context
 */

import type { ResumeProfile, JobPost } from './types';

export interface ContextualTip {
  id: string;
  type: 'info' | 'warning' | 'success' | 'tip';
  title: string;
  message: string;
  action?: {
    label: string;
    handler: string;
  };
  dismissible: boolean;
  priority: number;
}

/**
 * Generate contextual tips based on profile and context
 */
export function generateContextualTips(
  profile: ResumeProfile,
  job?: JobPost,
  context?: string
): ContextualTip[] {
  const tips: ContextualTip[] = [];

  // Profile completeness tips
  if (!profile.summary || profile.summary.length < 50) {
    tips.push({
      id: 'add-summary',
      type: 'warning',
      title: 'Add Professional Summary',
      message: 'A strong summary increases your chances by 40%. It should be 2-3 sentences highlighting your key achievements.',
      action: { label: 'Add Summary', handler: 'focus-summary' },
      dismissible: true,
      priority: 10
    });
  }

  if (profile.skills.length < 8) {
    tips.push({
      id: 'add-skills',
      type: 'warning',
      title: 'Add More Skills',
      message: `You have ${profile.skills.length} skills. Add at least ${8 - profile.skills.length} more for better ATS matching.`,
      action: { label: 'Add Skills', handler: 'focus-skills' },
      dismissible: true,
      priority: 9
    });
  }

  // Experience tips
  if (profile.experience.length > 0) {
    const experienceWithoutMetrics = profile.experience.filter(exp => {
      const desc = exp.description || '';
      return !/\d+%|\$\d+|increased|reduced|improved/i.test(desc);
    });

    if (experienceWithoutMetrics.length > 0) {
      tips.push({
        id: 'add-metrics',
        type: 'tip',
        title: 'Quantify Your Achievements',
        message: `${experienceWithoutMetrics.length} experience(s) lack quantifiable metrics. Add numbers like "increased sales by 40%" or "managed team of 5".`,
        dismissible: true,
        priority: 8
      });
    }
  }

  // Job-specific tips
  if (job && job.pastedText) {
    tips.push({
      id: 'use-ai-tailoring',
      type: 'success',
      title: '✨ AI Resume Tailoring Available',
      message: 'Let AI automatically optimize your resume for this specific job. Increase your match score by 15-20%!',
      action: { label: 'Auto-Tailor', handler: 'ai-tailor' },
      dismissible: true,
      priority: 11
    });
  }

  // Feature discovery tips
  if (context === 'settings') {
    tips.push({
      id: 'configure-ai-models',
      type: 'info',
      title: 'Choose Your AI Model',
      message: 'Select from GPT-4, Claude 3, or Gemini. Each has different strengths and costs.',
      action: { label: 'Configure', handler: 'open-model-selector' },
      dismissible: true,
      priority: 5
    });
  }

  if (context === 'job-tracker' && profile.experience.length > 0) {
    tips.push({
      id: 'interview-prep',
      type: 'tip',
      title: 'Prepare for Interviews',
      message: 'Get AI-generated interview questions and practice your answers with feedback.',
      action: { label: 'Start Prep', handler: 'open-interview-prep' },
      dismissible: true,
      priority: 6
    });
  }

  // Sort by priority
  return tips.sort((a, b) => b.priority - a.priority);
}

/**
 * Smart feature suggestions
 */
export function getSmartSuggestions(
  profile: ResumeProfile,
  userActions: string[]
): ContextualTip[] {
  const suggestions: ContextualTip[] = [];

  // If user generated resume but didn't generate cover letter
  if (userActions.includes('generated-resume') && !userActions.includes('generated-cover-letter')) {
    suggestions.push({
      id: 'suggest-cover-letter',
      type: 'tip',
      title: 'Complete Your Application',
      message: 'You generated a resume! Now create a matching cover letter to stand out.',
      action: { label: 'Generate Cover Letter', handler: 'goto-cover-letter' },
      dismissible: true,
      priority: 12
    });
  }

  // If user has multiple applications but no interview prep
  if (userActions.includes('tracked-applications') && !userActions.includes('used-interview-prep')) {
    suggestions.push({
      id: 'suggest-interview-prep',
      type: 'success',
      title: 'Get Ready for Interviews',
      message: 'You have applications in progress. Prepare with AI-powered interview practice!',
      action: { label: 'Prepare Now', handler: 'open-interview-prep' },
      dismissible: true,
      priority: 11
    });
  }

  // Career path suggestion
  if (profile.experience.length >= 2 && !userActions.includes('viewed-career-paths')) {
    suggestions.push({
      id: 'suggest-career-path',
      type: 'info',
      title: 'Explore Career Paths',
      message: 'Based on your experience, discover potential career directions and growth opportunities.',
      action: { label: 'View Paths', handler: 'view-career-paths' },
      dismissible: true,
      priority: 7
    });
  }

  return suggestions;
}

/**
 * Progress-based tips
 */
export function getProgressTips(completionPercentage: number): ContextualTip | null {
  if (completionPercentage < 30) {
    return {
      id: 'complete-profile',
      type: 'warning',
      title: 'Profile Only ' + completionPercentage + '% Complete',
      message: 'Complete your profile to unlock AI features and maximize your job search success.',
      dismissible: false,
      priority: 15
    };
  }

  if (completionPercentage >= 30 && completionPercentage < 70) {
    return {
      id: 'almost-there',
      type: 'info',
      title: 'You\'re Making Progress!',
      message: `Your profile is ${completionPercentage}% complete. Add more details to improve your ATS score.`,
      dismissible: true,
      priority: 10
    };
  }

  if (completionPercentage >= 70 && completionPercentage < 100) {
    return {
      id: 'nearly-complete',
      type: 'success',
      title: 'Almost There!',
      message: `Your profile is ${completionPercentage}% complete. Just a few more details!`,
      dismissible: true,
      priority: 8
    };
  }

  if (completionPercentage === 100) {
    return {
      id: 'profile-complete',
      type: 'success',
      title: '🎉 Profile Complete!',
      message: 'Your profile is fully optimized. Now start applying to jobs with confidence!',
      action: { label: 'Find Jobs', handler: 'goto-recommendations' },
      dismissible: true,
      priority: 12
    };
  }

  return null;
}

/**
 * Time-based tips
 */
export function getTimedTips(lastActive: Date): ContextualTip[] {
  const tips: ContextualTip[] = [];
  const daysSinceActive = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceActive >= 7) {
    tips.push({
      id: 'welcome-back',
      type: 'info',
      title: 'Welcome Back!',
      message: `It's been ${daysSinceActive} days. Check out new AI features and update your resume.`,
      dismissible: true,
      priority: 10
    });
  }

  return tips;
}

/**
 * Achievement tips
 */
export function getAchievementTips(achievements: string[]): ContextualTip[] {
  const tips: ContextualTip[] = [];

  const achievementMessages: Record<string, ContextualTip> = {
    'first-resume': {
      id: 'first-resume-achievement',
      type: 'success',
      title: '🎊 First Resume Generated!',
      message: 'Great job! Download it and start applying to jobs.',
      dismissible: true,
      priority: 15
    },
    'five-applications': {
      id: 'five-apps-achievement',
      type: 'success',
      title: '🎯 5 Applications Tracked!',
      message: 'You\'re on fire! Keep up the momentum.',
      dismissible: true,
      priority: 12
    },
    'first-interview': {
      id: 'first-interview-achievement',
      type: 'success',
      title: '🎉 First Interview Scheduled!',
      message: 'Awesome! Use our Interview Prep tool to ace it.',
      action: { label: 'Prepare', handler: 'open-interview-prep' },
      dismissible: true,
      priority: 16
    }
  };

  achievements.forEach(achievement => {
    if (achievementMessages[achievement]) {
      tips.push(achievementMessages[achievement]);
    }
  });

  return tips;
}
