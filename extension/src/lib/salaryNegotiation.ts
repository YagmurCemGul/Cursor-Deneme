/**
 * Salary Negotiation Helper
 * AI-powered salary research, negotiation strategies, and scripts
 */

import type { ResumeProfile, JobPost } from './types';
import { callOpenAI } from './ai';
import { analyzeJobPosting, type JobContext } from './jobAnalyzer';
import { getRecommendedModel } from './aiProviders';

export interface SalaryResearch {
  position: string;
  location: string;
  experienceLevel: string;
  salaryRange: {
    min: number;
    max: number;
    median: number;
    currency: string;
  };
  factors: {
    name: string;
    impact: 'high' | 'medium' | 'low';
    description: string;
  }[];
  marketTrends: string[];
  sources: string[];
}

export interface NegotiationStrategy {
  targetSalary: number;
  walkAwayPoint: number;
  idealPackage: {
    baseSalary: number;
    bonus: number;
    equity: string;
    benefits: string[];
  };
  negotiationPhases: NegotiationPhase[];
  scripts: NegotiationScript[];
  commonMistakes: string[];
  tips: string[];
}

export interface NegotiationPhase {
  phase: 'initial-offer' | 'counter-offer' | 'final-negotiation' | 'acceptance';
  timing: string;
  objectives: string[];
  tactics: string[];
  whatToSay: string[];
  whatNotToSay: string[];
}

export interface NegotiationScript {
  scenario: string;
  script: string;
  alternatives: string[];
  tone: 'confident' | 'collaborative' | 'firm' | 'flexible';
  keyPhrases: string[];
}

export interface CompensationPackage {
  baseSalary: number;
  signingBonus?: number;
  annualBonus?: number;
  equityValue?: number;
  totalComp: number;
  benefits: BenefitItem[];
  perks: string[];
}

export interface BenefitItem {
  name: string;
  estimatedValue: number;
  importance: 'high' | 'medium' | 'low';
}

/**
 * Research salary for a position
 */
export async function researchSalary(
  profile: ResumeProfile,
  job: JobPost,
  location: string
): Promise<SalaryResearch> {
  const jobContext = analyzeJobPosting(job.pastedText, job.title);
  const yearsOfExperience = calculateYearsOfExperience(profile);
  
  const systemPrompt = `You are a compensation expert. Provide realistic salary research based on market data.`;

  const userPrompt = `
POSITION: ${job.title || jobContext.jobTitle}
LOCATION: ${location}
EXPERIENCE LEVEL: ${jobContext.experienceLevel} (${yearsOfExperience} years)
REQUIRED SKILLS: ${jobContext.requiredSkills.slice(0, 5).join(', ')}
COMPANY SIZE: ${jobContext.companySize}

Provide salary research with:
1. Salary range (min, max, median) in USD
2. 5 factors affecting salary (with high/medium/low impact)
3. 3 current market trends
4. Key data sources

Format as JSON: { salaryRange: {min, max, median}, factors: [{name, impact, description}], marketTrends: [], sources: [] }`;

  const model = getRecommendedModel('quick-qa');
  const response = await callOpenAI(systemPrompt, userPrompt, { temperature: 0.5, model });
  
  try {
    const data = JSON.parse(response);
    return {
      position: job.title || jobContext.jobTitle,
      location,
      experienceLevel: jobContext.experienceLevel,
      salaryRange: {
        ...data.salaryRange,
        currency: 'USD'
      },
      factors: data.factors || [],
      marketTrends: data.marketTrends || [],
      sources: data.sources || ['Glassdoor', 'LinkedIn Salary', 'Levels.fyi', 'Payscale']
    };
  } catch (error) {
    // Fallback with estimates
    return generateFallbackSalaryResearch(job.title || jobContext.jobTitle, jobContext, yearsOfExperience);
  }
}

/**
 * Generate negotiation strategy
 */
export async function generateNegotiationStrategy(
  profile: ResumeProfile,
  job: JobPost,
  salaryResearch: SalaryResearch,
  currentSalary?: number
): Promise<NegotiationStrategy> {
  const jobContext = analyzeJobPosting(job.pastedText, job.title);
  
  // Calculate target salary (aim for 75th percentile)
  const targetSalary = Math.round(salaryResearch.salaryRange.median * 1.15);
  const walkAwayPoint = currentSalary 
    ? Math.round(currentSalary * 1.10) 
    : Math.round(salaryResearch.salaryRange.min * 1.05);

  const systemPrompt = `You are an expert salary negotiation coach. Create a comprehensive negotiation strategy.`;

  const userPrompt = `
CANDIDATE PROFILE:
- Experience: ${calculateYearsOfExperience(profile)} years
- Current Salary: ${currentSalary ? `$${currentSalary}` : 'Not disclosed'}
- Skills: ${profile.skills.slice(0, 5).join(', ')}

JOB DETAILS:
- Title: ${job.title || jobContext.jobTitle}
- Level: ${jobContext.experienceLevel}
- Company: ${job.company || 'Not specified'}

SALARY RESEARCH:
- Market Range: $${salaryResearch.salaryRange.min} - $${salaryResearch.salaryRange.max}
- Target: $${targetSalary}
- Walk-away: $${walkAwayPoint}

Generate a negotiation strategy including:
1. Ideal compensation package (base, bonus %, equity, benefits)
2. 4 negotiation phases with tactics
3. 5 scenario-specific scripts
4. Common mistakes to avoid
5. Negotiation tips

Format as JSON with detailed responses.`;

  const model = getRecommendedModel('resume');
  const response = await callOpenAI(systemPrompt, userPrompt, { temperature: 0.7, model });
  
  try {
    const data = JSON.parse(response);
    return {
      targetSalary,
      walkAwayPoint,
      idealPackage: data.idealPackage || generateIdealPackage(targetSalary),
      negotiationPhases: data.negotiationPhases || generateNegotiationPhases(),
      scripts: data.scripts || generateNegotiationScripts(targetSalary, job.company),
      commonMistakes: data.commonMistakes || getCommonMistakes(),
      tips: data.tips || getNegotiationTips()
    };
  } catch (error) {
    return {
      targetSalary,
      walkAwayPoint,
      idealPackage: generateIdealPackage(targetSalary),
      negotiationPhases: generateNegotiationPhases(),
      scripts: generateNegotiationScripts(targetSalary, job.company),
      commonMistakes: getCommonMistakes(),
      tips: getNegotiationTips()
    };
  }
}

/**
 * Generate negotiation email
 */
export async function generateNegotiationEmail(
  scenario: 'counter-offer' | 'request-more-time' | 'multiple-offers' | 'thank-you',
  context: {
    currentOffer?: number;
    targetSalary?: number;
    companyName?: string;
    recruiterName?: string;
    otherOffers?: number;
  }
): Promise<string> {
  const systemPrompt = `You are a professional career coach writing negotiation emails. Be polite, confident, and data-driven.`;

  let userPrompt = '';
  
  switch (scenario) {
    case 'counter-offer':
      userPrompt = `Write a professional email countering a salary offer.
Current offer: $${context.currentOffer}
Target salary: $${context.targetSalary}
Company: ${context.companyName}
Recruiter: ${context.recruiterName || 'Hiring Manager'}

Include:
1. Express enthusiasm for the role
2. Thank them for the offer
3. Present counter-offer with market research justification
4. Remain open to discussion
5. Professional, confident tone`;
      break;
      
    case 'request-more-time':
      userPrompt = `Write a professional email requesting more time to consider an offer.
Company: ${context.companyName}
Recruiter: ${context.recruiterName || 'Hiring Manager'}

Include:
1. Thank them for the offer
2. Express continued interest
3. Request 3-5 more business days
4. Provide brief reason (considering other aspects)
5. Grateful, professional tone`;
      break;
      
    case 'multiple-offers':
      userPrompt = `Write a professional email leveraging multiple offers without revealing specifics.
Company: ${context.companyName}
Your target: $${context.targetSalary}

Include:
1. Express strong interest in their company
2. Mention you're considering other opportunities (don't name them)
3. Ask if there's flexibility in the offer
4. Remain respectful and professional
5. Show you're making a thoughtful decision`;
      break;
      
    case 'thank-you':
      userPrompt = `Write a thank-you email after successful negotiation.
Company: ${context.companyName}
Recruiter: ${context.recruiterName}

Include:
1. Express gratitude for the offer and negotiation
2. Confirm acceptance
3. Express excitement to start
4. Ask about next steps
5. Warm, professional tone`;
      break;
  }

  const model = getRecommendedModel('cover-letter');
  const email = await callOpenAI(systemPrompt, userPrompt, { temperature: 0.7, model });
  
  return email.trim();
}

/**
 * Analyze compensation package
 */
export function analyzeCompensationPackage(
  baseSalary: number,
  bonus?: number,
  equity?: string,
  benefits?: string[]
): CompensationPackage {
  const annualBonus = bonus || Math.round(baseSalary * 0.10); // Assume 10% if not specified
  const equityValue = equity ? estimateEquityValue(equity, baseSalary) : 0;
  
  const benefitItems: BenefitItem[] = [
    { name: 'Health Insurance', estimatedValue: 8000, importance: 'high' },
    { name: '401k Match', estimatedValue: Math.round(baseSalary * 0.04), importance: 'high' },
    { name: 'PTO (3 weeks)', estimatedValue: Math.round(baseSalary / 52 * 3), importance: 'high' },
    { name: 'Professional Development', estimatedValue: 2000, importance: 'medium' },
    { name: 'Remote Work', estimatedValue: 5000, importance: 'medium' }
  ];

  const totalBenefitsValue = benefitItems.reduce((sum, b) => sum + b.estimatedValue, 0);
  const totalComp = baseSalary + annualBonus + equityValue + totalBenefitsValue;

  return {
    baseSalary,
    annualBonus,
    equityValue,
    totalComp,
    benefits: benefitItems,
    perks: benefits || []
  };
}

/**
 * Compare two offers
 */
export function compareOffers(
  offer1: CompensationPackage,
  offer2: CompensationPackage,
  preferences: { [key: string]: number } = {}
): {
  winner: 1 | 2 | 'tie';
  breakdown: { category: string; offer1: number; offer2: number; diff: number }[];
  recommendation: string;
} {
  const breakdown = [
    {
      category: 'Base Salary',
      offer1: offer1.baseSalary,
      offer2: offer2.baseSalary,
      diff: offer1.baseSalary - offer2.baseSalary
    },
    {
      category: 'Total Compensation',
      offer1: offer1.totalComp,
      offer2: offer2.totalComp,
      diff: offer1.totalComp - offer2.totalComp
    }
  ];

  const winner = offer1.totalComp > offer2.totalComp ? 1 : 
                 offer2.totalComp > offer1.totalComp ? 2 : 'tie' as const;

  const recommendation = winner === 1 
    ? `Offer 1 provides ${((offer1.totalComp / offer2.totalComp - 1) * 100).toFixed(1)}% higher total compensation`
    : winner === 2
    ? `Offer 2 provides ${((offer2.totalComp / offer1.totalComp - 1) * 100).toFixed(1)}% higher total compensation`
    : 'Both offers are financially equivalent. Consider non-monetary factors.';

  return { winner, breakdown, recommendation };
}

// Helper functions

function calculateYearsOfExperience(profile: ResumeProfile): number {
  if (!profile.experience || profile.experience.length === 0) return 0;
  
  const totalMonths = profile.experience.reduce((sum, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.isCurrent ? new Date() : new Date(exp.endDate || Date.now());
    const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return sum + months;
  }, 0);
  
  return Math.round(totalMonths / 12);
}

function generateFallbackSalaryResearch(
  title: string,
  jobContext: JobContext,
  years: number
): SalaryResearch {
  // Rough estimates based on experience level
  const baseByLevel = {
    entry: 60000,
    mid: 90000,
    senior: 130000,
    lead: 160000,
    executive: 200000
  };
  
  const base = baseByLevel[jobContext.experienceLevel as keyof typeof baseByLevel] || 80000;
  
  return {
    position: title,
    location: 'United States',
    experienceLevel: jobContext.experienceLevel,
    salaryRange: {
      min: Math.round(base * 0.85),
      max: Math.round(base * 1.35),
      median: base,
      currency: 'USD'
    },
    factors: [
      { name: 'Years of Experience', impact: 'high', description: `${years} years in field` },
      { name: 'Skills Match', impact: 'high', description: 'Relevant technical skills' },
      { name: 'Location', impact: 'high', description: 'Geographic market rate' },
      { name: 'Company Size', impact: 'medium', description: jobContext.companySize },
      { name: 'Industry', impact: 'medium', description: 'Sector-specific compensation' }
    ],
    marketTrends: [
      'Remote work increasing compensation flexibility',
      'High demand for technical skills',
      'Equity becoming more common in compensation packages'
    ],
    sources: ['Glassdoor', 'LinkedIn Salary', 'Levels.fyi', 'Payscale', 'Built In']
  };
}

function generateIdealPackage(targetSalary: number): NegotiationStrategy['idealPackage'] {
  return {
    baseSalary: targetSalary,
    bonus: Math.round(targetSalary * 0.15),
    equity: '0.1-0.5% (if startup) or RSUs (if public)',
    benefits: [
      'Health, dental, vision insurance',
      '401k matching (4-6%)',
      'Flexible PTO or 4+ weeks',
      'Remote work flexibility',
      'Professional development budget ($2-5k/year)',
      'Home office stipend',
      'Wellness benefits'
    ]
  };
}

function generateNegotiationPhases(): NegotiationPhase[] {
  return [
    {
      phase: 'initial-offer',
      timing: 'When you receive the first offer',
      objectives: [
        'Show enthusiasm for the role',
        'Request time to review (24-48 hours)',
        'Avoid accepting immediately'
      ],
      tactics: [
        'Thank them for the offer',
        'Ask for the full package details in writing',
        'Request time to review thoroughly'
      ],
      whatToSay: [
        '"Thank you so much for this offer. I\'m very excited about the opportunity."',
        '"Could I have 24-48 hours to review the full details?"',
        '"I\'d like to ensure I fully understand the complete compensation package."'
      ],
      whatNotToSay: [
        '"I accept!" (too eager)',
        '"That seems low." (too negative)',
        '"My friend makes more." (irrelevant comparison)'
      ]
    },
    {
      phase: 'counter-offer',
      timing: 'After researching and deciding to negotiate',
      objectives: [
        'Present data-backed counter-offer',
        'Show value you bring',
        'Maintain positive relationship'
      ],
      tactics: [
        'Lead with market research',
        'Emphasize your unique value',
        'Be specific about your target'
      ],
      whatToSay: [
        '"Based on market research for similar roles, I was expecting..."',
        '"Given my X years of experience and skills in Y, I believe..."',
        '"Would there be flexibility to adjust the base salary to $X?"'
      ],
      whatNotToSay: [
        '"I deserve more." (entitled)',
        '"Take it or leave it." (ultimatum)',
        '"Everyone else pays more." (unsubstantiated)'
      ]
    }
  ];
}

function generateNegotiationScripts(targetSalary: number, company?: string): NegotiationScript[] {
  return [
    {
      scenario: 'Initial Counter-Offer',
      script: `Thank you for the offer. I'm genuinely excited about joining${company ? ` ${company}` : ' the team'}. After reviewing the compensation and researching market rates for this role, I was hoping we could discuss the base salary. Based on my ${'\${years}'} years of experience and the market data I've reviewed, I believe a salary of $${targetSalary} would be more aligned with the value I'll bring. Is there flexibility here?`,
      alternatives: [
        'Express enthusiasm, cite research, propose number',
        'Show value proposition, reference market data',
        'Collaborative tone: "Can we work together to..."'
      ],
      tone: 'collaborative',
      keyPhrases: [
        'I\'m excited about...',
        'Based on market research...',
        'The value I\'ll bring...',
        'Is there flexibility?'
      ]
    },
    {
      scenario: 'Negotiating Benefits',
      script: `I appreciate the salary offer. Could we explore other aspects of the compensation package? I'm particularly interested in [signing bonus/additional PTO/remote work flexibility/professional development budget]. Would there be room to enhance the package in these areas?`,
      alternatives: [
        'Focus on non-salary benefits',
        'Package multiple requests',
        'Show flexibility on different components'
      ],
      tone: 'flexible',
      keyPhrases: [
        'Other aspects of compensation...',
        'I\'m particularly interested in...',
        'Room to enhance...',
        'Flexibility in...'
      ]
    }
  ];
}

function getCommonMistakes(): string[] {
  return [
    '❌ Accepting the first offer without negotiation',
    '❌ Revealing your current salary too early',
    '❌ Making demands without justification',
    '❌ Comparing to friends/coworkers',
    '❌ Negotiating via text/email only (call is better)',
    '❌ Being aggressive or entitled',
    '❌ Not researching market rates',
    '❌ Forgetting about the total compensation package',
    '❌ Giving ultimatums',
    '❌ Not considering long-term growth potential'
  ];
}

function getNegotiationTips(): string[] {
  return [
    '✅ Always negotiate - most offers have 10-20% flexibility',
    '✅ Let them make the first offer',
    '✅ Research thoroughly before negotiating',
    '✅ Consider the entire package, not just base salary',
    '✅ Be specific with your counter-offer',
    '✅ Use collaborative language: "we", "together"',
    '✅ Have a walk-away number in mind',
    '✅ Practice your negotiation conversation',
    '✅ Get everything in writing',
    '✅ Stay positive and professional throughout'
  ];
}

function estimateEquityValue(equity: string, baseSalary: number): number {
  // Rough estimate: assume 4-year vesting, company grows 2x
  const percentMatch = equity.match(/([\d.]+)%/);
  if (percentMatch) {
    const percent = parseFloat(percentMatch[1]);
    // Very rough estimate: assume company value = 100x annual comp
    return Math.round(percent / 100 * baseSalary * 100 * 2 / 4);
  }
  return 0;
}
