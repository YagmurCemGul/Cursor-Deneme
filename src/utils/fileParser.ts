import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist';
import { CVData, Experience, Education, Certification, Project } from '../types';
import { logger } from './logger';

// Configure pdf.js worker for the new version
// pdfjs-dist v5+ uses ESM and requires different worker configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// Configure pdf.js worker for the new version
// pdfjs-dist v5+ uses ESM and requires different worker configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export class FileParser {
  // Worker configuration is now handled at module load time
  static configurePdfJsWorker(): void {
    // This method is kept for backward compatibility but is no longer needed
    // The worker is configured at module initialization
  }
  static async parseFile(file: File): Promise<Partial<CVData>> {
    const fileType = file.name.split('.').pop()?.toLowerCase();

    if (fileType === 'pdf') {
      return this.parsePDF(file);
    } else if (fileType === 'docx' || fileType === 'doc') {
      return this.parseDOCX(file);
    } else {
      throw new Error('Unsupported file format');
    }
  }

  private static async parsePDF(file: File): Promise<Partial<CVData>> {
    try {
      // Configure worker before any getDocument calls
      this.configurePdfJsWorker();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .filter((item): item is TextItem => 'str' in item)
          .map((item: TextItem) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      return this.extractCVData(fullText);
    } catch (error) {
      logger.error('Error parsing PDF:', error);
      throw error;
    }
  }

  private static async parseDOCX(file: File): Promise<Partial<CVData>> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return this.extractCVData(result.value);
    } catch (error) {
      logger.error('Error parsing DOCX:', error);
      throw error;
    }
  }

  private static extractCVData(text: string): Partial<CVData> {
    // Enhanced extraction logic with comprehensive field detection
    const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
    const phoneRegex = /(\+\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3}[\s-]?\d{2,4}[\s-]?\d{2,4}/g;
    const linkedInRegex = /(linkedin\.com\/in\/|@?linkedin:\s*)([\w-]+)/i;
    const githubRegex = /(github\.com\/|@?github:\s*)([\w-]+)/i;
    const whatsappRegex = /(whatsapp|wa\.me)\/.*?(\+\d{10,15}|\d{10,15})/i;
    const portfolioRegex = /(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-._~:?#[\]@!$&'()*+,;=]*)?/i;

    const emails = text.match(emailRegex);
    const phones = text.match(phoneRegex);
    const linkedInMatch = text.match(linkedInRegex);
    const githubMatch = text.match(githubRegex);
    const whatsappMatch = text.match(whatsappRegex);

    // Enhanced name extraction: look for multiple patterns
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    let nameLine = '';

    // Try different name patterns
    const namePatterns = [
      /^(?:[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\s){1,2}[A-ZÇĞİÖŞÜ][a-zçğıöşü]+$/, // Standard name
      /^(?:[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\s){2,3}[A-ZÇĞİÖŞÜ][a-zçğıöşü]+$/, // Name with middle name
      /^[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+$/, // Simple two-word name
    ];

    for (const pattern of namePatterns) {
      const found = lines.find((l) => pattern.test(l));
      if (found) {
        nameLine = found;
        break;
      }
    }

    if (!nameLine) {
      nameLine = lines[0] || '';
    }

    const nameParts = nameLine.trim().split(/\s+/);

    // Enhanced Summary extraction
    const summaryPatterns = [
      /^(summary|about me|hakkımda|profile|objective|career objective)/i,
      /^(professional summary|executive summary)/i,
      /^(overview|introduction)/i,
    ];

    let summary = '';
    for (const pattern of summaryPatterns) {
      const summaryIdx = lines.findIndex((l) => pattern.test(l));
      if (summaryIdx >= 0) {
        // Extract content until next section or end
        const nextSectionIdx = lines.findIndex(
          (l, idx) => idx > summaryIdx && /^[A-Z][A-Z\s]+$/.test(l) && l.length > 3
        );
        const endIdx = nextSectionIdx > summaryIdx ? nextSectionIdx : summaryIdx + 8;
        summary = lines
          .slice(summaryIdx + 1, endIdx)
          .join(' ')
          .slice(0, 800);
        break;
      }
    }

    // Enhanced Skills extraction
    const skillsPatterns = [
      /^(skills?|technical skills?|core competencies?|technologies?|tools?)/i,
      /^(programming languages?|languages?)/i,
      /^(software|applications?)/i,
    ];

    let parsedSkills: string[] = [];
    for (const pattern of skillsPatterns) {
      const skillsLine = lines.find((l) => pattern.test(l));
      if (skillsLine) {
        const skillsText = skillsLine.split(
          /skills?|technical skills?|core competencies?|technologies?|tools?|programming languages?|languages?|software|applications?/i
        )[1];
        if (skillsText) {
          parsedSkills = skillsText
            .split(/[•,;|•\n]/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 20); // Limit to 20 skills
        }
        break;
      }
    }

    // Extract Experience section
    const experiencePatterns = [
      /^(experience|work experience|employment|career|professional experience)/i,
      /^(work history|employment history)/i,
    ];

    const experiences = this.extractExperienceSection(lines, experiencePatterns);

    // Extract Education section
    const educationPatterns = [
      /^(education|academic background|qualifications?)/i,
      /^(degrees?|academic qualifications?)/i,
    ];

    const education = this.extractEducationSection(lines, educationPatterns);

    // Extract Certifications/Licenses section
    const certificationPatterns = [
      /^(certifications?|licenses?|certificates?)/i,
      /^(professional certifications?|licenses? and certifications?)/i,
    ];

    const certifications = this.extractCertificationSection(lines, certificationPatterns);

    // Extract Projects section
    const projectPatterns = [
      /^(projects?|portfolio|personal projects?)/i,
      /^(key projects?|notable projects?)/i,
    ];

    const projects = this.extractProjectSection(lines, projectPatterns);

    // Enhanced portfolio URL extraction
    const portfolioPatterns = [
      /(portfolio|website|site|personal website):?\s*(.*)/i,
      /(https?:\/\/[^\s]+)/g,
    ];

    let portfolioUrl = '';
    for (const pattern of portfolioPatterns) {
      const match = text.match(pattern);
      if (match) {
        const url = match[2] || match[1] || '';
        const urlMatch = url.match(portfolioRegex);
        if (
          urlMatch &&
          urlMatch[0] &&
          !urlMatch[0].includes('linkedin') &&
          !urlMatch[0].includes('github')
        ) {
          portfolioUrl = urlMatch[0];
          break;
        }
      }
    }

    // Enhanced phone number parsing
    const firstPhone = phones?.[0] || '';
    const countryCode = (firstPhone.match(/^(\+\d{1,3})/) || [])[1] || '';
    const phoneNumber = firstPhone.replace(countryCode, '').trim();

    // Extract WhatsApp link
    const whatsappLink = whatsappMatch ? whatsappMatch[0] : '';

    return {
      personalInfo: {
        firstName: nameParts[0] || '',
        middleName: nameParts.length === 3 ? (nameParts[1] ?? '') : '',
        lastName: nameParts[nameParts.length - 1] ?? '',
        email: emails?.[0] ?? '',
        linkedInUsername: linkedInMatch ? (linkedInMatch[2] || '').replace(/^\//, '') : '',
        portfolioUrl: portfolioUrl,
        githubUsername: githubMatch ? (githubMatch[2] || '').replace(/^\//, '') : '',
        whatsappLink: whatsappLink,
        phoneNumber,
        countryCode,
        summary,
      },
      skills: parsedSkills,
      experience: experiences,
      education: education,
      certifications: certifications,
      projects: projects,
      customQuestions: [],
    };
  }

  private static extractExperienceSection(lines: string[], patterns: RegExp[]): Experience[] {
    const experiences: Experience[] = [];
    let experienceStartIdx = -1;

    for (const pattern of patterns) {
      const idx = lines.findIndex((l) => pattern.test(l));
      if (idx >= 0) {
        experienceStartIdx = idx;
        break;
      }
    }

    if (experienceStartIdx === -1) return experiences;

    // Find the end of experience section
    const nextSectionIdx = lines.findIndex(
      (l, idx) =>
        idx > experienceStartIdx &&
        /^(education|skills?|projects?|certifications?|achievements?)/i.test(l)
    );

    const endIdx = nextSectionIdx > experienceStartIdx ? nextSectionIdx : lines.length;
    const experienceLines = lines.slice(experienceStartIdx + 1, endIdx);

    // Parse individual experiences
    let currentExp: Partial<Experience> | null = null;
    for (let i = 0; i < experienceLines.length; i++) {
      const line = experienceLines[i];

      // Check if this line looks like a job title/company
      if (line && /^[A-Z][a-zA-Z\s&]+$/.test(line) && line.length > 5 && line.length < 50) {
        if (currentExp && currentExp.id) {
          experiences.push(currentExp as Experience);
        }
        currentExp = {
          id: Date.now().toString() + Math.random(),
          title: line,
          employmentType: '',
          company: '',
          startDate: '',
          endDate: '',
          location: '',
          country: '',
          city: '',
          locationType: '',
          description: '',
          skills: [],
        };
      } else if (currentExp && line && line.includes(' - ')) {
        // Parse date range and company
        const parts = line.split(' - ');
        if (parts.length >= 2 && parts[0] && parts[1]) {
          currentExp.company = parts[0].trim();
          const dateRange = parts[1].trim();
          const dates = dateRange.split(/[–-]/);
          if (dates.length >= 2 && dates[0] && dates[1]) {
            currentExp.startDate = dates[0].trim();
            currentExp.endDate = dates[1].trim();
          }
        }
      } else if (currentExp && line && line.length > 20) {
        // Add to description
        currentExp.description =
          (currentExp.description || '') + (currentExp.description ? '\n' : '') + line;
      }
    }

    if (currentExp && currentExp.id) {
      experiences.push(currentExp as Experience);
    }

    return experiences;
  }

  private static extractEducationSection(lines: string[], patterns: RegExp[]): Education[] {
    const education: Education[] = [];
    let educationStartIdx = -1;

    for (const pattern of patterns) {
      const idx = lines.findIndex((l) => pattern.test(l));
      if (idx >= 0) {
        educationStartIdx = idx;
        break;
      }
    }

    if (educationStartIdx === -1) return education;

    // Find the end of education section
    const nextSectionIdx = lines.findIndex(
      (l, idx) =>
        idx > educationStartIdx &&
        /^(experience|skills?|projects?|certifications?|achievements?)/i.test(l)
    );

    const endIdx = nextSectionIdx > educationStartIdx ? nextSectionIdx : lines.length;
    const educationLines = lines.slice(educationStartIdx + 1, endIdx);

    // Parse individual education entries
    let currentEdu: Partial<Education> | null = null;
    for (let i = 0; i < educationLines.length; i++) {
      const line = educationLines[i];

      // Check if this line looks like a degree/school
      if (line && /^[A-Z][a-zA-Z\s&]+$/.test(line) && line.length > 5 && line.length < 50) {
        if (currentEdu && currentEdu.id) {
          education.push(currentEdu as Education);
        }
        currentEdu = {
          id: Date.now().toString() + Math.random(),
          school: line,
          degree: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
          currentlyStudying: false,
          grade: '',
          activities: '',
          description: '',
          skills: [],
        };
      } else if (currentEdu && line && line.includes(' - ')) {
        // Parse date range and degree
        const parts = line.split(' - ');
        if (parts.length >= 2 && parts[0] && parts[1]) {
          currentEdu.degree = parts[0].trim();
          const dateRange = parts[1].trim();
          const dates = dateRange.split(/[–-]/);
          if (dates.length >= 2 && dates[0] && dates[1]) {
            currentEdu.startDate = dates[0].trim();
            currentEdu.endDate = dates[1].trim();
          }
        }
      } else if (currentEdu && line && line.length > 10) {
        // Add to description
        currentEdu.description =
          (currentEdu.description || '') + (currentEdu.description ? '\n' : '') + line;
      }
    }

    if (currentEdu && currentEdu.id) {
      education.push(currentEdu as Education);
    }

    return education;
  }

  private static extractCertificationSection(lines: string[], patterns: RegExp[]): Certification[] {
    const certifications: Certification[] = [];
    let certStartIdx = -1;

    for (const pattern of patterns) {
      const idx = lines.findIndex((l) => pattern.test(l));
      if (idx >= 0) {
        certStartIdx = idx;
        break;
      }
    }

    if (certStartIdx === -1) return certifications;

    // Find the end of certification section
    const nextSectionIdx = lines.findIndex(
      (l, idx) =>
        idx > certStartIdx && /^(experience|education|skills?|projects?|achievements?)/i.test(l)
    );

    const endIdx = nextSectionIdx > certStartIdx ? nextSectionIdx : lines.length;
    const certLines = lines.slice(certStartIdx + 1, endIdx);

    // Parse individual certifications
    for (const line of certLines) {
      if (line.length > 10 && line.includes(' - ')) {
        const parts = line.split(' - ');
        if (parts.length >= 2 && parts[0] && parts[1]) {
          certifications.push({
            id: Date.now().toString() + Math.random(),
            name: parts[0].trim(),
            issuingOrganization: parts[1].trim(),
            issueDate: '',
            expirationDate: '',
            noExpiration: false,
            credentialId: '',
            credentialUrl: '',
            description: '',
            skills: [],
          } as Certification);
        }
      }
    }

    return certifications;
  }

  private static extractProjectSection(lines: string[], patterns: RegExp[]): Project[] {
    const projects: Project[] = [];
    let projectStartIdx = -1;

    for (const pattern of patterns) {
      const idx = lines.findIndex((l) => pattern.test(l));
      if (idx >= 0) {
        projectStartIdx = idx;
        break;
      }
    }

    if (projectStartIdx === -1) return projects;

    // Find the end of project section
    const nextSectionIdx = lines.findIndex(
      (l, idx) =>
        idx > projectStartIdx &&
        /^(experience|education|skills?|certifications?|achievements?)/i.test(l)
    );

    const endIdx = nextSectionIdx > projectStartIdx ? nextSectionIdx : lines.length;
    const projectLines = lines.slice(projectStartIdx + 1, endIdx);

    // Parse individual projects
    let currentProj: Partial<Project> | null = null;
    for (let i = 0; i < projectLines.length; i++) {
      const line = projectLines[i];

      // Check if this line looks like a project name
      if (line && /^[A-Z][a-zA-Z\s&]+$/.test(line) && line.length > 5 && line.length < 50) {
        if (currentProj && currentProj.id) {
          projects.push(currentProj as Project);
        }
        currentProj = {
          id: Date.now().toString() + Math.random(),
          name: line,
          description: '',
          skills: [],
          startDate: '',
          endDate: '',
          currentlyWorking: false,
          associatedWith: '',
        };
      } else if (currentProj && line && line.length > 20) {
        // Add to description
        currentProj.description =
          (currentProj.description || '') + (currentProj.description ? '\n' : '') + line;
      }
    }

    if (currentProj && currentProj.id) {
      projects.push(currentProj as Project);
    }

    return projects;
  }
}
