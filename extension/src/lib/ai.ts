import type { ResumeProfile, JobPost, AtsOptimization } from './types';
import { loadOptions } from './storage';

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

export async function generateAtsResume(profile: ResumeProfile, job: JobPost): Promise<GeneratedResume> {
  const opts = await loadOptions();
  const system = `You are an expert resume writer optimizing for ATS. Follow rules strictly. Avoid personal pronouns. Use action verbs. Language: ${opts?.language ?? 'tr'}.`;
  const prompt = `Job description:\n${job.pastedText}\n\nCandidate profile JSON:\n${JSON.stringify(profile, null, 2)}\n\nRules:\n${RESUME_RULES_TR}\n\nAction verbs:\n${ACTION_VERBS}\n\nReturn a concise, ATS-friendly resume body in Markdown sections: Summary, Skills, Experience (bullets), Education, Licenses/Certifications, Projects. Avoid headers like RESUME.`;
  const text = await callOpenAI(system, prompt);

  const optimizations: AtsOptimization[] = [
    { id: crypto.randomUUID(), kind: 'addition', section: 'Skills', after: 'Added keywords from job post', rationale: 'Increase ATS keyword match' }
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

export async function callOpenAI(system: string, user: string, options?: { temperature?: number }): Promise<string> {
  const temperature = options?.temperature ?? 0.3;
  const opts = await loadOptions();
  if (!opts?.apiKey) {
    return 'API key not set. Go to Options to configure.';
  }
  
  const provider = opts.apiProvider || 'openai';
  
  try {
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
  } catch (err) {
    return `Request failed: ${String(err)}`;
  }
}
