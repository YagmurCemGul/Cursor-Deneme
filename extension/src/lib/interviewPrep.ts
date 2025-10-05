/**
 * Interview Preparation Assistant
 * AI-powered interview prep with questions, answers, and feedback
 */

import type { ResumeProfile, JobPost } from './types';
import { callOpenAI } from './ai';
import { analyzeJobPosting, type JobContext } from './jobAnalyzer';
import { getRecommendedModel } from './aiProviders';

export interface InterviewQuestion {
  id: string;
  category: 'behavioral' | 'technical' | 'situational' | 'company-specific';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  suggestedAnswer: string;
  keyPoints: string[];
  tips: string[];
  commonMistakes: string[];
}

export interface InterviewPrepPlan {
  jobTitle: string;
  company: string;
  questions: InterviewQuestion[];
  companyResearch: {
    keyFacts: string[];
    culture: string[];
    recentNews: string[];
    questionsToAsk: string[];
  };
  preparationTips: string[];
  storyBank: InterviewStory[];
}

export interface InterviewStory {
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  skills: string[];
  whenToUse: string[];
}

export interface PracticeSession {
  id: string;
  questionId: string;
  userAnswer: string;
  feedback: {
    score: number;
    strengths: string[];
    improvements: string[];
    enhancedAnswer: string;
  };
  timestamp: Date;
}

/**
 * Generate comprehensive interview prep plan
 */
export async function generateInterviewPrepPlan(
  profile: ResumeProfile,
  job: JobPost
): Promise<InterviewPrepPlan> {
  const jobContext = analyzeJobPosting(job.pastedText, job.title);
  
  // Generate different types of questions in parallel
  const [behavioralQs, technicalQs, situationalQs, companyQs, research, stories] = await Promise.all([
    generateBehavioralQuestions(profile, jobContext),
    generateTechnicalQuestions(profile, jobContext),
    generateSituationalQuestions(profile, jobContext),
    generateCompanySpecificQuestions(job, jobContext),
    generateCompanyResearch(job, jobContext),
    generateStoryBank(profile, jobContext)
  ]);

  const allQuestions = [
    ...behavioralQs,
    ...technicalQs,
    ...situationalQs,
    ...companyQs
  ];

  const preparationTips = generatePreparationTips(jobContext);

  return {
    jobTitle: job.title || jobContext.jobTitle,
    company: job.company || 'the company',
    questions: allQuestions,
    companyResearch: research,
    preparationTips,
    storyBank: stories
  };
}

/**
 * Generate behavioral interview questions
 */
async function generateBehavioralQuestions(
  profile: ResumeProfile,
  jobContext: JobContext
): Promise<InterviewQuestion[]> {
  const systemPrompt = `You are an experienced interview coach. Generate realistic behavioral interview questions.`;

  const userPrompt = `
JOB CONTEXT:
- Title: ${jobContext.jobTitle}
- Level: ${jobContext.experienceLevel}
- Company Culture: ${jobContext.companyCulture.join(', ')}
- Key Skills: ${jobContext.requiredSkills.slice(0, 5).join(', ')}

CANDIDATE BACKGROUND:
- Experience: ${profile.experience.map(e => e.title).join(', ')}
- Skills: ${profile.skills.slice(0, 8).join(', ')}

Generate 5 behavioral interview questions using STAR method. For each question provide:
1. The question
2. A suggested answer framework
3. 3 key points to cover
4. 2 tips for answering
5. 2 common mistakes to avoid

Format as JSON array with fields: question, suggestedAnswer, keyPoints, tips, commonMistakes, difficulty (easy/medium/hard).`;

  const model = getRecommendedModel('resume');
  const response = await callOpenAI(systemPrompt, userPrompt, { temperature: 0.7, model });
  
  try {
    const parsed = JSON.parse(response);
    return parsed.map((q: any) => ({
      id: crypto.randomUUID(),
      category: 'behavioral' as const,
      difficulty: q.difficulty || 'medium',
      question: q.question,
      suggestedAnswer: q.suggestedAnswer,
      keyPoints: q.keyPoints || [],
      tips: q.tips || [],
      commonMistakes: q.commonMistakes || []
    }));
  } catch (error) {
    // Fallback to hardcoded questions if parsing fails
    return generateFallbackBehavioralQuestions(jobContext);
  }
}

/**
 * Generate technical interview questions
 */
async function generateTechnicalQuestions(
  profile: ResumeProfile,
  jobContext: JobContext
): Promise<InterviewQuestion[]> {
  const systemPrompt = `You are a technical interviewer. Generate relevant technical questions based on required skills.`;

  const userPrompt = `
REQUIRED TECHNICAL SKILLS:
${jobContext.technicalSkills.join(', ')}

CANDIDATE'S TECHNICAL SKILLS:
${profile.skills.filter(s => jobContext.technicalSkills.some(ts => 
  s.toLowerCase().includes(ts.toLowerCase())
)).join(', ')}

Generate 5 technical interview questions. For each:
1. The question
2. Expected answer points
3. Key concepts to demonstrate
4. Tips for answering
5. Common mistakes

Format as JSON array with fields: question, suggestedAnswer, keyPoints, tips, commonMistakes, difficulty.`;

  const model = getRecommendedModel('resume');
  const response = await callOpenAI(systemPrompt, userPrompt, { temperature: 0.7, model });
  
  try {
    const parsed = JSON.parse(response);
    return parsed.map((q: any) => ({
      id: crypto.randomUUID(),
      category: 'technical' as const,
      difficulty: q.difficulty || 'medium',
      question: q.question,
      suggestedAnswer: q.suggestedAnswer,
      keyPoints: q.keyPoints || [],
      tips: q.tips || [],
      commonMistakes: q.commonMistakes || []
    }));
  } catch (error) {
    return generateFallbackTechnicalQuestions(jobContext);
  }
}

/**
 * Generate situational questions
 */
async function generateSituationalQuestions(
  profile: ResumeProfile,
  jobContext: JobContext
): Promise<InterviewQuestion[]> {
  const questions: InterviewQuestion[] = [
    {
      id: crypto.randomUUID(),
      category: 'situational',
      difficulty: 'medium',
      question: `How would you handle a situation where you disagreed with your manager about the technical approach to a project?`,
      suggestedAnswer: `I would first ensure I fully understand their perspective, then present my concerns with data and alternative solutions, ultimately respecting their final decision while documenting my recommendations.`,
      keyPoints: [
        'Show respect for authority',
        'Data-driven reasoning',
        'Collaborative problem-solving'
      ],
      tips: [
        'Emphasize communication and respect',
        'Show you can disagree professionally'
      ],
      commonMistakes: [
        'Being too confrontational',
        'Not showing flexibility'
      ]
    },
    {
      id: crypto.randomUUID(),
      category: 'situational',
      difficulty: 'hard',
      question: `What would you do if you discovered a critical bug in production that you had introduced?`,
      suggestedAnswer: `I would immediately assess the impact, notify relevant stakeholders, create a hotfix, implement monitoring, and conduct a post-mortem to prevent similar issues.`,
      keyPoints: [
        'Ownership and accountability',
        'Quick problem resolution',
        'Learning from mistakes'
      ],
      tips: [
        'Show you take ownership',
        'Emphasize systematic approach'
      ],
      commonMistakes: [
        'Blaming others or tools',
        'Not mentioning prevention'
      ]
    }
  ];

  return questions;
}

/**
 * Generate company-specific questions
 */
async function generateCompanySpecificQuestions(
  job: JobPost,
  jobContext: JobContext
): Promise<InterviewQuestion[]> {
  const company = job.company || 'this company';
  
  const questions: InterviewQuestion[] = [
    {
      id: crypto.randomUUID(),
      category: 'company-specific',
      difficulty: 'easy',
      question: `Why do you want to work for ${company}?`,
      suggestedAnswer: `Research the company's mission, products, and culture. Connect your values and career goals to what the company offers.`,
      keyPoints: [
        'Show genuine interest',
        'Connect to company mission',
        'Highlight mutual benefit'
      ],
      tips: [
        'Research company thoroughly',
        'Be specific, not generic'
      ],
      commonMistakes: [
        'Generic answers',
        'Only mentioning salary/benefits'
      ]
    },
    {
      id: crypto.randomUUID(),
      category: 'company-specific',
      difficulty: 'medium',
      question: `What do you know about ${company}'s products/services?`,
      suggestedAnswer: `Research their main products, recent launches, and how they differ from competitors. Show you've used or understood their offerings.`,
      keyPoints: [
        'Demonstrate product knowledge',
        'Show competitive awareness',
        'Mention specific features'
      ],
      tips: [
        'Actually use their products',
        'Read recent news'
      ],
      commonMistakes: [
        'Not doing research',
        'Confusing with competitors'
      ]
    }
  ];

  return questions;
}

/**
 * Generate company research
 */
async function generateCompanyResearch(
  job: JobPost,
  jobContext: JobContext
): Promise<InterviewPrepPlan['companyResearch']> {
  return {
    keyFacts: [
      `Research the company's history, size, and industry position`,
      `Understand their business model and revenue streams`,
      `Know their main products and services`,
      `Identify their key competitors`
    ],
    culture: jobContext.companyCulture.length > 0 
      ? jobContext.companyCulture.map(c => `Values ${c}`)
      : [
        `Review employee reviews on Glassdoor`,
        `Check their social media presence`,
        `Read about their work environment`
      ],
    recentNews: [
      `Check recent press releases`,
      `Look for funding rounds or acquisitions`,
      `Review product launches or updates`,
      `Find industry awards or recognition`
    ],
    questionsToAsk: [
      `What does success look like in this role after 6 months?`,
      `How does the team collaborate on projects?`,
      `What are the biggest challenges facing the team/company?`,
      `What opportunities are there for professional development?`,
      `Can you tell me about the team I'd be working with?`
    ]
  };
}

/**
 * Generate STAR story bank
 */
async function generateStoryBank(
  profile: ResumeProfile,
  jobContext: JobContext
): Promise<InterviewStory[]> {
  const stories: InterviewStory[] = profile.experience.slice(0, 3).map(exp => ({
    title: `${exp.title} - Key Achievement`,
    situation: `At ${exp.company}, we faced...`,
    task: `I was responsible for...`,
    action: `I took the following steps: 1) ... 2) ... 3) ...`,
    result: `This resulted in... (quantify impact)`,
    skills: profile.skills.slice(0, 3),
    whenToUse: [
      'When asked about leadership',
      'When discussing problem-solving',
      'When showing technical skills'
    ]
  }));

  return stories;
}

/**
 * Generate preparation tips
 */
function generatePreparationTips(jobContext: JobContext): string[] {
  return [
    `📚 Review ${jobContext.requiredSkills.slice(0, 3).join(', ')} concepts thoroughly`,
    `💼 Prepare 5-7 STAR stories covering different competencies`,
    `🏢 Research the company's recent news and products`,
    `❓ Prepare 3-5 thoughtful questions to ask the interviewer`,
    `🎯 Practice answering questions out loud, not just in your head`,
    `📝 Bring copies of your resume and a notepad`,
    `⏰ Arrive 10-15 minutes early (or log in early for virtual)`,
    `👔 Dress professionally and appropriately for the company culture`,
    `😊 Practice positive body language and eye contact`,
    `📧 Send a thank-you email within 24 hours`
  ];
}

/**
 * Practice answering a question and get AI feedback
 */
export async function practiceQuestion(
  question: InterviewQuestion,
  userAnswer: string,
  profile: ResumeProfile
): Promise<PracticeSession['feedback']> {
  const systemPrompt = `You are an experienced interview coach providing constructive feedback on interview answers.`;

  const userPrompt = `
INTERVIEW QUESTION:
${question.question}

CANDIDATE'S ANSWER:
${userAnswer}

SUGGESTED KEY POINTS:
${question.keyPoints.join('\n')}

CANDIDATE BACKGROUND:
- Experience: ${profile.experience[0]?.title || 'N/A'}
- Skills: ${profile.skills.slice(0, 5).join(', ')}

Evaluate the answer and provide:
1. Score (0-100)
2. 3 strengths
3. 3 areas for improvement
4. An enhanced version of the answer

Format as JSON: { score, strengths: [], improvements: [], enhancedAnswer: "" }`;

  const model = getRecommendedModel('chat');
  const response = await callOpenAI(systemPrompt, userPrompt, { temperature: 0.7, model });
  
  try {
    const feedback = JSON.parse(response);
    return {
      score: feedback.score || 70,
      strengths: feedback.strengths || ['Good structure'],
      improvements: feedback.improvements || ['Add more specific examples'],
      enhancedAnswer: feedback.enhancedAnswer || userAnswer
    };
  } catch (error) {
    // Fallback feedback
    return {
      score: 75,
      strengths: [
        'Clear communication',
        'Relevant experience mentioned',
        'Good structure'
      ],
      improvements: [
        'Add more quantifiable results',
        'Include specific examples',
        'Connect to company needs'
      ],
      enhancedAnswer: userAnswer + ' [Enhanced version would include specific metrics and outcomes]'
    };
  }
}

/**
 * Fallback questions if AI generation fails
 */
function generateFallbackBehavioralQuestions(jobContext: JobContext): InterviewQuestion[] {
  return [
    {
      id: crypto.randomUUID(),
      category: 'behavioral',
      difficulty: 'medium',
      question: 'Tell me about a time when you had to meet a tight deadline.',
      suggestedAnswer: 'Use STAR: Situation (tight deadline context), Task (what needed to be done), Action (how you prioritized and executed), Result (successful delivery and lessons learned)',
      keyPoints: ['Time management', 'Prioritization', 'Results delivery'],
      tips: ['Quantify the timeline', 'Mention tools/methods used'],
      commonMistakes: ['Being too vague', 'Not mentioning the outcome']
    }
  ];
}

function generateFallbackTechnicalQuestions(jobContext: JobContext): InterviewQuestion[] {
  return [
    {
      id: crypto.randomUUID(),
      category: 'technical',
      difficulty: 'medium',
      question: `Explain ${jobContext.requiredSkills[0] || 'a key technology'} and when you would use it.`,
      suggestedAnswer: 'Define the technology, explain its core benefits, provide a real-world use case from your experience',
      keyPoints: ['Clear definition', 'Practical application', 'Trade-offs'],
      tips: ['Use simple language', 'Provide concrete examples'],
      commonMistakes: ['Too theoretical', 'Not showing hands-on experience']
    }
  ];
}
