import { CVData, ATSOptimization } from '../types';

class AIService {
  constructor(_apiKey: string) {
    // API key will be used in real implementation
  }

  async optimizeCV(cvData: CVData, _jobDescription: string): Promise<{ optimizedCV: CVData; optimizations: ATSOptimization[] }> {
    // In a real implementation, this would call OpenAI API
    // For now, we'll simulate the optimization
    
    try {
      // Simulated optimization for now
      const optimizations: ATSOptimization[] = [
        {
          id: '1',
          category: 'Action Verbs',
          change: 'Replaced passive language with action verbs',
          originalText: 'Was responsible for managing team',
          optimizedText: 'Led and managed cross-functional team of 8 members',
          applied: true
        },
        {
          id: '2',
          category: 'Quantification',
          change: 'Added measurable results',
          originalText: 'Improved system performance',
          optimizedText: 'Optimized system performance by 40%, reducing load time from 5s to 3s',
          applied: true
        },
        {
          id: '3',
          category: 'Keywords',
          change: 'Added relevant keywords from job description',
          originalText: 'Built web applications',
          optimizedText: 'Developed scalable web applications using React, TypeScript, and Node.js',
          applied: true
        }
      ];

      return {
        optimizedCV: cvData,
        optimizations
      };
    } catch (error) {
      console.error('Error optimizing CV:', error);
      throw error;
    }
  }

  async generateCoverLetter(cvData: CVData, _jobDescription: string, extraPrompt?: string): Promise<string> {
    try {
      // Simulated cover letter generation
      const coverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the position described in your job posting. With my background in ${cvData.experience[0]?.title || 'software development'} and proven track record of ${cvData.experience[0]?.description || 'delivering high-quality solutions'}, I am confident that I would be a valuable addition to your team.

In my current role at ${cvData.experience[0]?.company || 'my current company'}, I have successfully ${cvData.experience[0]?.description || 'led multiple projects to completion'}. My experience with ${cvData.skills.slice(0, 5).join(', ')} directly aligns with the requirements outlined in your job description.

${extraPrompt ? 'Additionally, ' + extraPrompt : ''}

I am excited about the opportunity to bring my skills and experience to your organization. I look forward to discussing how I can contribute to your team's success.

Thank you for considering my application.

Sincerely,
${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`;

      return coverLetter;
    } catch (error) {
      console.error('Error generating cover letter:', error);
      throw error;
    }
  }
}

export { AIService };
const defaultAIService = new AIService('');
export default defaultAIService;