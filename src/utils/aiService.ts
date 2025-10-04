import { CVData, ATSOptimization } from '../types';
import { createAIProvider, AIConfig, AIProviderAdapter } from './aiProviders';

export class AIService {
  private provider: AIProviderAdapter | null = null;
  private useMockMode: boolean = false;

  constructor(config?: AIConfig) {
    if (config && config.apiKey && config.apiKey.trim()) {
      try {
        this.provider = createAIProvider(config);
        this.useMockMode = false;
      } catch (error) {
        console.error('Failed to initialize AI provider, falling back to mock mode:', error);
        this.useMockMode = true;
      }
    } else {
      console.warn('No API key provided - AI service running in mock mode');
      this.useMockMode = true;
    }
  }

  /**
   * Update the AI provider configuration
   */
  updateConfig(config: AIConfig): void {
    try {
      this.provider = createAIProvider(config);
      this.useMockMode = false;
    } catch (error) {
      console.error('Failed to update AI provider:', error);
      throw error;
    }
  }

  async optimizeCV(cvData: CVData, jobDescription: string): Promise<{ optimizedCV: CVData; optimizations: ATSOptimization[] }> {
    // If we have a real provider configured, use it
    if (!this.useMockMode && this.provider) {
      try {
        return await this.provider.optimizeCV(cvData, jobDescription);
      } catch (error) {
        console.error('AI provider error, falling back to mock:', error);
        // Fall through to mock mode
      }
    }

    // Mock optimizations for demonstration or fallback
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

    return {
      optimizedCV: cvData,
      optimizations: mockOptimizations
    };
  }

  async generateCoverLetter(cvData: CVData, jobDescription: string, extraPrompt?: string): Promise<string> {
    // Validate inputs
    this.validateCoverLetterInputs(cvData, jobDescription);

    // If we have a real provider configured, use it
    if (!this.useMockMode && this.provider) {
      try {
        return await this.provider.generateCoverLetter(cvData, jobDescription, extraPrompt);
      } catch (error: any) {
        console.error('AI provider error:', error);
        // Don't fall back to mock mode - let user know what went wrong
        throw error;
      }
    }

    // Mock/fallback implementation (when no API key is configured)
    console.warn('Running in mock mode - no API key configured');
    try {
      // Extract job information from description
      const jobInfo = this.extractJobInfo(jobDescription);
      
      // Analyze and match profile to job requirements
      const matchedData = this.matchProfileToJob(cvData, jobDescription, jobInfo);
      
      // Generate comprehensive cover letter
      const coverLetter = this.generateEnhancedCoverLetter(cvData, jobInfo, matchedData, extraPrompt);
      
      return coverLetter;
    } catch (error) {
      console.error('Error generating cover letter:', error);
      throw new Error('Failed to generate cover letter. Please check your CV data and job description.');
    }
  }

  /**
   * Validate inputs for cover letter generation
   */
  private validateCoverLetterInputs(cvData: CVData, jobDescription: string): void {
    if (!jobDescription || jobDescription.trim().length < 50) {
      throw new Error('Job description is too short. Please provide a detailed job description (at least 50 characters).');
    }

    if (!cvData.personalInfo.firstName || !cvData.personalInfo.lastName) {
      throw new Error('Please fill in your name in the Personal Information section.');
    }

    if (!cvData.personalInfo.email) {
      throw new Error('Please fill in your email in the Personal Information section.');
    }

    if (cvData.skills.length === 0) {
      throw new Error('Please add at least one skill to your CV.');
    }

    if (cvData.experience.length === 0) {
      console.warn('No experience entries found - cover letter may be less effective');
    }
  }

  private extractJobInfo(jobDescription: string): {
    companyName: string;
    positionTitle: string;
    requiredSkills: string[];
    preferredSkills: string[];
    keyResponsibilities: string[];
  } {
    // Extract company name (look for common patterns)
    let companyName = 'your company';
    const companyPatterns = [
      /(?:at|@|for)\s+([A-Z][A-Za-z0-9\s&,.']+?)(?:\s+is|\s+we|\s+are|,|\.|$)/,
      /([A-Z][A-Za-z0-9\s&,.']+?)\s+is\s+(?:hiring|looking|seeking)/,
      /(?:About|Join)\s+([A-Z][A-Za-z0-9\s&,.']+)/
    ];
    
    for (const pattern of companyPatterns) {
      const match = jobDescription.match(pattern);
      if (match && match[1] && match[1].trim().length < 50) {
        companyName = match[1].trim();
        break;
      }
    }

    // Extract position title (look for common patterns)
    let positionTitle = 'this position';
    const positionPatterns = [
      /(?:Position|Role|Title):\s*([^\n]+)/i,
      /(?:hiring|seeking|looking for)\s+(?:a|an)\s+([A-Z][A-Za-z\s]+?)(?:\s+to|\s+who|$)/,
      /([A-Z][A-Za-z\s]+?)\s+(?:Position|Role|Opportunity)/
    ];
    
    for (const pattern of positionPatterns) {
      const match = jobDescription.match(pattern);
      if (match && match[1] && match[1].trim().length < 50) {
        positionTitle = match[1].trim();
        break;
      }
    }

    // Extract skills (look for technical terms and tools)
    const skillKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'React', 'Angular', 'Vue',
      'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'AWS', 'Azure', 'GCP',
      'Docker', 'Kubernetes', 'CI/CD', 'Git', 'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL',
      'REST', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'TDD', 'Machine Learning',
      'Data Science', 'AI', 'DevOps', 'Cloud', 'API', 'Frontend', 'Backend', 'Full Stack'
    ];
    
    const requiredSkills: string[] = [];
    const preferredSkills: string[] = [];
    
    const requiredSection = jobDescription.match(/(?:required|must have|essential).*?(?:preferred|nice to have|bonus|$)/is);
    const preferredSection = jobDescription.match(/(?:preferred|nice to have|bonus).*?$/is);
    
    skillKeywords.forEach(skill => {
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      if (requiredSection && regex.test(requiredSection[0])) {
        requiredSkills.push(skill);
      } else if (preferredSection && regex.test(preferredSection[0])) {
        preferredSkills.push(skill);
      } else if (regex.test(jobDescription)) {
        requiredSkills.push(skill);
      }
    });

    // Extract key responsibilities
    const keyResponsibilities: string[] = [];
    const responsibilityPatterns = [
      /[•\-*]\s*([A-Z][^\n•\-*]+)/g,
      /\d+\.\s*([A-Z][^\n\d]+)/g
    ];
    
    responsibilityPatterns.forEach(pattern => {
      const matches = Array.from(jobDescription.matchAll(pattern));
      matches.slice(0, 3).forEach(match => {
        if (match[1] && match[1].trim().length > 10 && match[1].trim().length < 200) {
          keyResponsibilities.push(match[1].trim());
        }
      });
    });

    return {
      companyName,
      positionTitle,
      requiredSkills: [...new Set(requiredSkills)],
      preferredSkills: [...new Set(preferredSkills)],
      keyResponsibilities
    };
  }

  private matchProfileToJob(cvData: CVData, _jobDescription: string, jobInfo: any): {
    matchingSkills: string[];
    relevantExperiences: any[];
    relevantProjects: any[];
    relevantEducation: any[];
    relevantCertifications: any[];
    matchScore: number;
  } {
    // Match skills
    const allJobSkills = [...jobInfo.requiredSkills, ...jobInfo.preferredSkills].map(s => s.toLowerCase());
    const matchingSkills = cvData.skills.filter(skill => 
      allJobSkills.some(jobSkill => 
        skill.toLowerCase().includes(jobSkill) || jobSkill.includes(skill.toLowerCase())
      )
    );

    // Score and sort experiences by relevance
    const relevantExperiences = cvData.experience
      .map(exp => {
        let score = 0;
        const expText = `${exp.title} ${exp.description} ${exp.skills.join(' ')}`.toLowerCase();
        
        // Score based on skill matches
        allJobSkills.forEach(skill => {
          if (expText.includes(skill)) score += 3;
        });
        
        // Score based on title similarity
        if (jobInfo.positionTitle.toLowerCase().split(' ').some((word: string) => exp.title.toLowerCase().includes(word))) {
          score += 5;
        }
        
        // Prefer recent experiences
        const yearMatch = exp.startDate.match(/\d{4}/);
        if (yearMatch) {
          const year = parseInt(yearMatch[0]);
          if (year >= new Date().getFullYear() - 2) score += 2;
          else if (year >= new Date().getFullYear() - 5) score += 1;
        }
        
        return { ...exp, relevanceScore: score };
      })
      .filter(exp => exp.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);

    // Match projects
    const relevantProjects = cvData.projects
      .map(proj => {
        let score = 0;
        const projText = `${proj.name} ${proj.description} ${proj.skills.join(' ')}`.toLowerCase();
        
        allJobSkills.forEach(skill => {
          if (projText.includes(skill)) score += 2;
        });
        
        return { ...proj, relevanceScore: score };
      })
      .filter(proj => proj.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 2);

    // Match education
    const relevantEducation = cvData.education
      .map(edu => {
        let score = 0;
        const eduText = `${edu.degree} ${edu.fieldOfStudy} ${edu.description}`.toLowerCase();
        
        // Check if field of study is relevant
        allJobSkills.forEach(skill => {
          if (eduText.includes(skill)) score += 2;
        });
        
        // Prefer recent education
        const yearMatch = edu.endDate.match(/\d{4}/);
        if (yearMatch) {
          const year = parseInt(yearMatch[0]);
          if (year >= new Date().getFullYear() - 5) score += 1;
        }
        
        return { ...edu, relevanceScore: score };
      })
      .filter(edu => edu.relevanceScore > 0 || cvData.education.length <= 2)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 1);

    // Match certifications
    const relevantCertifications = cvData.certifications
      .map(cert => {
        let score = 0;
        const certText = `${cert.name} ${cert.issuingOrganization} ${cert.skills.join(' ')}`.toLowerCase();
        
        allJobSkills.forEach(skill => {
          if (certText.includes(skill)) score += 3;
        });
        
        return { ...cert, relevanceScore: score };
      })
      .filter(cert => cert.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 2);

    // Calculate overall match score
    const skillMatchScore = (matchingSkills.length / Math.max(allJobSkills.length, 1)) * 40;
    const experienceScore = Math.min(relevantExperiences.length * 15, 30);
    const projectScore = Math.min(relevantProjects.length * 10, 20);
    const certScore = Math.min(relevantCertifications.length * 5, 10);
    const matchScore = Math.min(skillMatchScore + experienceScore + projectScore + certScore, 100);

    return {
      matchingSkills,
      relevantExperiences,
      relevantProjects,
      relevantEducation,
      relevantCertifications,
      matchScore
    };
  }

  private generateEnhancedCoverLetter(
    cvData: CVData,
    jobInfo: any,
    matchedData: any,
    extraPrompt?: string
  ): string {
    const fullName = `${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`.trim();
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Generate opening paragraph
    const opening = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobInfo.positionTitle} position at ${jobInfo.companyName}. With my comprehensive background in ${matchedData.matchingSkills.slice(0, 3).join(', ')}${matchedData.matchingSkills.length > 3 ? ', and more' : ''}, along with proven experience in ${matchedData.relevantExperiences[0]?.title || 'software development'}, I am excited about the opportunity to contribute to your team.`;

    // Generate experience paragraph(s)
    const experienceParagraphs: string[] = [];
    
    if (matchedData.relevantExperiences.length > 0) {
      const topExp = matchedData.relevantExperiences[0];
      const achievements = topExp.description
        .split(/[.!]\s+/)
        .filter((s: string) => s.length > 20)
        .slice(0, 2)
        .join('. ') + '.';
      
      experienceParagraphs.push(
        `In my recent role as ${topExp.title} at ${topExp.company}, I ${achievements.toLowerCase().startsWith('i ') ? achievements.slice(2) : achievements} This experience has equipped me with ${topExp.skills.slice(0, 3).join(', ')} skills that directly align with the requirements outlined in your job description.`
      );
    }

    // Add projects or certifications if highly relevant
    if (matchedData.relevantProjects.length > 0) {
      const topProject = matchedData.relevantProjects[0];
      experienceParagraphs.push(
        `Additionally, I have successfully completed ${topProject.name}, where I ${topProject.description.split('.')[0].toLowerCase()}. This project demonstrates my ability to ${topProject.skills.slice(0, 2).join(' and ')} effectively.`
      );
    } else if (matchedData.relevantCertifications.length > 0) {
      const certs = matchedData.relevantCertifications.map((c: any) => c.name).join(' and ');
      experienceParagraphs.push(
        `I am also certified in ${certs}, which validates my expertise and commitment to staying current with industry standards and best practices.`
      );
    }

    // Generate skills paragraph
    const skillsParagraph = matchedData.matchingSkills.length > 0
      ? `My technical proficiency includes ${matchedData.matchingSkills.join(', ')}, which I understand are crucial for this role. I am confident that my skill set and hands-on experience make me well-suited to excel in the ${jobInfo.positionTitle} position and contribute meaningfully to ${jobInfo.companyName}'s objectives.`
      : `My diverse skill set in ${cvData.skills.slice(0, 5).join(', ')} positions me well to contribute effectively to your team's success.`;

    // Generate education paragraph if relevant
    const educationParagraph = matchedData.relevantEducation.length > 0
      ? `\n\nMy ${matchedData.relevantEducation[0].degree} in ${matchedData.relevantEducation[0].fieldOfStudy} from ${matchedData.relevantEducation[0].school} has provided me with a strong theoretical foundation that complements my practical experience.`
      : '';

    // Add extra prompt if provided
    const extraParagraph = extraPrompt
      ? `\n\n${extraPrompt}`
      : '';

    // Generate closing paragraph
    const closing = `\n\nI am particularly drawn to this opportunity at ${jobInfo.companyName} and am eager to bring my expertise to your team. I would welcome the opportunity to discuss how my background, skills, and enthusiasm align with your needs. Thank you for considering my application. I look forward to the possibility of contributing to your organization's continued success.

Sincerely,
${fullName}`;

    // Construct final cover letter
    const coverLetter = `${today}

${opening}

${experienceParagraphs.join('\n\n')}

${skillsParagraph}${educationParagraph}${extraParagraph}${closing}`;

    return coverLetter;
  }
}

// Export singleton instance (will be initialized with proper config from popup)
export const aiService = new AIService();