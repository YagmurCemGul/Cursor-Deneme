/**
 * Conversation Manager
 * Manages multi-turn AI conversations for resume improvement
 */

import type { ResumeProfile, JobPost } from './types';
import { callOpenAI } from './ai';
import { analyzeJobPosting, JobContext } from './jobAnalyzer';
import { tailorResumeToJob } from './resumeTailoring';

export interface ConversationTurn {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: {
    section?: string;
    suggestion?: string;
    applied?: boolean;
    changes?: ProfileChange[];
  };
}

export interface ProfileChange {
  type: 'add' | 'modify' | 'remove';
  section: 'summary' | 'skills' | 'experience' | 'education' | 'projects' | 'certifications';
  path?: string;
  before?: any;
  after?: any;
  description: string;
}

export interface ConversationContext {
  profile: ResumeProfile;
  job: JobPost;
  jobContext?: JobContext;
  currentFocus?: string;
  appliedChanges: ProfileChange[];
  improvements: string[];
}

export interface AIConversation {
  id: string;
  profileId: string;
  jobId: string;
  turns: ConversationTurn[];
  context: ConversationContext;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Conversation Manager Class
 */
export class ConversationManager {
  private conversation: AIConversation;
  private maxTurns: number = 50;

  constructor(profile: ResumeProfile, job: JobPost, existingConversation?: AIConversation) {
    if (existingConversation) {
      this.conversation = existingConversation;
    } else {
      const jobContext = analyzeJobPosting(job.pastedText, job.title);
      
      this.conversation = {
        id: crypto.randomUUID(),
        profileId: profile.id || crypto.randomUUID(),
        jobId: job.id,
        turns: [],
        context: {
          profile,
          job,
          jobContext,
          appliedChanges: [],
          improvements: []
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add system initialization
      this.addSystemMessage(this.generateSystemInitMessage());
    }
  }

  /**
   * Add a user message and get AI response
   */
  async sendMessage(userMessage: string): Promise<ConversationTurn> {
    // Add user message to history
    const userTurn: ConversationTurn = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    this.conversation.turns.push(userTurn);

    // Analyze user intent
    const intent = this.analyzeIntent(userMessage);

    // Generate AI response based on intent
    const aiResponse = await this.generateResponse(userMessage, intent);

    // Add AI response to history
    const aiTurn: ConversationTurn = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      context: intent
    };
    this.conversation.turns.push(aiTurn);

    // Update conversation
    this.conversation.updatedAt = new Date();

    // Trim history if too long
    if (this.conversation.turns.length > this.maxTurns) {
      this.trimHistory();
    }

    return aiTurn;
  }

  /**
   * Improve a specific section of the resume
   */
  async improveSection(
    section: 'summary' | 'skills' | 'experience' | 'education' | 'projects' | 'certifications',
    specificRequest?: string
  ): Promise<{ suggestion: string; changes: ProfileChange[] }> {
    const { profile, job, jobContext } = this.conversation.context;
    
    const tailoringResult = tailorResumeToJob(profile, job.pastedText, job.title);
    const sectionSuggestions = tailoringResult.suggestions.filter(s => s.section === section);

    // Build prompt for section improvement
    const prompt = this.buildSectionImprovementPrompt(
      section,
      sectionSuggestions,
      specificRequest
    );

    const systemPrompt = `You are a professional resume advisor having a conversation with a job seeker.
Your goal is to improve their ${section} section to better match the job they're applying for.
Be conversational, specific, and actionable. Provide concrete examples and explanations.`;

    const suggestion = await callOpenAI(systemPrompt, prompt, { temperature: 0.7 });

    // Generate profile changes
    const changes = this.generateChangesForSection(section, suggestion, sectionSuggestions);

    // Update context
    this.conversation.context.currentFocus = section;
    this.conversation.context.improvements.push(`Improved ${section}`);

    return { suggestion, changes };
  }

  /**
   * Ask a question to the AI assistant
   */
  async askQuestion(question: string): Promise<string> {
    const { profile, job, jobContext } = this.conversation.context;
    
    const systemPrompt = `You are an expert resume and career advisor. 
Answer questions about resume writing, job applications, and career development.
Be conversational, helpful, and provide actionable advice.`;

    const contextPrompt = `
CANDIDATE CONTEXT:
- Name: ${profile.personal.firstName} ${profile.personal.lastName}
- Current Role: ${profile.experience?.[0]?.title || 'N/A'}
- Top Skills: ${profile.skills.slice(0, 5).join(', ')}
- Target Job: ${job.title || 'Not specified'}
- Job Match Score: ${jobContext ? 'Available' : 'Not analyzed'}

CONVERSATION HISTORY (last 3 turns):
${this.getRecentHistory(3)}

USER QUESTION:
${question}

Provide a helpful, conversational answer based on the candidate's context.`;

    const answer = await callOpenAI(systemPrompt, contextPrompt, { temperature: 0.7 });
    return answer;
  }

  /**
   * Get conversation history
   */
  getHistory(): ConversationTurn[] {
    return this.conversation.turns;
  }

  /**
   * Get recent history as string
   */
  getRecentHistory(count: number = 5): string {
    const recent = this.conversation.turns.slice(-count);
    return recent
      .map(turn => `${turn.role.toUpperCase()}: ${turn.content}`)
      .join('\n\n');
  }

  /**
   * Get conversation context
   */
  getContext(): ConversationContext {
    return this.conversation.context;
  }

  /**
   * Apply changes to profile
   */
  applyChanges(changes: ProfileChange[]): ResumeProfile {
    let updatedProfile = { ...this.conversation.context.profile };

    changes.forEach(change => {
      switch (change.type) {
        case 'add':
          updatedProfile = this.applyAddChange(updatedProfile, change);
          break;
        case 'modify':
          updatedProfile = this.applyModifyChange(updatedProfile, change);
          break;
        case 'remove':
          updatedProfile = this.applyRemoveChange(updatedProfile, change);
          break;
      }
      
      // Track applied changes
      this.conversation.context.appliedChanges.push(change);
    });

    // Update context
    this.conversation.context.profile = updatedProfile;
    this.conversation.updatedAt = new Date();

    return updatedProfile;
  }

  /**
   * Export conversation for persistence
   */
  export(): AIConversation {
    return this.conversation;
  }

  /**
   * Get conversation summary
   */
  getSummary(): string {
    const { appliedChanges, improvements } = this.conversation.context;
    const turnCount = this.conversation.turns.length;
    
    return `Conversation with ${turnCount} turns. Applied ${appliedChanges.length} changes. Improvements: ${improvements.join(', ') || 'None yet'}.`;
  }

  // Private methods

  private generateSystemInitMessage(): string {
    const { profile, job, jobContext } = this.conversation.context;
    const tailoringResult = tailorResumeToJob(profile, job.pastedText, job.title);

    return `Hello! I'm your AI resume advisor. I've analyzed your profile and the job you're targeting.

**Quick Overview:**
- Your Match Score: ${tailoringResult.analysis.overallMatchScore}%
- Strong Areas: ${tailoringResult.strengthAreas.slice(0, 3).join(', ')}
- Areas to Improve: ${tailoringResult.suggestions.slice(0, 3).map(s => s.section).join(', ')}

I can help you:
1. 💬 Improve specific sections (summary, skills, experience)
2. 🎯 Tailor your resume to this job
3. ❓ Answer questions about resume writing
4. ✨ Provide personalized suggestions

What would you like to work on?`;
  }

  private addSystemMessage(content: string): void {
    const systemTurn: ConversationTurn = {
      id: crypto.randomUUID(),
      role: 'system',
      content,
      timestamp: new Date()
    };
    this.conversation.turns.push(systemTurn);
  }

  private analyzeIntent(message: string): any {
    const lowerMessage = message.toLowerCase();
    
    // Detect section focus
    const sections = ['summary', 'skills', 'experience', 'education', 'projects', 'certifications'];
    const mentionedSection = sections.find(s => lowerMessage.includes(s));

    // Detect action type
    let action: string | undefined;
    if (lowerMessage.match(/improve|better|enhance|optimize|strengthen/)) {
      action = 'improve';
    } else if (lowerMessage.match(/add|include|insert/)) {
      action = 'add';
    } else if (lowerMessage.match(/remove|delete|take out/)) {
      action = 'remove';
    } else if (lowerMessage.match(/change|modify|update|rewrite/)) {
      action = 'modify';
    } else if (lowerMessage.match(/how|what|why|when|can|should|question|\?/)) {
      action = 'question';
    }

    return {
      section: mentionedSection,
      action,
      suggestion: message
    };
  }

  private async generateResponse(userMessage: string, intent: any): Promise<string> {
    const { profile, job, jobContext } = this.conversation.context;

    // If asking to improve a section
    if (intent.action === 'improve' && intent.section) {
      const result = await this.improveSection(intent.section as any, userMessage);
      return result.suggestion;
    }

    // If asking a question
    if (intent.action === 'question') {
      return await this.askQuestion(userMessage);
    }

    // General conversation
    const systemPrompt = `You are a friendly, expert resume advisor in a conversation.
Respond naturally and helpfully. If the user's request is unclear, ask clarifying questions.`;

    const contextPrompt = `
CANDIDATE PROFILE:
${JSON.stringify(profile, null, 2)}

JOB TARGET:
${job.pastedText.substring(0, 500)}...

CONVERSATION HISTORY (recent):
${this.getRecentHistory(3)}

USER MESSAGE:
${userMessage}

Respond conversationally and helpfully. If they want to improve something specific, guide them.
If they're unsure, suggest what to work on based on their profile and the job.`;

    return await callOpenAI(systemPrompt, contextPrompt, { temperature: 0.7 });
  }

  private buildSectionImprovementPrompt(
    section: string,
    suggestions: any[],
    specificRequest?: string
  ): string {
    const { profile, job, jobContext } = this.conversation.context;
    
    let currentContent = '';
    switch (section) {
      case 'summary':
        currentContent = profile.summary || 'No summary yet';
        break;
      case 'skills':
        currentContent = profile.skills.join(', ');
        break;
      case 'experience':
        currentContent = profile.experience.map(exp => 
          `${exp.title} at ${exp.company}: ${exp.description || 'No description'}`
        ).join('\n\n');
        break;
      case 'education':
        currentContent = profile.education.map(edu => 
          `${edu.degree} in ${edu.fieldOfStudy || 'N/A'} from ${edu.school}`
        ).join('\n');
        break;
      case 'projects':
        currentContent = profile.projects?.map(proj => 
          `${proj.name}: ${proj.description || 'No description'}`
        ).join('\n\n') || 'No projects';
        break;
      case 'certifications':
        currentContent = profile.certifications?.map(cert => 
          `${cert.name} - ${cert.issuer}`
        ).join('\n') || 'No certifications';
        break;
    }

    return `
I need to improve the ${section.toUpperCase()} section of my resume for this job.

CURRENT ${section.toUpperCase()}:
${currentContent}

JOB REQUIREMENTS (relevant to ${section}):
${jobContext?.requiredSkills.slice(0, 5).join(', ') || 'N/A'}

AI SUGGESTIONS FOR THIS SECTION:
${suggestions.map((s, i) => `${i + 1}. ${s.title}: ${s.description}`).join('\n')}

${specificRequest ? `SPECIFIC REQUEST:\n${specificRequest}\n` : ''}

Please provide:
1. A conversational explanation of what to improve and why
2. Specific, actionable suggestions
3. Example content or phrases I can use
4. How this improves my match for the job

Be friendly and conversational, like a mentor would explain it.`;
  }

  private generateChangesForSection(
    section: string,
    suggestion: string,
    sectionSuggestions: any[]
  ): ProfileChange[] {
    const changes: ProfileChange[] = [];

    // Generate changes based on section and suggestions
    sectionSuggestions.forEach(sugg => {
      const change: ProfileChange = {
        type: sugg.type as any,
        section: section as any,
        description: sugg.title,
        before: sugg.before,
        after: sugg.after
      };
      changes.push(change);
    });

    return changes.slice(0, 3); // Limit to top 3 changes
  }

  private applyAddChange(profile: ResumeProfile, change: ProfileChange): ResumeProfile {
    const updated = { ...profile };
    
    if (change.section === 'skills' && change.after) {
      const newSkills = Array.isArray(change.after) ? change.after : [change.after];
      updated.skills = [...updated.skills, ...newSkills];
    }
    
    return updated;
  }

  private applyModifyChange(profile: ResumeProfile, change: ProfileChange): ResumeProfile {
    const updated = { ...profile };
    
    if (change.section === 'summary' && change.after) {
      updated.summary = change.after;
    }
    
    return updated;
  }

  private applyRemoveChange(profile: ResumeProfile, change: ProfileChange): ResumeProfile {
    const updated = { ...profile };
    
    if (change.section === 'skills' && change.before) {
      updated.skills = updated.skills.filter(s => s !== change.before);
    }
    
    return updated;
  }

  private trimHistory(): void {
    // Keep first 2 (system init) and last 40 turns
    const systemTurns = this.conversation.turns.slice(0, 2);
    const recentTurns = this.conversation.turns.slice(-40);
    this.conversation.turns = [...systemTurns, ...recentTurns];
  }
}

/**
 * Storage helpers
 */
const STORAGE_KEY = 'ai_conversations';

export async function saveConversation(conversation: AIConversation): Promise<void> {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const conversations = stored[STORAGE_KEY] || [];
  
  const existingIndex = conversations.findIndex((c: AIConversation) => c.id === conversation.id);
  if (existingIndex >= 0) {
    conversations[existingIndex] = conversation;
  } else {
    conversations.push(conversation);
  }
  
  // Keep only last 10 conversations
  const trimmed = conversations.slice(-10);
  
  await chrome.storage.local.set({ [STORAGE_KEY]: trimmed });
}

export async function loadConversation(conversationId: string): Promise<AIConversation | null> {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const conversations = stored[STORAGE_KEY] || [];
  return conversations.find((c: AIConversation) => c.id === conversationId) || null;
}

export async function loadConversationsForProfile(profileId: string): Promise<AIConversation[]> {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const conversations = stored[STORAGE_KEY] || [];
  return conversations.filter((c: AIConversation) => c.profileId === profileId);
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const conversations = stored[STORAGE_KEY] || [];
  const filtered = conversations.filter((c: AIConversation) => c.id !== conversationId);
  await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
}
