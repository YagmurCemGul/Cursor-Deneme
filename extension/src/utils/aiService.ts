import { CVData, ATSOptimization } from '../types';

const RESUME_RULES = `
RESUME LANGUAGE SHOULD BE:
- Specific rather than general
- Active rather than passive
- Written to express not impress
- Articulate rather than "flowery"
- Fact-based (quantify and qualify)
- Written for people who / systems that scan quickly

TOP FIVE RESUME MISTAKES TO AVOID:
- Spelling and grammar errors
- Missing email and phone information
- Using passive language instead of "action" words
- Not well organized, concise, or easy to skim
- Not demonstrating results

DO:
- Be consistent in format and content
- Make it easy to read and follow, balancing white space
- Use consistent spacing, underlining, italics, bold, and capitalization for emphasis
- List headings (such as Experience) in order of importance
- Within headings, list information in reverse chronological order (most recent first)
- Avoid information gaps such as a missing summer

DON'T:
- Use personal pronouns (such as I or We)
- Abbreviate
- Use a narrative style
- Use slang or colloquialisms
- Include a picture
- Include age or gender
- List references
- Start each line with a date

Use ACTION VERBS like: Accomplished, Achieved, Administered, Analyzed, Developed, Directed,
Improved, Led, Managed, Organized, Planned, etc.
`;

const COVER_LETTER_RULES = `
- Address letters to a specific person if possible
- Tailor letters to specific situations or organizations
- Keep letters concise and factual, no more than a single page
- Avoid flowery language
- Give examples that support your skills and qualifications
- Don't overuse the pronoun "I"
- Use plenty of action words
- Reference skills or experiences from the job description
- Ensure resume and cover letter use the same font type and size
`;

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class AIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async callOpenAI(messages: OpenAIMessage[], temperature = 0.7): Promise<string> {
    if (this.apiKey === 'demo-key') {
      throw new Error('Please configure your OpenAI API key in the extension settings');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        temperature,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async optimizeCV(cvData: CVData, jobDescription: string): Promise<{ optimizedCV: CVData; optimizations: ATSOptimization[] }> {
    const prompt = `
You are an expert ATS (Applicant Tracking System) optimizer. Analyze the following CV and job description, then optimize the CV to be ATS-friendly while maintaining authenticity.

${RESUME_RULES}

Job Description:
${jobDescription}

CV Data:
${JSON.stringify(cvData, null, 2)}

Provide optimizations including:
1. Keyword optimization
2. Action verb improvements
3. Quantification suggestions
4. Format improvements
5. Skills matching

Return the response as JSON with:
{
  "optimizedCV": <full optimized CV>,
  "optimizations": [
    {
      "id": "unique-id",
      "category": "category",
      "change": "description of change",
      "originalText": "original text",
      "optimizedText": "optimized text",
      "applied": true
    }
  ]
}
`;

    try {
      const messages: OpenAIMessage[] = [
        { role: 'system', content: 'You are an expert ATS optimization specialist.' },
        { role: 'user', content: prompt }
      ];

      const response = await this.callOpenAI(messages);

      // Try to parse JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', response);
        throw new Error('Invalid response format from AI service');
      }

      // Validate response structure
      if (!parsedResponse.optimizedCV || !Array.isArray(parsedResponse.optimizations)) {
        throw new Error('Invalid response structure from AI service');
      }

      return {
        optimizedCV: parsedResponse.optimizedCV,
        optimizations: parsedResponse.optimizations.map((opt: any) => ({
          id: opt.id || `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          category: opt.category || 'General',
          change: opt.change || opt.description || 'Optimization applied',
          originalText: opt.originalText || '',
          optimizedText: opt.optimizedText || '',
          applied: opt.applied !== false
        }))
      };
    } catch (error) {
      console.error('Error optimizing CV:', error);

      // Fallback to basic optimizations if AI fails
      const fallbackOptimizations: ATSOptimization[] = [
        {
          id: `fallback_${Date.now()}_1`,
          category: 'Keywords',
          change: 'Added relevant keywords from job description',
          originalText: cvData.personalInfo?.summary || '',
          optimizedText: cvData.personalInfo?.summary || '',
          applied: false
        }
      ];

      return {
        optimizedCV: cvData,
        optimizations: fallbackOptimizations
      };
    }
  }

  async generateCoverLetter(cvData: CVData, jobDescription: string, extraPrompt?: string): Promise<string> {
    const prompt = `
You are an expert cover letter writer. Create a professional, compelling cover letter based on the CV and job description.

${COVER_LETTER_RULES}

Job Description:
${jobDescription}

CV Data:
${JSON.stringify(cvData.personalInfo, null, 2)}
Experience: ${cvData.experience.map(e => `${e.title} at ${e.company}`).join(', ')}
Education: ${cvData.education.map(e => `${e.degree} in ${e.fieldOfStudy} from ${e.school}`).join(', ')}
Skills: ${cvData.skills.join(', ')}

${extraPrompt ? `Additional Instructions: ${extraPrompt}` : ''}

Create a professional cover letter that highlights relevant experience and skills. Make it concise, professional, and tailored to the job description.
`;

    try {
      const messages: OpenAIMessage[] = [
        { role: 'system', content: 'You are an expert professional cover letter writer.' },
        { role: 'user', content: prompt }
      ];

      const coverLetter = await this.callOpenAI(messages, 0.8);

      // Clean up the response (remove any markdown formatting)
      return coverLetter.replace(/```[\w]*\n?/g, '').trim();

    } catch (error) {
      console.error('Error generating cover letter:', error);

      // Fallback to template-based generation if AI fails
      const fallbackLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the position described in your job posting. With my background in ${cvData.experience[0]?.title || 'software development'} and proven track record of ${cvData.experience[0]?.description || 'delivering high-quality solutions'}, I am confident that I would be a valuable addition to your team.

In my current role at ${cvData.experience[0]?.company || 'my current company'}, I have successfully ${cvData.experience[0]?.description || 'led multiple projects to completion'}. My experience with ${cvData.skills.slice(0, 5).join(', ')} directly aligns with the requirements outlined in your job description.

${cvData.education[0] ? `My ${cvData.education[0].degree} in ${cvData.education[0].fieldOfStudy} from ${cvData.education[0].school} has provided me with a strong foundation in the theoretical and practical aspects of the field.` : ''}

I am particularly drawn to this opportunity because it offers the chance to ${extraPrompt || 'contribute to innovative projects and grow professionally'}. I am excited about the possibility of bringing my unique blend of skills and experience to your organization.

Thank you for considering my application. I look forward to the opportunity to discuss how I can contribute to your team's success.

Sincerely,
${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`;

      return fallbackLetter;
    }
  }
}

export default AIService;
