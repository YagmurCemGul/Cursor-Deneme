import { CVData, ATSOptimization } from '../types';

export class AIService {
  constructor(_apiKey: string) {
    // Store API key for future use
  }

  async optimizeCV(cvData: CVData, _jobDescription: string): Promise<{ optimizedCV: CVData; optimizations: ATSOptimization[] }> {
    // In a real implementation, this would call OpenAI API
    // For now, we'll simulate the optimization

    // Mock optimizations for demonstration
    const mockOptimizations: ATSOptimization[] = [
      {
        id: '1',
        category: 'Keywords',
        change: 'Add relevant technical keywords from job description',
        originalText: cvData.personalInfo.summary,
        optimizedText: cvData.personalInfo.summary + ' with experience in React, TypeScript, and modern web development.',
        applied: false
      },
      {
        id: '2',
        category: 'Action Verbs',
        change: 'Replace passive language with action verbs',
        originalText: 'Responsible for developing applications',
        optimizedText: 'Developed and deployed scalable web applications',
        applied: false
      },
      {
        id: '3',
        category: 'Quantification',
        change: 'Add specific metrics and numbers',
        originalText: 'Improved system performance',
        optimizedText: 'Improved system performance by 40% through code optimization',
        applied: false
      }
    ];

    try {
      return {
        optimizedCV: cvData,
        optimizations: mockOptimizations
      };
    } catch (error) {
      console.error('Error optimizing CV:', error);
      throw error;
    }
  }

  async generateCoverLetter(cvData: CVData, _jobDescription: string, extraPrompt?: string): Promise<string> {
    // In a real implementation, this would call OpenAI API
    // For now, we'll simulate cover letter generation

    // Mock cover letter for demonstration
    const mockCoverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the position at your company. With my background in ${cvData.skills.slice(0, 3).join(', ')}, I am confident I would be a valuable addition to your team.

In my previous role as ${cvData.experience[0]?.title || 'Software Developer'} at ${cvData.experience[0]?.company || 'Previous Company'}, I successfully ${cvData.experience[0]?.description.split('.')[0] || 'delivered high-quality software solutions'}. This experience has prepared me well for the challenges outlined in your job description.

${extraPrompt ? `Additionally, ${extraPrompt}` : 'I am particularly excited about the opportunity to contribute to your team\'s success and would welcome the chance to discuss how my skills and experience align with your needs.'}

Thank you for your consideration. I look forward to hearing from you soon.

Sincerely,
${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`;

    try {
      return mockCoverLetter;
    } catch (error) {
      console.error('Error generating cover letter:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiService = new AIService('mock-api-key');