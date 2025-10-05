import { ResumeProfile, JobPost } from './types';
import { callOpenAI } from './ai';

export interface CoverLetterTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'formal' | 'modern' | 'creative' | 'technical';
  tone: 'professional' | 'enthusiastic' | 'confident' | 'friendly';
  useCase: string;
  systemPrompt: string;
}

export const COVER_LETTER_TEMPLATES: CoverLetterTemplate[] = [
  {
    id: 'professional-formal',
    name: 'Professional Formal',
    description: 'Traditional, corporate-style cover letter',
    icon: '💼',
    category: 'formal',
    tone: 'professional',
    useCase: 'Corporate roles, finance, legal, consulting',
    systemPrompt: 'Write a formal, professional cover letter. Use respectful language, traditional structure with 3-4 paragraphs. Focus on qualifications, experience match, and value proposition. Maintain professional tone throughout.'
  },
  {
    id: 'tech-modern',
    name: 'Tech Modern',
    description: 'Straightforward, results-focused for tech roles',
    icon: '💻',
    category: 'modern',
    tone: 'confident',
    useCase: 'Software engineering, data science, tech startups',
    systemPrompt: 'Write a modern, tech-focused cover letter. Be direct and results-oriented. Highlight technical skills, projects, and measurable achievements. Use clear, concise language. 3 paragraphs max.'
  },
  {
    id: 'enthusiastic-startup',
    name: 'Enthusiastic Startup',
    description: 'Energetic and passion-driven',
    icon: '🚀',
    category: 'modern',
    tone: 'enthusiastic',
    useCase: 'Startups, growth companies, innovative roles',
    systemPrompt: 'Write an enthusiastic, energetic cover letter for a startup. Show genuine excitement and passion. Emphasize adaptability, growth mindset, and alignment with company mission. 3 paragraphs.'
  },
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    description: 'Showcases creativity and unique perspective',
    icon: '🎨',
    category: 'creative',
    tone: 'friendly',
    useCase: 'Design, marketing, content creation, UX/UI',
    systemPrompt: 'Write a creative, engaging cover letter. Show personality and creative thinking. Reference portfolio work. Discuss design philosophy and collaborative approach. Friendly yet professional tone.'
  },
  {
    id: 'technical-expert',
    name: 'Technical Expert',
    description: 'Deep technical expertise and problem-solving',
    icon: '🔧',
    category: 'technical',
    tone: 'confident',
    useCase: 'Senior technical roles, architecture, DevOps',
    systemPrompt: 'Write a cover letter emphasizing deep technical expertise. Focus on complex problem-solving, system architecture, and technical achievements. Include specific technologies and methodologies. Professional, confident tone.'
  },
  {
    id: 'career-change',
    name: 'Career Transition',
    description: 'Highlights transferable skills for career changers',
    icon: '🔄',
    category: 'formal',
    tone: 'professional',
    useCase: 'Career change, industry switch, new field entry',
    systemPrompt: 'Write a cover letter for career transition. Emphasize transferable skills, motivation for change, and commitment to learning. Address why the change makes sense. Show enthusiasm and readiness.'
  },
  {
    id: 'executive-leadership',
    name: 'Executive Leadership',
    description: 'Strategic vision and leadership impact',
    icon: '👔',
    category: 'formal',
    tone: 'confident',
    useCase: 'C-level, VP, director positions',
    systemPrompt: 'Write an executive-level cover letter. Focus on strategic leadership, business impact, team building, and organizational transformation. Use data-driven examples. Confident, professional tone.'
  },
  {
    id: 'referral-based',
    name: 'Referral-Based',
    description: 'Leverages a mutual connection or referral',
    icon: '🤝',
    category: 'modern',
    tone: 'friendly',
    useCase: 'When you have a referral or mutual connection',
    systemPrompt: 'Write a cover letter mentioning a referral/mutual connection. Start by referencing the connection warmly. Discuss shared values and interests. Maintain friendly yet professional tone. 3 paragraphs.'
  }
];

export async function generateFromTemplate(
  template: CoverLetterTemplate,
  profile: ResumeProfile,
  job: JobPost,
  customization?: {
    companyName?: string;
    hiringManager?: string;
    referralName?: string;
    specificInterest?: string;
    language?: 'en' | 'tr';
  }
): Promise<string> {
  const company = customization?.companyName || job.company || '[Company Name]';
  const manager = customization?.hiringManager || (customization?.language === 'tr' ? 'İşe Alım Yöneticisi' : 'Hiring Manager');
  const role = job.title || (customization?.language === 'tr' ? 'bu pozisyon' : 'the position');
  const lang = customization?.language || 'en';
  
  const languageInstruction = lang === 'tr' 
    ? 'ÖNEMLI: Ön yazıyı TÜRKÇE dilinde yaz. Tüm metni Türkçe olarak oluştur.'
    : 'IMPORTANT: Write the cover letter in ENGLISH. Generate all text in English.';

  const userPrompt = `${languageInstruction}

Generate a cover letter with the following details:

JOB INFORMATION:
- Position: ${role}
- Company: ${company}
- Job Description: ${job.pastedText.substring(0, 500)}...

CANDIDATE PROFILE:
- Name: ${profile.personal.firstName} ${profile.personal.lastName}
- Email: ${profile.personal.email}
- Phone: ${profile.personal.phone || 'Not provided'}
- Current Role: ${profile.experience[0]?.title || 'Professional'}
- Current Company: ${profile.experience[0]?.company || 'N/A'}
- Key Skills: ${profile.skills.slice(0, 10).join(', ')}
- Years of Experience: ${profile.experience.length}+
- Education: ${profile.education[0]?.degree || 'N/A'} from ${profile.education[0]?.school || 'N/A'}

CUSTOMIZATION:
- Hiring Manager: ${manager}
${customization?.referralName ? `- Referral: ${customization.referralName}` : ''}
${customization?.specificInterest ? `- Specific Interest: ${customization.specificInterest}` : ''}

REQUIREMENTS:
1. Start with proper header (candidate address, date, company address)
2. Use "${manager}," as greeting ${lang === 'tr' ? '(Türkçe: "Sayın ' + manager + ',")' : ''}
3. Write 3-4 well-structured paragraphs following the template style
4. Include specific examples from the candidate's background
5. Close with "${lang === 'tr' ? 'Saygılarımla' : 'Sincerely'}," and candidate's full name
6. Keep it to one page (300-400 words)
7. Make it ATS-friendly with relevant keywords from job description
8. ALL TEXT MUST BE IN ${lang === 'tr' ? 'TURKISH (TÜRKÇE)' : 'ENGLISH'}

TONE: ${template.tone}
STYLE: ${template.description}
LANGUAGE: ${lang === 'tr' ? 'Turkish (Türkçe)' : 'English'}

Generate the complete cover letter in ${lang === 'tr' ? 'TURKISH' : 'ENGLISH'} now.`;

  try {
    const coverLetter = await callOpenAI(
      template.systemPrompt,
      userPrompt,
      { temperature: 0.7 }
    );
    
    return coverLetter.trim();
  } catch (error) {
    console.error('Cover letter generation error:', error);
    throw new Error('Failed to generate cover letter. Please check your API key and try again.');
  }
}

export function getTemplateRecommendation(
  jobDescription: string,
  profile: ResumeProfile
): CoverLetterTemplate {
  const lowerDesc = jobDescription.toLowerCase();
  
  // Check for startup keywords
  if (lowerDesc.match(/startup|fast-paced|growth|scale/)) {
    return COVER_LETTER_TEMPLATES.find(t => t.id === 'enthusiastic-startup')!;
  }
  
  // Check for creative roles
  if (lowerDesc.match(/design|creative|ui\/ux|marketing|brand/)) {
    return COVER_LETTER_TEMPLATES.find(t => t.id === 'creative-portfolio')!;
  }
  
  // Check for technical roles
  if (lowerDesc.match(/engineer|developer|devops|architect|technical/)) {
    const isSenior = lowerDesc.match(/senior|lead|principal|staff/);
    return COVER_LETTER_TEMPLATES.find(t => 
      isSenior ? t.id === 'technical-expert' : t.id === 'tech-modern'
    )!;
  }
  
  // Check for executive roles
  if (lowerDesc.match(/director|vp|chief|executive|ceo|cto/)) {
    return COVER_LETTER_TEMPLATES.find(t => t.id === 'executive-leadership')!;
  }
  
  // Default to professional formal
  return COVER_LETTER_TEMPLATES[0];
}
