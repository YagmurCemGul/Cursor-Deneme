/**
 * Job Posting Analyzer
 * Extracts and analyzes key information from job descriptions
 */

export interface JobContext {
  // Skills Analysis
  requiredSkills: string[];
  preferredSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  
  // Experience Requirements
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  yearsRequired: { min: number; max: number | null };
  
  // Company Information
  companySize: 'startup' | 'scaleup' | 'enterprise' | 'unknown';
  companyCulture: string[];
  workStyle: 'remote' | 'hybrid' | 'onsite' | 'flexible' | 'unknown';
  
  // Keywords & Phrases
  mustHaveKeywords: string[];
  importantPhrases: string[];
  industryTerms: string[];
  
  // Job Details
  jobTitle: string;
  department: string;
  responsibilities: string[];
  qualifications: string[];
  
  // Scoring Weights
  skillMatchWeight: number;
  experienceWeight: number;
  educationWeight: number;
  keywordWeight: number;
}

export interface SkillMatch {
  skill: string;
  userHasIt: boolean;
  importance: 'required' | 'preferred' | 'nice-to-have';
  category: 'technical' | 'soft' | 'domain';
  matchScore: number;
}

export interface JobAnalysisResult {
  context: JobContext;
  skillMatches: SkillMatch[];
  overallMatchScore: number;
  missingSkills: string[];
  strongMatches: string[];
  suggestions: string[];
}

/**
 * Common technical skills database
 */
const TECHNICAL_SKILLS = [
  // Frontend
  'React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'SASS', 'LESS',
  'Webpack', 'Vite', 'Next.js', 'Nuxt.js', 'Redux', 'MobX', 'Tailwind', 'Bootstrap',
  
  // Backend
  'Node.js', 'Python', 'Java', 'Go', 'Rust', 'C#', 'PHP', 'Ruby', 'Scala', 'Kotlin',
  'Django', 'Flask', 'FastAPI', 'Express', 'Spring Boot', 'Laravel', 'Rails',
  
  // Database
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB', 'Cassandra',
  'SQL', 'NoSQL', 'GraphQL', 'Prisma', 'TypeORM', 'Sequelize',
  
  // Cloud & DevOps
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins',
  'GitLab CI', 'GitHub Actions', 'CircleCI', 'ArgoCD', 'Helm',
  
  // Data & AI
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Jupyter', 'Spark',
  'Airflow', 'Kafka', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
  
  // Mobile
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android',
  
  // Tools & Others
  'Git', 'JIRA', 'Confluence', 'Figma', 'Postman', 'Swagger', 'REST API', 'Microservices',
  'Agile', 'Scrum', 'CI/CD', 'TDD', 'Unit Testing', 'Integration Testing'
];

const SOFT_SKILLS = [
  'Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Critical Thinking',
  'Time Management', 'Adaptability', 'Creativity', 'Collaboration', 'Project Management',
  'Stakeholder Management', 'Mentoring', 'Coaching', 'Decision Making', 'Strategic Thinking',
  'Analytical Skills', 'Attention to Detail', 'Self-Motivated', 'Proactive', 'Organized'
];

const EXPERIENCE_KEYWORDS = {
  entry: ['entry level', 'junior', '0-2 years', 'graduate', 'associate', 'recent graduate'],
  mid: ['mid level', 'intermediate', '2-5 years', '3-5 years', 'experienced'],
  senior: ['senior', '5+ years', '5-8 years', '7+ years', 'expert', 'advanced'],
  lead: ['lead', 'principal', 'staff', '8+ years', '10+ years', 'tech lead', 'team lead'],
  executive: ['executive', 'director', 'vp', 'head of', 'chief', 'c-level']
};

const COMPANY_SIZE_KEYWORDS = {
  startup: ['startup', 'early stage', 'seed', 'series a', 'small team', '< 50 employees'],
  scaleup: ['scale-up', 'growing', 'series b', 'series c', '50-500 employees', 'scaling'],
  enterprise: ['enterprise', 'fortune 500', 'large company', '500+ employees', 'established', 'multinational']
};

const WORK_STYLE_KEYWORDS = {
  remote: ['remote', 'work from home', 'wfh', 'fully remote', '100% remote', 'distributed'],
  hybrid: ['hybrid', 'flexible', 'remote-friendly', 'office optional', 'partial remote'],
  onsite: ['onsite', 'on-site', 'in-office', 'office-based', 'local'],
  flexible: ['flexible', 'your choice', 'flexible location', 'location independent']
};

/**
 * Analyze a job posting and extract context
 */
export function analyzeJobPosting(jobText: string, jobTitle?: string): JobContext {
  const lowerText = jobText.toLowerCase();
  
  // Extract skills
  const technicalSkills = extractSkills(jobText, TECHNICAL_SKILLS);
  const softSkills = extractSkills(jobText, SOFT_SKILLS);
  
  // Categorize skills by importance
  const { required, preferred } = categorizeSkillsByImportance(jobText, [...technicalSkills, ...softSkills]);
  
  // Extract experience level
  const experienceLevel = extractExperienceLevel(lowerText);
  const yearsRequired = extractYearsOfExperience(lowerText);
  
  // Extract company information
  const companySize = extractCompanySize(lowerText);
  const companyCulture = extractCompanyCulture(jobText);
  const workStyle = extractWorkStyle(lowerText);
  
  // Extract keywords and phrases
  const mustHaveKeywords = extractMustHaveKeywords(jobText);
  const importantPhrases = extractImportantPhrases(jobText);
  const industryTerms = extractIndustryTerms(jobText);
  
  // Extract job details
  const responsibilities = extractResponsibilities(jobText);
  const qualifications = extractQualifications(jobText);
  
  // Determine scoring weights based on job posting
  const skillMatchWeight = calculateSkillWeight(jobText);
  const experienceWeight = calculateExperienceWeight(jobText);
  const educationWeight = calculateEducationWeight(jobText);
  const keywordWeight = 0.2;
  
  return {
    requiredSkills: required,
    preferredSkills: preferred,
    technicalSkills,
    softSkills,
    experienceLevel,
    yearsRequired,
    companySize,
    companyCulture,
    workStyle,
    mustHaveKeywords,
    importantPhrases,
    industryTerms,
    jobTitle: jobTitle || extractJobTitle(jobText),
    department: extractDepartment(jobText),
    responsibilities,
    qualifications,
    skillMatchWeight,
    experienceWeight,
    educationWeight,
    keywordWeight
  };
}

/**
 * Extract skills from text
 */
function extractSkills(text: string, skillList: string[]): string[] {
  const foundSkills = new Set<string>();
  const lowerText = text.toLowerCase();
  
  skillList.forEach(skill => {
    const skillLower = skill.toLowerCase();
    // Check for exact match or word boundary match
    const regex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      foundSkills.add(skill);
    }
  });
  
  return Array.from(foundSkills);
}

/**
 * Categorize skills by importance (required vs preferred)
 */
function categorizeSkillsByImportance(text: string, skills: string[]): { required: string[]; preferred: string[] } {
  const required: string[] = [];
  const preferred: string[] = [];
  
  const lines = text.split('\n');
  let inRequiredSection = false;
  let inPreferredSection = false;
  
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    
    // Detect sections
    if (lowerLine.includes('required') || lowerLine.includes('must have') || lowerLine.includes('minimum qualifications')) {
      inRequiredSection = true;
      inPreferredSection = false;
    } else if (lowerLine.includes('preferred') || lowerLine.includes('nice to have') || lowerLine.includes('bonus')) {
      inPreferredSection = true;
      inRequiredSection = false;
    } else if (lowerLine.match(/^[a-z\s]+:$/)) {
      // Reset on new section
      inRequiredSection = false;
      inPreferredSection = false;
    }
    
    // Check for skills in current line
    skills.forEach(skill => {
      const skillLower = skill.toLowerCase();
      if (lowerLine.includes(skillLower)) {
        if (inRequiredSection) {
          if (!required.includes(skill)) required.push(skill);
        } else if (inPreferredSection) {
          if (!preferred.includes(skill)) preferred.push(skill);
        } else {
          // If no section detected, assume required if mentioned with strong keywords
          if (lowerLine.includes('required') || lowerLine.includes('must') || lowerLine.includes('essential')) {
            if (!required.includes(skill)) required.push(skill);
          } else {
            if (!preferred.includes(skill)) preferred.push(skill);
          }
        }
      }
    });
  });
  
  return { required, preferred };
}

/**
 * Extract experience level
 */
function extractExperienceLevel(text: string): 'entry' | 'mid' | 'senior' | 'lead' | 'executive' {
  for (const [level, keywords] of Object.entries(EXPERIENCE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return level as any;
      }
    }
  }
  return 'mid'; // Default
}

/**
 * Extract years of experience required
 */
function extractYearsOfExperience(text: string): { min: number; max: number | null } {
  // Match patterns like "5+ years", "3-5 years", "minimum 2 years"
  const patterns = [
    /(\d+)\+\s*years?/i,
    /(\d+)\s*-\s*(\d+)\s*years?/i,
    /minimum\s*(\d+)\s*years?/i,
    /at least\s*(\d+)\s*years?/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2]) {
        return { min: parseInt(match[1]), max: parseInt(match[2]) };
      } else {
        return { min: parseInt(match[1]), max: null };
      }
    }
  }
  
  return { min: 0, max: null };
}

/**
 * Extract company size
 */
function extractCompanySize(text: string): 'startup' | 'scaleup' | 'enterprise' | 'unknown' {
  for (const [size, keywords] of Object.entries(COMPANY_SIZE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return size as any;
      }
    }
  }
  return 'unknown';
}

/**
 * Extract company culture keywords
 */
function extractCompanyCulture(text: string): string[] {
  const cultureKeywords = [
    'fast-paced', 'collaborative', 'innovative', 'agile', 'flexible',
    'entrepreneurial', 'data-driven', 'customer-focused', 'diverse',
    'inclusive', 'transparent', 'autonomous', 'growth-oriented',
    'mission-driven', 'impact-focused', 'work-life balance'
  ];
  
  return extractSkills(text, cultureKeywords);
}

/**
 * Extract work style
 */
function extractWorkStyle(text: string): 'remote' | 'hybrid' | 'onsite' | 'flexible' | 'unknown' {
  for (const [style, keywords] of Object.entries(WORK_STYLE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return style as any;
      }
    }
  }
  return 'unknown';
}

/**
 * Extract must-have keywords (bolded, capitalized, or emphasized)
 */
function extractMustHaveKeywords(text: string): string[] {
  const keywords = new Set<string>();
  
  // Find text in ALL CAPS (likely important)
  const capsMatches = text.match(/\b[A-Z]{2,}\b/g);
  if (capsMatches) {
    capsMatches.forEach(match => {
      if (match.length >= 2 && match.length <= 20) {
        keywords.add(match);
      }
    });
  }
  
  // Find "MUST have X" or "REQUIRED: X"
  const mustPattern = /(?:must|required|essential|mandatory)[\s:]+([a-z\s,]+?)(?:\.|;|$)/gi;
  let match;
  while ((match = mustPattern.exec(text)) !== null) {
    const items = match[1].split(/,|and/).map(s => s.trim()).filter(s => s.length > 0);
    items.forEach(item => keywords.add(item));
  }
  
  return Array.from(keywords).slice(0, 15); // Limit to 15 keywords
}

/**
 * Extract important phrases from job posting
 */
function extractImportantPhrases(text: string): string[] {
  const phrases: string[] = [];
  
  // Common important phrase patterns
  const patterns = [
    /experience (?:with|in) ([^,.;]+)/gi,
    /strong (?:knowledge|understanding) of ([^,.;]+)/gi,
    /proven track record (?:in|of) ([^,.;]+)/gi,
    /ability to ([^,.;]+)/gi
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const phrase = match[1].trim();
      if (phrase.length > 5 && phrase.length < 100) {
        phrases.push(phrase);
      }
    }
  });
  
  return phrases.slice(0, 10);
}

/**
 * Extract industry-specific terms
 */
function extractIndustryTerms(text: string): string[] {
  const industryTerms = [
    'SaaS', 'B2B', 'B2C', 'API', 'SDK', 'Fintech', 'Edtech', 'Healthtech',
    'E-commerce', 'Marketplace', 'Platform', 'Infrastructure', 'HIPAA', 'GDPR',
    'SOC 2', 'ISO', 'Compliance', 'Security', 'Scalability', 'Performance'
  ];
  
  return extractSkills(text, industryTerms);
}

/**
 * Extract responsibilities from job posting
 */
function extractResponsibilities(text: string): string[] {
  const responsibilities: string[] = [];
  const lines = text.split('\n');
  let inResponsibilitiesSection = false;
  
  lines.forEach(line => {
    const trimmed = line.trim();
    const lowerLine = trimmed.toLowerCase();
    
    if (lowerLine.includes('responsibilities') || lowerLine.includes('what you\'ll do') || lowerLine.includes('your role')) {
      inResponsibilitiesSection = true;
      return;
    }
    
    if (lowerLine.match(/^(requirements|qualifications|what we|about you):/)) {
      inResponsibilitiesSection = false;
      return;
    }
    
    if (inResponsibilitiesSection && (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed))) {
      const resp = trimmed.replace(/^[•\-*\d.]\s*/, '').trim();
      if (resp.length > 10) {
        responsibilities.push(resp);
      }
    }
  });
  
  return responsibilities.slice(0, 10);
}

/**
 * Extract qualifications from job posting
 */
function extractQualifications(text: string): string[] {
  const qualifications: string[] = [];
  const lines = text.split('\n');
  let inQualificationsSection = false;
  
  lines.forEach(line => {
    const trimmed = line.trim();
    const lowerLine = trimmed.toLowerCase();
    
    if (lowerLine.includes('qualifications') || lowerLine.includes('requirements') || lowerLine.includes('what we\'re looking for')) {
      inQualificationsSection = true;
      return;
    }
    
    if (lowerLine.match(/^(responsibilities|benefits|about us|what you'll do):/)) {
      inQualificationsSection = false;
      return;
    }
    
    if (inQualificationsSection && (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed))) {
      const qual = trimmed.replace(/^[•\-*\d.]\s*/, '').trim();
      if (qual.length > 10) {
        qualifications.push(qual);
      }
    }
  });
  
  return qualifications.slice(0, 10);
}

/**
 * Extract job title from text
 */
function extractJobTitle(text: string): string {
  // Try to find title in first few lines
  const lines = text.split('\n').slice(0, 5);
  for (const line of lines) {
    if (line.trim().length > 5 && line.trim().length < 100 && !line.toLowerCase().includes('about') && !line.toLowerCase().includes('company')) {
      return line.trim();
    }
  }
  return 'Position';
}

/**
 * Extract department
 */
function extractDepartment(text: string): string {
  const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations', 'Data', 'Finance', 'HR'];
  const lowerText = text.toLowerCase();
  
  for (const dept of departments) {
    if (lowerText.includes(dept.toLowerCase())) {
      return dept;
    }
  }
  
  return 'General';
}

/**
 * Calculate skill match weight
 */
function calculateSkillWeight(text: string): number {
  const lowerText = text.toLowerCase();
  
  // If job emphasizes skills heavily
  if (lowerText.includes('technical skills') || lowerText.includes('must have') || lowerText.match(/skills?:/)) {
    return 0.4;
  }
  
  return 0.3;
}

/**
 * Calculate experience weight
 */
function calculateExperienceWeight(text: string): number {
  const lowerText = text.toLowerCase();
  
  // If job emphasizes experience
  if (lowerText.includes('years of experience') || lowerText.includes('proven track record')) {
    return 0.35;
  }
  
  return 0.25;
}

/**
 * Calculate education weight
 */
function calculateEducationWeight(text: string): number {
  const lowerText = text.toLowerCase();
  
  // If job emphasizes education
  if (lowerText.includes('degree required') || lowerText.includes('bachelor') || lowerText.includes('master')) {
    return 0.25;
  }
  
  return 0.15;
}
