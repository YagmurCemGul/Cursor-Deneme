/**
 * CV Processor Web Worker
 * Heavy CV processing in background thread
 * 
 * @module cvProcessor.worker
 * @description Handles CPU-intensive CV operations without blocking UI
 */

import { CVData, ATSOptimization } from '../types';

// Worker context
const ctx: Worker = self as any;

/**
 * Message types
 */
type WorkerMessage =
  | { type: 'PARSE_CV'; data: { file: ArrayBuffer; format: 'pdf' | 'docx' | 'txt' } }
  | { type: 'OPTIMIZE_LOCAL'; data: { cvData: CVData; keywords: string[] } }
  | { type: 'ANALYZE_ATS'; data: { cvData: CVData } }
  | { type: 'EXTRACT_TEXT'; data: { file: ArrayBuffer } }
  | { type: 'CALCULATE_SCORE'; data: { cvData: CVData; jobDescription: string } };

/**
 * Message handler
 */
ctx.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, data } = e.data;

  try {
    let result;

    switch (type) {
      case 'PARSE_CV':
        result = await parseCV(data.file, data.format);
        ctx.postMessage({ type: 'PARSE_CV_SUCCESS', data: result });
        break;

      case 'OPTIMIZE_LOCAL':
        result = await optimizeLocal(data.cvData, data.keywords);
        ctx.postMessage({ type: 'OPTIMIZE_LOCAL_SUCCESS', data: result });
        break;

      case 'ANALYZE_ATS':
        result = await analyzeATS(data.cvData);
        ctx.postMessage({ type: 'ANALYZE_ATS_SUCCESS', data: result });
        break;

      case 'EXTRACT_TEXT':
        result = await extractText(data.file);
        ctx.postMessage({ type: 'EXTRACT_TEXT_SUCCESS', data: result });
        break;

      case 'CALCULATE_SCORE':
        result = await calculateMatchScore(data.cvData, data.jobDescription);
        ctx.postMessage({ type: 'CALCULATE_SCORE_SUCCESS', data: result });
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error: any) {
    ctx.postMessage({
      type: 'ERROR',
      error: error.message,
      originalType: type
    });
  }
};

/**
 * Parse CV file
 */
async function parseCV(
  file: ArrayBuffer,
  format: 'pdf' | 'docx' | 'txt'
): Promise<CVData> {
  // Simulated CV parsing (in real app, use pdf-parse, mammoth, etc.)
  const text = await extractTextFromBuffer(file, format);
  
  return {
    personalInfo: extractPersonalInfo(text),
    experience: extractExperience(text),
    education: extractEducation(text),
    skills: extractSkills(text),
    certifications: [],
    projects: [],
    customSections: []
  };
}

/**
 * Local optimization without AI
 */
async function optimizeLocal(
  cvData: CVData,
  keywords: string[]
): Promise<ATSOptimization[]> {
  const optimizations: ATSOptimization[] = [];
  
  // Check for missing keywords
  const cvText = JSON.stringify(cvData).toLowerCase();
  const missingKeywords = keywords.filter(
    keyword => !cvText.includes(keyword.toLowerCase())
  );

  if (missingKeywords.length > 0) {
    optimizations.push({
      id: `opt-keywords-${Date.now()}`,
      category: 'Keywords',
      change: `Add missing keywords: ${missingKeywords.join(', ')}`,
      originalText: '',
      optimizedText: `Consider adding: ${missingKeywords.join(', ')}`,
      applied: false
    });
  }

  // Check for action verbs
  const weakVerbs = ['did', 'was', 'had', 'made'];
  const strongVerbs = ['achieved', 'implemented', 'led', 'developed'];
  
  const summary = cvData.personalInfo.summary?.toLowerCase() || '';
  const hasWeakVerbs = weakVerbs.some(verb => summary.includes(verb));
  
  if (hasWeakVerbs) {
    optimizations.push({
      id: `opt-verbs-${Date.now()}`,
      category: 'Action Verbs',
      change: 'Use stronger action verbs',
      originalText: cvData.personalInfo.summary || '',
      optimizedText: `Replace weak verbs with: ${strongVerbs.join(', ')}`,
      applied: false
    });
  }

  // Check for quantification
  const hasNumbers = /\d+/.test(cvText);
  if (!hasNumbers) {
    optimizations.push({
      id: `opt-quant-${Date.now()}`,
      category: 'Quantification',
      change: 'Add quantifiable achievements',
      originalText: '',
      optimizedText: 'Add numbers, percentages, and measurable results',
      applied: false
    });
  }

  return optimizations;
}

/**
 * Analyze ATS compatibility
 */
async function analyzeATS(cvData: CVData): Promise<{
  score: number;
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check for contact info
  if (!cvData.personalInfo.email) {
    issues.push('Missing email address');
    score -= 10;
  }
  if (!cvData.personalInfo.phone) {
    issues.push('Missing phone number');
    score -= 5;
  }

  // Check experience section
  if (cvData.experience.length === 0) {
    issues.push('No work experience listed');
    score -= 20;
  }

  // Check for dates
  const hasAllDates = cvData.experience.every(exp => exp.startDate);
  if (!hasAllDates) {
    issues.push('Some experience entries missing dates');
    score -= 10;
    recommendations.push('Add dates to all experience entries');
  }

  // Check skills section
  if (cvData.skills.length < 5) {
    issues.push('Limited skills listed');
    score -= 10;
    recommendations.push('Add more relevant skills (aim for 8-12)');
  }

  // Check for formatting issues
  if (cvData.customSections && cvData.customSections.length > 5) {
    issues.push('Too many custom sections may confuse ATS');
    score -= 5;
    recommendations.push('Consolidate into standard sections');
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations
  };
}

/**
 * Extract text from buffer
 */
async function extractTextFromBuffer(
  buffer: ArrayBuffer,
  format: 'pdf' | 'docx' | 'txt'
): Promise<string> {
  // Simplified extraction (in real app, use proper libraries)
  const decoder = new TextDecoder();
  const text = decoder.decode(buffer);
  
  // Basic text extraction
  return text
    .replace(/[^\x20-\x7E\n]/g, ' ') // Remove non-printable characters
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract personal info
 */
function extractPersonalInfo(text: string): any {
  // Simple regex-based extraction (improve with NLP)
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(/\+?\d{1,3}[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/);
  const nameMatch = text.split('\n')[0]; // Assume first line is name

  return {
    firstName: nameMatch?.split(' ')[0] || '',
    lastName: nameMatch?.split(' ').slice(1).join(' ') || '',
    email: emailMatch?.[0] || '',
    phone: phoneMatch?.[0] || '',
    summary: ''
  };
}

/**
 * Extract experience
 */
function extractExperience(text: string): any[] {
  // Simplified extraction
  const experienceSection = text.match(/experience.*?(?=education|skills|$)/is)?.[0] || '';
  
  // This is very basic - real implementation would use NLP
  return [{
    title: 'Position',
    company: 'Company',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: experienceSection.substring(0, 200)
  }];
}

/**
 * Extract education
 */
function extractEducation(text: string): any[] {
  const educationSection = text.match(/education.*?(?=experience|skills|$)/is)?.[0] || '';
  
  return [{
    degree: 'Degree',
    field: 'Field',
    institution: 'University',
    location: '',
    graduationDate: ''
  }];
}

/**
 * Extract skills
 */
function extractSkills(text: string): string[] {
  // Look for common skill keywords
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js',
    'SQL', 'AWS', 'Docker', 'Git', 'TypeScript'
  ];
  
  return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
}

/**
 * Extract text only
 */
async function extractText(file: ArrayBuffer): Promise<string> {
  return extractTextFromBuffer(file, 'txt');
}

/**
 * Calculate match score between CV and job description
 */
async function calculateMatchScore(
  cvData: CVData,
  jobDescription: string
): Promise<{ score: number; matches: string[]; missing: string[] }> {
  const cvText = JSON.stringify(cvData).toLowerCase();
  const jobText = jobDescription.toLowerCase();

  // Extract important keywords from job description
  const keywords = extractKeywords(jobText);
  
  // Calculate matches
  const matches = keywords.filter(keyword => 
    cvText.includes(keyword.toLowerCase())
  );
  
  const missing = keywords.filter(keyword => 
    !cvText.includes(keyword.toLowerCase())
  );

  const score = (matches.length / keywords.length) * 100;

  return {
    score: Math.round(score),
    matches,
    missing
  };
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  // Simple word frequency analysis
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);

  const frequency = new Map<string, number>();
  
  words.forEach(word => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });

  // Get top keywords
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

// Export worker
export {};
