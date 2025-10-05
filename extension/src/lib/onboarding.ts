/**
 * Smart Onboarding System
 * Guides users through features based on their needs
 */

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: string;
  targetElement?: string;
  completed: boolean;
  skipped: boolean;
  order: number;
}

export interface OnboardingFlow {
  id: string;
  name: string;
  description: string;
  steps: OnboardingStep[];
  currentStep: number;
  completed: boolean;
}

export interface UserProgress {
  flows: OnboardingFlow[];
  completedSteps: string[];
  skippedFlows: string[];
  lastActiveFlow?: string;
  startedAt: Date;
  completedAt?: Date;
}

const STORAGE_KEY = 'onboarding_progress';

/**
 * Onboarding flows for different user types
 */
export const ONBOARDING_FLOWS: Record<string, OnboardingFlow> = {
  'first-time': {
    id: 'first-time',
    name: 'First Time User',
    description: 'Get started with CV Builder basics',
    currentStep: 0,
    completed: false,
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to AI CV Builder! 🎉',
        description: 'Create professional resumes optimized for ATS systems',
        action: 'Next',
        completed: false,
        skipped: false,
        order: 1
      },
      {
        id: 'fill-profile',
        title: 'Fill Your Profile',
        description: 'Add your personal info, experience, education, and skills',
        action: 'Go to CV Profile',
        targetElement: '[data-tab="cv"]',
        completed: false,
        skipped: false,
        order: 2
      },
      {
        id: 'add-job',
        title: 'Add a Job Description',
        description: 'Paste a job posting to get AI-powered matching insights',
        action: 'Go to Job Description',
        targetElement: '[data-tab="job"]',
        completed: false,
        skipped: false,
        order: 3
      },
      {
        id: 'generate-resume',
        title: 'Generate Your Resume',
        description: 'Let AI optimize your resume for the job',
        action: 'Generate Resume',
        completed: false,
        skipped: false,
        order: 4
      },
      {
        id: 'explore-features',
        title: 'Explore More Features',
        description: 'Try Interview Prep, Salary Negotiation, and Career Planning',
        action: 'Finish',
        completed: false,
        skipped: false,
        order: 5
      }
    ]
  },
  
  'job-seeker': {
    id: 'job-seeker',
    name: 'Active Job Seeker',
    description: 'Accelerate your job search',
    currentStep: 0,
    completed: false,
    steps: [
      {
        id: 'setup-profile',
        title: 'Complete Your Profile',
        description: 'Ensure all sections are filled',
        action: 'Review Profile',
        completed: false,
        skipped: false,
        order: 1
      },
      {
        id: 'job-tracker',
        title: 'Track Applications',
        description: 'Organize your job applications in one place',
        action: 'Open Job Tracker',
        targetElement: '[data-tab="tracker"]',
        completed: false,
        skipped: false,
        order: 2
      },
      {
        id: 'ai-coach',
        title: 'Use AI Coach',
        description: 'Get personalized advice on improving your resume',
        action: 'Open AI Coach',
        targetElement: '[data-tab="ai-coach"]',
        completed: false,
        skipped: false,
        order: 3
      },
      {
        id: 'interview-prep',
        title: 'Prepare for Interviews',
        description: 'Practice with AI-generated interview questions',
        action: 'Start Prep',
        completed: false,
        skipped: false,
        order: 4
      }
    ]
  },

  'career-growth': {
    id: 'career-growth',
    name: 'Career Growth',
    description: 'Plan your next career move',
    currentStep: 0,
    completed: false,
    steps: [
      {
        id: 'career-analysis',
        title: 'Analyze Your Career',
        description: 'Get AI insights on your career trajectory',
        action: 'View Analysis',
        completed: false,
        skipped: false,
        order: 1
      },
      {
        id: 'skill-gaps',
        title: 'Identify Skill Gaps',
        description: 'Discover what skills to learn next',
        action: 'View Gaps',
        completed: false,
        skipped: false,
        order: 2
      },
      {
        id: 'career-paths',
        title: 'Explore Career Paths',
        description: 'See potential career directions',
        action: 'View Paths',
        completed: false,
        skipped: false,
        order: 3
      },
      {
        id: 'learning-plan',
        title: 'Create Learning Plan',
        description: 'Get a personalized skill development roadmap',
        action: 'Create Plan',
        completed: false,
        skipped: false,
        order: 4
      }
    ]
  }
};

/**
 * Onboarding Manager
 */
export class OnboardingManager {
  private static instance: OnboardingManager;
  private progress: UserProgress | null = null;

  static getInstance(): OnboardingManager {
    if (!OnboardingManager.instance) {
      OnboardingManager.instance = new OnboardingManager();
    }
    return OnboardingManager.instance;
  }

  /**
   * Initialize onboarding
   */
  async initialize(): Promise<UserProgress> {
    const stored = await chrome.storage.local.get(STORAGE_KEY);
    
    if (stored[STORAGE_KEY]) {
      this.progress = stored[STORAGE_KEY];
    } else {
      this.progress = {
        flows: [ONBOARDING_FLOWS['first-time']],
        completedSteps: [],
        skippedFlows: [],
        startedAt: new Date()
      };
      await this.save();
    }

    return this.progress;
  }

  /**
   * Get active flow
   */
  getActiveFlow(): OnboardingFlow | null {
    if (!this.progress) return null;
    
    return this.progress.flows.find(f => 
      !f.completed && !this.progress!.skippedFlows.includes(f.id)
    ) || null;
  }

  /**
   * Get current step
   */
  getCurrentStep(): OnboardingStep | null {
    const flow = this.getActiveFlow();
    if (!flow) return null;

    return flow.steps[flow.currentStep] || null;
  }

  /**
   * Complete current step
   */
  async completeStep(stepId: string): Promise<void> {
    if (!this.progress) return;

    const flow = this.getActiveFlow();
    if (!flow) return;

    const step = flow.steps.find(s => s.id === stepId);
    if (step) {
      step.completed = true;
      this.progress.completedSteps.push(stepId);
      
      // Move to next step
      flow.currentStep++;
      
      // Check if flow is complete
      if (flow.currentStep >= flow.steps.length) {
        flow.completed = true;
      }

      await this.save();
    }
  }

  /**
   * Skip current step
   */
  async skipStep(stepId: string): Promise<void> {
    if (!this.progress) return;

    const flow = this.getActiveFlow();
    if (!flow) return;

    const step = flow.steps.find(s => s.id === stepId);
    if (step) {
      step.skipped = true;
      flow.currentStep++;
      
      if (flow.currentStep >= flow.steps.length) {
        flow.completed = true;
      }

      await this.save();
    }
  }

  /**
   * Skip entire flow
   */
  async skipFlow(flowId: string): Promise<void> {
    if (!this.progress) return;

    if (!this.progress.skippedFlows.includes(flowId)) {
      this.progress.skippedFlows.push(flowId);
      await this.save();
    }
  }

  /**
   * Start a specific flow
   */
  async startFlow(flowId: string): Promise<void> {
    if (!this.progress) return;

    const flow = ONBOARDING_FLOWS[flowId];
    if (flow) {
      const existing = this.progress.flows.find(f => f.id === flowId);
      if (!existing) {
        this.progress.flows.push({ ...flow });
      }
      this.progress.lastActiveFlow = flowId;
      await this.save();
    }
  }

  /**
   * Check if onboarding is needed
   */
  needsOnboarding(): boolean {
    if (!this.progress) return true;
    return this.progress.flows.some(f => !f.completed);
  }

  /**
   * Get progress percentage
   */
  getProgress(): number {
    if (!this.progress) return 0;

    const totalSteps = this.progress.flows.reduce((sum, f) => sum + f.steps.length, 0);
    const completedSteps = this.progress.completedSteps.length;

    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  }

  /**
   * Reset onboarding
   */
  async reset(): Promise<void> {
    this.progress = {
      flows: [ONBOARDING_FLOWS['first-time']],
      completedSteps: [],
      skippedFlows: [],
      startedAt: new Date()
    };
    await this.save();
  }

  private async save(): Promise<void> {
    if (this.progress) {
      await chrome.storage.local.set({ [STORAGE_KEY]: this.progress });
    }
  }
}

/**
 * Get contextual tips based on user actions
 */
export function getContextualTip(context: string): string | null {
  const tips: Record<string, string> = {
    'empty-summary': '💡 Tip: A strong summary should be 2-3 sentences highlighting your key skills and experience',
    'few-skills': '💡 Tip: Add 10-15 relevant skills. More skills = better ATS matching!',
    'no-metrics': '💡 Tip: Add numbers! "Increased sales by 40%" is much stronger than "Increased sales"',
    'long-description': '💡 Tip: Keep descriptions concise. Use 3-5 bullet points per role',
    'missing-dates': '💡 Tip: Include start and end dates for all experiences',
    'no-job': '💡 Tip: Add a job description to get AI-powered resume optimization',
    'low-ats-score': '💡 Tip: Your ATS score is low. Try using more keywords from the job posting',
    'first-generation': '🎉 Tip: Great! Now review the generated resume and download as PDF',
    'no-cover-letter': '💡 Tip: Generate a matching cover letter to complete your application'
  };

  return tips[context] || null;
}
