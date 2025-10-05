import type { ResumeProfile, JobPost, AtsOptimization } from './types';
import { loadOptions } from './storage';
import { generateIndustryPrompt, suggestIndustry, getIndustryPrompt } from './promptLibrary';
import { analyzeJobPosting } from './jobAnalyzer';
import { tailorResumeToJob } from './resumeTailoring';
import { callAI, getProviderConfig, trackUsage, getRecommendedModel, type AIModel } from './aiProviders';

export type GeneratedResume = {
  text: string;
  optimizations: AtsOptimization[];
};

export type GeneratedCoverLetter = {
  text: string;
};

const RESUME_RULES_TR = `RESUME LANGUAGE SHOULD BE:
Specific rather than general
Active rather than passive
Written to express not impress
Articulate rather than “flowery”
Fact-based (quantify and qualify)
Written for people who / systems that scan quickly

TOP FIVE RESUME MISTAKES:
Spelling and grammar errors
Missing email and phone information
Using passive language instead of “action” words
Not well organized, concise, or easy to skim
Not demonstrating results

DO:
Be consistent in format and content
Make it easy to read and follow, balancing white space
Use consistent spacing, underlining, italics, bold, and capitalization for emphasis
List headings (such as Experience) in order of importance
Within headings, list information in reverse chronological order (most recent first)
Avoid information gaps such as a missing summer
Be sure that your formatting will translate properly if converted to a .pdf

DON’T:
Use personal pronouns (such as I or We)
Abbreviate
Use a narrative style
Use slang or colloquialisms
Include a picture
Include age or gender
List references
Start each line with a date`;

const ACTION_VERBS = `LEADERSHIP: Accomplished, Achieved, Administered, Analyzed, Assigned, Attained, Chaired, Consolidated, Contracted, Coordinated, Delegated, Developed, Directed, Earned, Evaluated, Executed, Handled, Headed, Impacted, Improved, Increased, Led, Mastered, Orchestrated, Organized, Oversaw, Planned, Predicted, Prioritized, Produced, Proved, Recommended, Regulated, Reorganized, Reviewed, Scheduled, Spearheaded, Strengthened, Supervised, Surpassed
COMMUNICATION: Addressed, Arbitrated, Arranged, Authored, Collaborated, Convinced, Corresponded, Delivered, Developed, Directed, Documented, Drafted, Edited, Energized, Enlisted, Formulated, Influenced, Interpreted, Lectured, Liaised, Mediated, Moderated, Negotiated, Persuaded, Presented, Promoted, Publicized, Reconciled, Recruited, Reported, Rewrote, Spoke, Suggested, Synthesized, Translated, Verbalized, Wrote
RESEARCH: Clarified, Collected, Concluded, Conducted, Constructed, Critiqued, Derived, Determined, Diagnosed, Discovered, Evaluated, Examined, Extracted, Formed, Identified, Inspected, Interpreted, Interviewed, Investigated, Modeled, Organized, Resolved, Reviewed, Summarized, Surveyed, Systematized, Tested
TECHNICAL: Assembled, Built, Calculated, Computed, Designed, Devised, Engineered, Fabricated, Installed, Maintained, Operated, Optimized, Overhauled, Programmed, Remodeled, Repaired, Solved, Standardized, Streamlined, Upgraded
TEACHING: Adapted, Advised, Clarified, Coached, Communicated, Coordinated, Demystified, Developed, Enabled, Encouraged, Evaluated, Explained, Facilitated, Guided, Informed, Instructed, Persuaded, Set Goals, Stimulated, Studied, Taught, Trained
QUANTITATIVE: Administered, Allocated, Analyzed, Appraised, Audited, Balanced, Budgeted, Calculated, Computed, Developed, Forecasted, Managed, Marketed, Maximized, Minimized, Planned, Projected, Researched
CREATIVE: Acted, Composed, Conceived, Conceptualized, Created, Customized, Designed, Developed, Directed, Established, Fashioned, Founded, Illustrated, Initiated, Instituted, Integrated, Introduced, Invented, Originated, Performed, Planned, Published, Redesigned, Revised, Revitalized, Shaped, Visualized
HELPING: Assessed, Assisted, Clarified, Coached, Counseled, Demonstrated, Diagnosed, Educated, Enhanced, Expedited, Facilitated, Familiarized, Guided, Motivated, Participated, Proposed, Provided, Referred, Rehabilitated, Represented, Served, Supported
ORGANIZATIONAL: Approved, Accelerated, Added, Arranged, Broadened, Cataloged, Centralized, Changed, Classified, Collected, Compiled, Completed, Controlled, Defined, Dispatched, Executed, Expanded, Gained, Gathered, Generated, Implemented, Inspected, Launched, Monitored, Operated, Organized, Prepared, Processed, Purchased, Recorded, Reduced, Reinforced, Retrieved, Screened, Selected, Simplified, Sold, Specified, Steered, Structured, Systematized, Tabulated, Unified, Updated, Utilized, Validated, Verified`;

export async function generateAtsResume(
  profile: ResumeProfile, 
  job: JobPost,
  industryId?: string
): Promise<GeneratedResume> {
  const opts = await loadOptions();
  
  // Auto-detect industry if not provided
  const detectedIndustry = industryId || suggestIndustry(
    profile.skills,
    profile.experience.map(exp => exp.title)
  );
  
  const industry = getIndustryPrompt(detectedIndustry);
  
  // Analyze job context for intelligent tailoring
  const jobContext = analyzeJobPosting(job.pastedText, job.title);
  const tailoringResult = tailorResumeToJob(profile, job.pastedText, job.title, false);
  
  // Create profile summary for context
  const profileSummary = `
Name: ${profile.personal.firstName} ${profile.personal.lastName}
Skills: ${profile.skills.join(', ')}
Experience: ${profile.experience.map(exp => `${exp.title} at ${exp.company}`).join('; ')}
Education: ${profile.education.map(edu => `${edu.degree} in ${edu.fieldOfStudy || 'N/A'}`).join('; ')}
  `.trim();
  
  // Use industry-specific prompt
  const industryPrompt = generateIndustryPrompt(
    detectedIndustry,
    job.pastedText,
    profileSummary
  );
  
  const system = `You are an expert resume writer specializing in ${industry.name} roles. 
You optimize resumes for both ATS systems and human readers.
Language: ${opts?.language ?? 'en'}.

CRITICAL RULES:
${RESUME_RULES_TR}

AVAILABLE ACTION VERBS:
${ACTION_VERBS}`;

  const prompt = `${industryPrompt}

CANDIDATE FULL PROFILE:
${JSON.stringify(profile, null, 2)}

CONTEXT-AWARE INSIGHTS:
- Match Score: ${tailoringResult.analysis.overallMatchScore}%
- Required Skills Present: ${tailoringResult.analysis.skillMatches.filter(m => m.importance === 'required' && m.userHasIt).length}/${tailoringResult.analysis.skillMatches.filter(m => m.importance === 'required').length}
- Experience Level Required: ${jobContext.experienceLevel}
- Company Culture: ${jobContext.companyCulture.join(', ')}
- Must-Have Keywords: ${jobContext.mustHaveKeywords.slice(0, 10).join(', ')}
- Key Strengths to Emphasize: ${tailoringResult.strengthAreas.slice(0, 5).join(', ')}
- Important Phrases from Job: ${jobContext.importantPhrases.slice(0, 3).join('; ')}

TAILORING PRIORITIES:
${tailoringResult.suggestions.slice(0, 5).map((s, i) => `${i + 1}. ${s.title}: ${s.description}`).join('\n')}

TASK:
Generate a professional, ATS-optimized resume in Markdown format with these sections:
1. Professional Summary (3-4 lines, focused on ${industry.resumeStructure.summaryFocus})
   - MUST naturally incorporate: ${jobContext.mustHaveKeywords.slice(0, 5).join(', ')}
   - Emphasize: ${tailoringResult.strengthAreas.slice(0, 3).join(', ')}
2. Skills (${industry.resumeStructure.skillsPresentation})
   - Prioritize required skills: ${jobContext.requiredSkills.slice(0, 8).join(', ')}
   - Order: Required skills first, then preferred, then additional
3. Work Experience (emphasis on: ${industry.resumeStructure.experienceEmphasis.join(', ')})
   - Use language from job posting: ${jobContext.importantPhrases.slice(0, 2).join('; ')}
   - Align with responsibilities mentioned in job
4. Education
5. Certifications/Licenses (if applicable)
6. Projects (if applicable)

Use ${industry.name}-appropriate terminology and include metrics like: ${industry.successMetrics.slice(0, 3).join(', ')}.

CRITICAL INSTRUCTIONS: 
- Do NOT include a resume title or "RESUME" header
- Use bullet points for experiences
- Quantify ALL achievements with specific numbers
- Naturally weave in keywords: ${jobContext.mustHaveKeywords.slice(0, 8).join(', ')}
- Match the tone and language of the job posting
- Maintain ${Math.round(industry.keywordDensity * 100)}% keyword density
- Emphasize candidate's strengths that match job requirements
- Use action verbs that align with ${industry.name} roles`;

  // Use recommended model for resume generation
  const recommendedModel = getRecommendedModel('resume');
  const text = await callOpenAI(system, prompt, { temperature: 0.4, model: recommendedModel });

  const optimizations: AtsOptimization[] = [
    { 
      id: crypto.randomUUID(), 
      kind: 'addition', 
      section: 'Industry Optimization', 
      after: `Applied ${industry.name} industry best practices`, 
      rationale: `Optimized for ${industry.category} sector with ${industry.commonTerms.length} industry-specific keywords` 
    },
    { 
      id: crypto.randomUUID(), 
      kind: 'enhancement', 
      section: 'Skills', 
      after: 'Prioritized relevant skills for ATS', 
      rationale: `Keyword density: ${Math.round(industry.keywordDensity * 100)}%, Match score: ${tailoringResult.analysis.overallMatchScore}%` 
    },
    { 
      id: crypto.randomUUID(), 
      kind: 'addition', 
      section: 'Context Awareness', 
      after: `Tailored to job requirements with ${tailoringResult.analysis.overallMatchScore}% match`, 
      rationale: `Incorporated ${jobContext.mustHaveKeywords.length} must-have keywords and emphasized ${tailoringResult.strengthAreas.length} key strengths` 
    },
    { 
      id: crypto.randomUUID(), 
      kind: 'enhancement', 
      section: 'Experience', 
      after: 'Aligned experience descriptions with job responsibilities', 
      rationale: `Matched ${tailoringResult.analysis.skillMatches.filter(m => m.userHasIt).length}/${tailoringResult.analysis.skillMatches.length} required skills` 
    }
  ];

  return { text, optimizations };
}

export async function generateCoverLetter(profile: ResumeProfile, job: JobPost, extraPrompt?: string): Promise<GeneratedCoverLetter> {
  const opts = await loadOptions();
  const system = `You are a concise cover letter writer. One page max. Avoid flowery language. Language: ${opts?.language ?? 'tr'}.`;
  const rules = `Cover letter rules: Address to a specific person if possible. Tailor to the role and company using the job description. Keep concise, factual. Use action words. Minimize 'I'. Ensure consistent font with resume.`;
  const prompt = `Job description:\n${job.pastedText}\n\nCandidate profile (JSON):\n${JSON.stringify(profile, null, 2)}\n\n${rules}\n\nExtra instructions (optional): ${extraPrompt ?? 'None'}\n\nProduce a one-page cover letter in Markdown; include greeting, 2-3 short paragraphs, bullet examples if helpful, and a closing.`;
  const text = await callOpenAI(system, prompt);
  return { text };
}

export async function callOpenAI(
  system: string, 
  user: string, 
  options?: { temperature?: number; model?: AIModel }
): Promise<string> {
  const temperature = options?.temperature ?? 0.3;
  const preferredModel = options?.model;
  
  try {
    const config = await getProviderConfig(preferredModel);
    config.temperature = temperature;
    
    const response = await callAI(system, user, config);
    
    // Track usage
    await trackUsage(response);
    
    return response.content;
  } catch (error: any) {
    console.error('AI call error:', error);
    
    // Re-throw the error if it contains helpful user messaging
    if (error.message && (
      error.message.includes('No API key found') ||
      error.message.includes('rate limit') ||
      error.message.includes('quota exceeded') ||
      error.message.includes('Invalid API key')
    )) {
      throw error;
    }
    
    // Fallback to legacy system if new providers fail
    const opts = await loadOptions();
    if (!opts?.apiKey) {
      throw new Error('API key not set. Please go to Settings (⚙️ button) to configure your API key.');
    }
    
    const provider = opts.apiProvider || 'openai';
    
    if (provider === 'openai' || provider === 'azure') {
      const endpoint = provider === 'azure' ? 'https://example-azure-endpoint' : 'https://api.openai.com/v1/chat/completions';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${opts.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user }
          ],
          temperature,
        })
      });

      if (!res.ok) {
        // Special handling for rate limit errors
        if (res.status === 429) {
          return `OpenAI rate limit exceeded (429). Please wait a moment and try again, or consider upgrading your API plan. ${res.statusText}`;
        }
        return `OpenAI error: ${res.status} ${res.statusText}`;
      }
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? '';
      return content.trim();
    } else if (provider === 'gemini') {
      const prompt = `${system}\n\n${user}`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${opts.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature,
            topK: 40,
            topP: 0.95,
          }
        })
      });

      if (!res.ok) {
        // Special handling for rate limit errors
        if (res.status === 429) {
          return `Gemini rate limit exceeded (429). Please wait a moment and try again, or consider upgrading your API plan. ${res.statusText}`;
        }
        return `Gemini error: ${res.status} ${res.statusText}`;
      }
      const data = await res.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return content.trim();
    } else if (provider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': opts.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 2000,
          temperature: 0.3,
          system: system,
          messages: [
            { role: 'user', content: user }
          ]
        })
      });

      if (!res.ok) {
        // Special handling for rate limit errors
        if (res.status === 429) {
          return `Claude rate limit exceeded (429). Please wait a moment and try again, or consider upgrading your API plan. ${res.statusText}`;
        }
        return `Claude error: ${res.status} ${res.statusText}`;
      }
      const data = await res.json();
      const content = data.content?.[0]?.text ?? '';
      return content.trim();
    } else {
      return `Unsupported AI provider: ${provider}`;
    }
  }
}
