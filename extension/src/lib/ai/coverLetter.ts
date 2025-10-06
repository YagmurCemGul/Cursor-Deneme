// AI-powered cover letter generation
import type { ResumeProfile } from "../storage/schema";
import type { AIRouter } from "./router";
import type { AIMessage } from "./providers/openai";

interface CoverLetterInput {
  profile: ResumeProfile;
  jobDescription: string;
  jobTitle?: string;
  company?: string;
  template?: string;
}

export function buildCoverLetterPrompt(input: CoverLetterInput): AIMessage[] {
  const { profile, jobDescription, jobTitle, company, template } = input;

  // Extract key profile info
  const fullName = `${profile.personal.firstName} ${profile.personal.lastName}`;
  const email = profile.personal.email;
  const phone = profile.personal.phone;
  const summary = profile.personal.summary || "";
  
  const skills = profile.skills.join(", ");
  
  const recentExperience = profile.experience
    .slice(0, 3)
    .map(
      (exp) =>
        `${exp.title} at ${exp.company} (${exp.startDate}${exp.isCurrent ? " - Present" : exp.endDate ? ` - ${exp.endDate}` : ""}): ${exp.description || ""}`
    )
    .join("\n");

  const education = profile.education
    .slice(0, 2)
    .map((edu) => `${edu.degree || ""} ${edu.fieldOfStudy || ""} from ${edu.school}`)
    .join("\n");

  const systemPrompt = `You are an expert cover letter writer with deep knowledge of professional communication, industry standards, and applicant tracking systems (ATS). Your goal is to create compelling, personalized cover letters that:

1. Highlight the candidate's most relevant qualifications
2. Demonstrate genuine interest in the role and company
3. Match keywords from the job description naturally
4. Maintain a professional yet authentic tone
5. Follow best practices for ${template || "standard"} format

Keep the cover letter concise (300-400 words), engaging, and focused on value proposition.`;

  const userPrompt = `Create a compelling cover letter for the following position:

**Job Title:** ${jobTitle || "Position from job description"}
**Company:** ${company || "Company from job description"}

**Job Description:**
${jobDescription}

**Candidate Profile:**
Name: ${fullName}
Email: ${email}
${phone ? `Phone: ${phone}` : ""}

Summary: ${summary}

Key Skills: ${skills}

Recent Experience:
${recentExperience}

Education:
${education}

**Requirements:**
- Use a ${template || "standard"} cover letter format
- Address the hiring manager professionally
- Open with a strong hook that connects the candidate's background to the role
- Highlight 2-3 key achievements or skills that match the job requirements
- Explain why the candidate is interested in this role and company
- Close with a call to action
- Keep it to 3-4 paragraphs
- Make it ATS-friendly with natural keyword integration

Generate the cover letter now:`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
}

export async function generateCoverLetter(
  router: AIRouter,
  input: CoverLetterInput,
  signal?: AbortSignal
): Promise<string> {
  const messages = buildCoverLetterPrompt(input);
  const response = await router.chat(messages, { signal });
  return response.content;
}

export async function* generateCoverLetterStream(
  router: AIRouter,
  input: CoverLetterInput,
  signal?: AbortSignal
): AsyncGenerator<string> {
  const messages = buildCoverLetterPrompt(input);
  for await (const chunk of router.chatStream(messages, signal)) {
    yield chunk;
  }
}
