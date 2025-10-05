import { ResumeProfile } from './types';

export interface LinkedInProfile {
  firstName: string;
  lastName: string;
  headline?: string;
  summary?: string;
  location?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    location?: string;
    description?: string;
  }>;
  education: Array<{
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
  }>;
  certifications: Array<{
    name: string;
    organization: string;
    issueDate?: string;
    credentialId?: string;
    credentialUrl?: string;
  }>;
  languages?: Array<{
    name: string;
    proficiency?: string;
  }>;
}

export function parseLinkedInFromText(text: string): Partial<LinkedInProfile> {
  const profile: Partial<LinkedInProfile> = {
    skills: [],
    experience: [],
    education: [],
    certifications: [],
  };

  try {
    // Try to extract name (first line or pattern)
    const nameMatch = text.match(/^([A-Z][a-z]+(?: [A-Z][a-z]+)*)/m);
    if (nameMatch) {
      const nameParts = nameMatch[1].split(' ');
      profile.firstName = nameParts[0];
      profile.lastName = nameParts.slice(1).join(' ');
    }

    // Extract headline/title
    const headlineMatch = text.match(/(?:Headline|Title):\s*(.+?)(?:\n|$)/i);
    if (headlineMatch) {
      profile.headline = headlineMatch[1].trim();
    }

    // Extract location
    const locationMatch = text.match(/(?:Location|Based in):\s*(.+?)(?:\n|$)/i);
    if (locationMatch) {
      profile.location = locationMatch[1].trim();
    }

    // Extract email
    const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (emailMatch) {
      profile.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = text.match(/(?:\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}/);
    if (phoneMatch) {
      profile.phone = phoneMatch[0];
    }

    // Extract LinkedIn URL
    const linkedinMatch = text.match(/linkedin\.com\/in\/([\w-]+)/);
    if (linkedinMatch) {
      profile.linkedin = linkedinMatch[1];
    }

    // Extract summary
    const summaryMatch = text.match(/(?:About|Summary):\s*(.+?)(?:\n\n|\n(?:Experience|Education|Skills))/is);
    if (summaryMatch) {
      profile.summary = summaryMatch[1].trim();
    }

    // Extract skills (comma or newline separated)
    const skillsMatch = text.match(/Skills?:\s*(.+?)(?:\n\n|\n(?:Experience|Education|Certifications))/is);
    if (skillsMatch) {
      profile.skills = skillsMatch[1]
        .split(/[,\n•·]/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length < 50);
    }

  } catch (error) {
    console.error('Error parsing LinkedIn text:', error);
  }

  return profile;
}

export function parseLinkedInJSON(json: string): Partial<LinkedInProfile> {
  try {
    const data = JSON.parse(json);
    
    // LinkedIn export format varies, handle common structures
    const profile: Partial<LinkedInProfile> = {
      skills: [],
      experience: [],
      education: [],
      certifications: [],
    };

    // Basic info
    if (data.firstName) profile.firstName = data.firstName;
    if (data.lastName) profile.lastName = data.lastName;
    if (data.headline) profile.headline = data.headline;
    if (data.summary) profile.summary = data.summary;
    if (data.location) profile.location = data.location;
    if (data.emailAddress) profile.email = data.emailAddress;

    // Skills
    if (data.skills && Array.isArray(data.skills)) {
      profile.skills = data.skills.map((s: any) => 
        typeof s === 'string' ? s : s.name || s.skill
      ).filter(Boolean);
    }

    // Experience
    if (data.positions && Array.isArray(data.positions)) {
      profile.experience = data.positions.map((pos: any) => ({
        title: pos.title || '',
        company: pos.companyName || pos.company || '',
        startDate: pos.startDate ? formatDate(pos.startDate) : undefined,
        endDate: pos.endDate ? formatDate(pos.endDate) : undefined,
        isCurrent: !pos.endDate,
        location: pos.location,
        description: pos.description || pos.summary,
      }));
    }

    // Education
    if (data.education && Array.isArray(data.education)) {
      profile.education = data.education.map((edu: any) => ({
        school: edu.schoolName || edu.school || '',
        degree: edu.degree || edu.degreeName,
        fieldOfStudy: edu.fieldOfStudy || edu.major,
        startDate: edu.startDate ? formatDate(edu.startDate) : undefined,
        endDate: edu.endDate ? formatDate(edu.endDate) : undefined,
        grade: edu.grade,
      }));
    }

    // Certifications
    if (data.certifications && Array.isArray(data.certifications)) {
      profile.certifications = data.certifications.map((cert: any) => ({
        name: cert.name || cert.title || '',
        organization: cert.authority || cert.organization || '',
        issueDate: cert.startDate || cert.issueDate,
        credentialId: cert.licenseNumber || cert.credentialId,
        credentialUrl: cert.url,
      }));
    }

    return profile;
  } catch (error) {
    console.error('Error parsing LinkedIn JSON:', error);
    return {};
  }
}

function formatDate(date: any): string {
  if (!date) return '';
  
  // Handle different date formats
  if (typeof date === 'string') {
    // Try to parse "MM/YYYY" or "YYYY-MM"
    const parts = date.split(/[-/]/);
    if (parts.length >= 2) {
      const year = parts.find(p => p.length === 4);
      const month = parts.find(p => p.length === 1 || p.length === 2);
      if (year && month) {
        return `${year}-${month.padStart(2, '0')}`;
      }
    }
  }
  
  // Handle object format {month: 1, year: 2020}
  if (date.year) {
    const month = date.month ? String(date.month).padStart(2, '0') : '01';
    return `${date.year}-${month}`;
  }
  
  return '';
}

export function convertLinkedInToProfile(
  linkedinProfile: Partial<LinkedInProfile>,
  existingProfile?: ResumeProfile
): ResumeProfile {
  const profile: ResumeProfile = existingProfile || {
    id: crypto.randomUUID(),
    profileName: 'My Profile',
    personal: {
      firstName: '',
      lastName: '',
      email: '',
    },
    skills: [],
    experience: [],
    education: [],
    licenses: [],
    projects: [],
    extraQuestions: [],
    templates: [],
  };

  // Merge personal info
  if (linkedinProfile.firstName) profile.personal.firstName = linkedinProfile.firstName;
  if (linkedinProfile.lastName) profile.personal.lastName = linkedinProfile.lastName;
  if (linkedinProfile.email) profile.personal.email = linkedinProfile.email;
  if (linkedinProfile.phone) profile.personal.phone = linkedinProfile.phone;
  if (linkedinProfile.location) profile.personal.location = linkedinProfile.location;
  if (linkedinProfile.linkedin) profile.personal.linkedin = linkedinProfile.linkedin;
  
  // Use headline or summary
  if (linkedinProfile.summary) {
    profile.personal.summary = linkedinProfile.summary;
  } else if (linkedinProfile.headline) {
    profile.personal.summary = linkedinProfile.headline;
  }

  // Merge skills (avoid duplicates)
  if (linkedinProfile.skills && linkedinProfile.skills.length > 0) {
    const existingSkills = new Set(profile.skills.map(s => s.toLowerCase()));
    const newSkills = linkedinProfile.skills.filter(
      skill => !existingSkills.has(skill.toLowerCase())
    );
    profile.skills = [...profile.skills, ...newSkills];
  }

  // Merge experience
  if (linkedinProfile.experience && linkedinProfile.experience.length > 0) {
    profile.experience = [
      ...profile.experience,
      ...linkedinProfile.experience.map(exp => ({
        title: exp.title,
        company: exp.company,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrent: exp.isCurrent,
        description: exp.description,
        employmentType: 'Full-time' as const,
        locationType: exp.location ? 'On-site' as const : undefined,
      })),
    ];
  }

  // Merge education
  if (linkedinProfile.education && linkedinProfile.education.length > 0) {
    profile.education = [
      ...profile.education,
      ...linkedinProfile.education.map(edu => ({
        school: edu.school,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: edu.startDate,
        endDate: edu.endDate,
        grade: edu.grade,
      })),
    ];
  }

  // Merge certifications
  if (linkedinProfile.certifications && linkedinProfile.certifications.length > 0) {
    profile.licenses = [
      ...profile.licenses,
      ...linkedinProfile.certifications.map(cert => ({
        name: cert.name,
        organization: cert.organization,
        issueDate: cert.issueDate,
        credentialId: cert.credentialId,
        credentialUrl: cert.credentialUrl,
      })),
    ];
  }

  return profile;
}

// Scrape from LinkedIn page (content script)
export function scrapeLinkedInProfile(): Partial<LinkedInProfile> {
  const profile: Partial<LinkedInProfile> = {
    skills: [],
    experience: [],
    education: [],
    certifications: [],
  };

  try {
    // Name
    const nameElement = document.querySelector('h1.text-heading-xlarge');
    if (nameElement) {
      const fullName = nameElement.textContent?.trim() || '';
      const nameParts = fullName.split(' ');
      profile.firstName = nameParts[0];
      profile.lastName = nameParts.slice(1).join(' ');
    }

    // Headline
    const headlineElement = document.querySelector('.text-body-medium.break-words');
    if (headlineElement) {
      profile.headline = headlineElement.textContent?.trim();
    }

    // Location
    const locationElement = document.querySelector('.text-body-small.inline.t-black--light.break-words');
    if (locationElement) {
      profile.location = locationElement.textContent?.trim();
    }

    // Summary/About
    const aboutElement = document.querySelector('#about ~ div.display-flex.ph5.pv3');
    if (aboutElement) {
      profile.summary = aboutElement.textContent?.trim();
    }

    // Skills
    const skillElements = document.querySelectorAll('.pvs-list__paged-list-item .mr1.t-bold span[aria-hidden="true"]');
    profile.skills = Array.from(skillElements)
      .map(el => el.textContent?.trim() || '')
      .filter(s => s.length > 0);

    // Experience
    const expSection = document.querySelector('#experience');
    if (expSection) {
      const expItems = expSection.parentElement?.querySelectorAll('.pvs-list__paged-list-item');
      if (expItems) {
        profile.experience = Array.from(expItems).map(item => {
          const titleEl = item.querySelector('.mr1.t-bold span[aria-hidden="true"]');
          const companyEl = item.querySelector('.t-14.t-normal span[aria-hidden="true"]');
          const dateEl = item.querySelector('.t-14.t-normal.t-black--light span[aria-hidden="true"]');
          
          return {
            title: titleEl?.textContent?.trim() || '',
            company: companyEl?.textContent?.trim() || '',
            startDate: parseDateRange(dateEl?.textContent || '').start,
            endDate: parseDateRange(dateEl?.textContent || '').end,
            isCurrent: dateEl?.textContent?.includes('Present') || false,
          };
        });
      }
    }

    // Education
    const eduSection = document.querySelector('#education');
    if (eduSection) {
      const eduItems = eduSection.parentElement?.querySelectorAll('.pvs-list__paged-list-item');
      if (eduItems) {
        profile.education = Array.from(eduItems).map(item => {
          const schoolEl = item.querySelector('.mr1.t-bold span[aria-hidden="true"]');
          const degreeEl = item.querySelector('.t-14.t-normal span[aria-hidden="true"]');
          
          return {
            school: schoolEl?.textContent?.trim() || '',
            degree: degreeEl?.textContent?.trim().split(',')[0] || '',
            fieldOfStudy: degreeEl?.textContent?.trim().split(',')[1]?.trim() || '',
          };
        });
      }
    }

  } catch (error) {
    console.error('Error scraping LinkedIn profile:', error);
  }

  return profile;
}

function parseDateRange(dateText: string): { start?: string; end?: string } {
  const parts = dateText.split('·')[0].trim().split(' - ');
  
  const parseDate = (str: string): string | undefined => {
    if (!str || str === 'Present') return undefined;
    
    const months: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
    };
    
    const match = str.match(/(\w{3})\s+(\d{4})/);
    if (match) {
      const month = months[match[1]] || '01';
      return `${match[2]}-${month}`;
    }
    return undefined;
  };
  
  return {
    start: parts[0] ? parseDate(parts[0]) : undefined,
    end: parts[1] ? parseDate(parts[1]) : undefined,
  };
}
