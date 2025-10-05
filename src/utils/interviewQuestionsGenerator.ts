import { CVData } from '../types';
import { logger } from './logger';

/**
 * Interview Questions Generator
 * 
 * Currently uses a rule-based approach to generate relevant interview questions
 * based on CV content. This provides immediate value without requiring AI API calls.
 * 
 * Future Enhancement: Can be upgraded to use AI for more personalized questions
 * once the aiService.generateText() method is implemented.
 */

export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  relevance: number; // 0-100
  basedOn: string; // What part of CV this is based on
}

export interface InterviewQuestionsResult {
  questions: InterviewQuestion[];
  totalQuestions: number;
  categories: string[];
}

/**
 * Generate practical interview questions based on CV content
 * 
 * This function analyzes the CV data and generates relevant interview questions
 * based on skills, experience, and education. The questions are categorized and
 * rated by difficulty and relevance.
 * 
 * @param cvData - The CV data to analyze
 * @param _jobDescription - Optional job description for context (reserved for future AI enhancement)
 * @param numberOfQuestions - Number of questions to generate (default: 15)
 * @returns Interview questions result with categorized questions
 */
export async function generateInterviewQuestions(
  cvData: CVData,
  _jobDescription?: string,
  numberOfQuestions: number = 15
): Promise<InterviewQuestionsResult> {
  try {
    return generateFallbackQuestions(cvData, numberOfQuestions);
  } catch (error) {
    logger.error('Error generating interview questions:', error);
    // Return default questions on error
    return generateFallbackQuestions(cvData, numberOfQuestions);
  }
}

/**
 * Build context string from CV data
 * Reserved for future AI-powered question generation
 * @internal
 */
function buildCVContext(cvData: CVData): string {
  const parts: string[] = [];
  
  // Personal info
  const fullName = `${cvData.personalInfo?.firstName || ''} ${cvData.personalInfo?.middleName || ''} ${cvData.personalInfo?.lastName || ''}`.trim();
  if (fullName) {
    parts.push(`Name: ${fullName}`);
  }
  
  if (cvData.personalInfo?.summary) {
    parts.push(`\nProfessional Summary:\n${cvData.personalInfo.summary}`);
  }
  
  // Skills
  if (cvData.skills && cvData.skills.length > 0) {
    parts.push(`\nSkills:\n${cvData.skills.join(', ')}`);
  }
  
  // Experience
  if (cvData.experience && cvData.experience.length > 0) {
    parts.push('\nWork Experience:');
    cvData.experience.forEach((exp, index) => {
      parts.push(`\n${index + 1}. ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})`);
      if (exp.description) {
        parts.push(`   ${exp.description}`);
      }
    });
  }
  
  // Education
  if (cvData.education && cvData.education.length > 0) {
    parts.push('\nEducation:');
    cvData.education.forEach((edu, index) => {
      parts.push(`\n${index + 1}. ${edu.degree} in ${edu.fieldOfStudy} from ${edu.school} (${edu.endDate})`);
    });
  }
  
  // Projects
  if (cvData.projects && cvData.projects.length > 0) {
    parts.push('\nProjects:');
    cvData.projects.forEach((proj, index) => {
      parts.push(`\n${index + 1}. ${proj.name}`);
      if (proj.description) {
        parts.push(`   ${proj.description}`);
      }
      if (proj.skills && proj.skills.length > 0) {
        parts.push(`   Technologies: ${proj.skills.join(', ')}`);
      }
    });
  }
  
  return parts.join('\n');
}

/**
 * Parse questions from AI response
 * Reserved for future AI-powered question generation
 * @internal
 */
function parseQuestionsFromResponse(response: string): Omit<InterviewQuestion, 'id'>[] {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
    
    // If no JSON found, try to parse line by line
    return [];
  } catch (error) {
    logger.error('Error parsing questions:', error);
    return [];
  }
}

/**
 * Generate interview questions using rule-based approach
 * This provides immediate, relevant questions without requiring AI API calls
 */
function generateFallbackQuestions(
  cvData: CVData,
  numberOfQuestions: number
): InterviewQuestionsResult {
  const questions: InterviewQuestion[] = [];
  let questionId = 0;
  
  // Generate questions based on skills
  if (cvData.skills && cvData.skills.length > 0) {
    cvData.skills.slice(0, Math.min(5, cvData.skills.length)).forEach(skill => {
      questions.push({
        id: `q-fallback-${questionId++}`,
        category: 'Technical',
        question: `Can you describe a project where you used ${skill} and what challenges you faced?`,
        difficulty: 'Medium',
        relevance: 85,
        basedOn: `Skill: ${skill}`,
      });
    });
  }
  
  // Generate questions based on experience
  if (cvData.experience && cvData.experience.length > 0) {
    cvData.experience.slice(0, 2).forEach(exp => {
      questions.push({
        id: `q-fallback-${questionId++}`,
        category: 'Behavioral',
        question: `Tell me about your experience as ${exp.title} at ${exp.company}. What was your biggest achievement?`,
        difficulty: 'Medium',
        relevance: 90,
        basedOn: `Experience: ${exp.title}`,
      });
    });
  }
  
  // Add general questions
  const generalQuestions = [
    {
      category: 'Behavioral',
      question: 'Describe a situation where you had to work under pressure. How did you handle it?',
      difficulty: 'Medium' as const,
      relevance: 80,
      basedOn: 'General behavioral assessment',
    },
    {
      category: 'Situational',
      question: 'How do you approach learning new technologies or skills?',
      difficulty: 'Easy' as const,
      relevance: 75,
      basedOn: 'Professional development',
    },
    {
      category: 'Behavioral',
      question: 'Tell me about a time when you had to resolve a conflict in your team.',
      difficulty: 'Hard' as const,
      relevance: 85,
      basedOn: 'Team collaboration',
    },
  ];
  
  generalQuestions.forEach(q => {
    if (questions.length < numberOfQuestions) {
      questions.push({
        id: `q-fallback-${questionId++}`,
        ...q,
      });
    }
  });
  
  const categories = Array.from(new Set(questions.map(q => q.category)));
  
  return {
    questions: questions.slice(0, numberOfQuestions),
    totalQuestions: questions.length,
    categories,
  };
}

/**
 * Filter questions by category
 */
export function filterQuestionsByCategory(
  questions: InterviewQuestion[],
  category: string
): InterviewQuestion[] {
  return questions.filter(q => q.category === category);
}

/**
 * Filter questions by difficulty
 */
export function filterQuestionsByDifficulty(
  questions: InterviewQuestion[],
  difficulty: 'Easy' | 'Medium' | 'Hard'
): InterviewQuestion[] {
  return questions.filter(q => q.difficulty === difficulty);
}

/**
 * Sort questions by relevance
 */
export function sortQuestionsByRelevance(
  questions: InterviewQuestion[]
): InterviewQuestion[] {
  return [...questions].sort((a, b) => b.relevance - a.relevance);
}
