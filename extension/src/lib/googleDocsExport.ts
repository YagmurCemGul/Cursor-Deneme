/**
 * Google Docs Export
 * Exports CV to Google Docs with proper formatting
 */

import { ResumeProfile } from './types';
import { getAuthToken } from './googleAuth';
import { Language } from './i18n';

interface GoogleDocsRequest {
  title: string;
  body: {
    content: Array<{
      paragraph?: {
        elements: Array<{
          textRun: {
            content: string;
            textStyle?: {
              bold?: boolean;
              italic?: boolean;
              fontSize?: { magnitude: number; unit: string };
              foregroundColor?: { color: { rgbColor: { red: number; green: number; blue: number } } };
            };
          };
        }>;
        paragraphStyle?: {
          namedStyleType?: string;
          alignment?: string;
          spaceAbove?: { magnitude: number; unit: string };
          spaceBelow?: { magnitude: number; unit: string };
        };
      };
    }>;
  };
}

/**
 * Format date for display
 */
function formatDate(dateString: string, language: Language = 'en'): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (language === 'tr') {
    return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

/**
 * Create a paragraph element for Google Docs
 */
function createParagraph(
  text: string,
  style?: {
    bold?: boolean;
    italic?: boolean;
    fontSize?: number;
    heading?: 'HEADING_1' | 'HEADING_2' | 'HEADING_3' | 'NORMAL_TEXT';
    alignment?: 'START' | 'CENTER' | 'END';
    spaceAbove?: number;
    spaceBelow?: number;
    color?: { red: number; green: number; blue: number };
  }
) {
  const paragraph: any = {
    paragraph: {
      elements: [
        {
          textRun: {
            content: text + '\n',
            textStyle: {},
          },
        },
      ],
      paragraphStyle: {},
    },
  };

  if (style?.bold) {
    paragraph.paragraph.elements[0].textRun.textStyle.bold = true;
  }
  if (style?.italic) {
    paragraph.paragraph.elements[0].textRun.textStyle.italic = true;
  }
  if (style?.fontSize) {
    paragraph.paragraph.elements[0].textRun.textStyle.fontSize = {
      magnitude: style.fontSize,
      unit: 'PT',
    };
  }
  if (style?.color) {
    paragraph.paragraph.elements[0].textRun.textStyle.foregroundColor = {
      color: { rgbColor: style.color },
    };
  }
  if (style?.heading) {
    paragraph.paragraph.paragraphStyle.namedStyleType = style.heading;
  }
  if (style?.alignment) {
    paragraph.paragraph.paragraphStyle.alignment = style.alignment;
  }
  if (style?.spaceAbove) {
    paragraph.paragraph.paragraphStyle.spaceAbove = {
      magnitude: style.spaceAbove,
      unit: 'PT',
    };
  }
  if (style?.spaceBelow) {
    paragraph.paragraph.paragraphStyle.spaceBelow = {
      magnitude: style.spaceBelow,
      unit: 'PT',
    };
  }

  return paragraph;
}

/**
 * Convert CV profile to Google Docs format
 */
function profileToGoogleDocs(profile: ResumeProfile, language: Language = 'en'): any[] {
  const content: any[] = [];

  // Section titles
  const titles: Record<string, { en: string; tr: string }> = {
    summary: { en: 'Professional Summary', tr: 'Profesyonel Özet' },
    skills: { en: 'Skills', tr: 'Yetenekler' },
    experience: { en: 'Work Experience', tr: 'İş Deneyimi' },
    education: { en: 'Education', tr: 'Eğitim' },
    projects: { en: 'Projects', tr: 'Projeler' },
    certificates: { en: 'Licenses & Certifications', tr: 'Lisanslar ve Sertifikalar' },
    present: { en: 'Present', tr: 'Devam Ediyor' },
  };

  const t = (key: string) => titles[key]?.[language] || titles[key]?.en || key;

  // Header - Name
  content.push(
    createParagraph(`${profile.personal.firstName} ${profile.personal.lastName}`, {
      bold: true,
      fontSize: 24,
      alignment: 'CENTER',
      spaceBelow: 6,
    })
  );

  // Header - Contact Info
  const contactParts: string[] = [];
  if (profile.personal.email) contactParts.push(profile.personal.email);
  if (profile.personal.phone) contactParts.push(profile.personal.phone);
  if (profile.personal.location) contactParts.push(profile.personal.location);
  if (profile.personal.linkedin) contactParts.push(profile.personal.linkedin);
  if (profile.personal.github) contactParts.push(profile.personal.github);
  if (profile.personal.website) contactParts.push(profile.personal.website);

  if (contactParts.length > 0) {
    content.push(
      createParagraph(contactParts.join(' | '), {
        fontSize: 10,
        alignment: 'CENTER',
        spaceBelow: 12,
      })
    );
  }

  // Professional Summary
  if (profile.summary) {
    content.push(
      createParagraph(t('summary'), {
        bold: true,
        fontSize: 14,
        heading: 'HEADING_2',
        spaceAbove: 12,
        spaceBelow: 6,
        color: { red: 0.26, green: 0.42, blue: 0.92 },
      })
    );
    content.push(
      createParagraph(profile.summary, {
        fontSize: 11,
        spaceBelow: 12,
      })
    );
  }

  // Skills
  if (profile.skills && profile.skills.length > 0) {
    content.push(
      createParagraph(t('skills'), {
        bold: true,
        fontSize: 14,
        heading: 'HEADING_2',
        spaceAbove: 12,
        spaceBelow: 6,
        color: { red: 0.26, green: 0.42, blue: 0.92 },
      })
    );
    content.push(
      createParagraph(profile.skills.join(' • '), {
        fontSize: 11,
        spaceBelow: 12,
      })
    );
  }

  // Work Experience
  if (profile.experience && profile.experience.length > 0) {
    content.push(
      createParagraph(t('experience'), {
        bold: true,
        fontSize: 14,
        heading: 'HEADING_2',
        spaceAbove: 12,
        spaceBelow: 6,
        color: { red: 0.26, green: 0.42, blue: 0.92 },
      })
    );

    profile.experience.forEach((exp) => {
      // Job Title & Company
      content.push(
        createParagraph(`${exp.title} - ${exp.company}`, {
          bold: true,
          fontSize: 12,
          spaceAbove: 6,
        })
      );

      // Date Range
      const endDate = exp.current ? t('present') : formatDate(exp.endDate, language);
      content.push(
        createParagraph(`${formatDate(exp.startDate, language)} - ${endDate}`, {
          fontSize: 10,
          italic: true,
        })
      );

      // Location
      if (exp.location) {
        content.push(
          createParagraph(exp.location, {
            fontSize: 10,
            italic: true,
          })
        );
      }

      // Description
      if (exp.description) {
        const bullets = exp.description.split('\n').filter((line) => line.trim());
        bullets.forEach((bullet) => {
          content.push(
            createParagraph(`• ${bullet.replace(/^[•\-\*]\s*/, '')}`, {
              fontSize: 11,
              spaceBelow: 2,
            })
          );
        });
      }

      content.push(createParagraph('', { spaceBelow: 6 }));
    });
  }

  // Education
  if (profile.education && profile.education.length > 0) {
    content.push(
      createParagraph(t('education'), {
        bold: true,
        fontSize: 14,
        heading: 'HEADING_2',
        spaceAbove: 12,
        spaceBelow: 6,
        color: { red: 0.26, green: 0.42, blue: 0.92 },
      })
    );

    profile.education.forEach((edu) => {
      // Degree & School
      content.push(
        createParagraph(`${edu.degree} - ${edu.school}`, {
          bold: true,
          fontSize: 12,
          spaceAbove: 6,
        })
      );

      // Date Range
      const endDate = edu.current ? t('present') : formatDate(edu.endDate, language);
      content.push(
        createParagraph(`${formatDate(edu.startDate, language)} - ${endDate}`, {
          fontSize: 10,
          italic: true,
        })
      );

      // Field of Study
      if (edu.fieldOfStudy) {
        content.push(
          createParagraph(edu.fieldOfStudy, {
            fontSize: 11,
          })
        );
      }

      // GPA
      if (edu.gpa) {
        content.push(
          createParagraph(`GPA: ${edu.gpa}`, {
            fontSize: 10,
            spaceBelow: 6,
          })
        );
      }
    });
  }

  // Projects
  if (profile.projects && profile.projects.length > 0) {
    content.push(
      createParagraph(t('projects'), {
        bold: true,
        fontSize: 14,
        heading: 'HEADING_2',
        spaceAbove: 12,
        spaceBelow: 6,
        color: { red: 0.26, green: 0.42, blue: 0.92 },
      })
    );

    profile.projects.forEach((proj) => {
      // Project Name
      content.push(
        createParagraph(proj.name, {
          bold: true,
          fontSize: 12,
          spaceAbove: 6,
        })
      );

      // Technologies
      if (proj.technologies && proj.technologies.length > 0) {
        content.push(
          createParagraph(`Technologies: ${proj.technologies.join(', ')}`, {
            fontSize: 10,
            italic: true,
          })
        );
      }

      // Description
      if (proj.description) {
        content.push(
          createParagraph(proj.description, {
            fontSize: 11,
          })
        );
      }

      // URL
      if (proj.url) {
        content.push(
          createParagraph(proj.url, {
            fontSize: 10,
            color: { red: 0.26, green: 0.42, blue: 0.92 },
            spaceBelow: 6,
          })
        );
      }
    });
  }

  // Certifications
  if (profile.certificates && profile.certificates.length > 0) {
    content.push(
      createParagraph(t('certificates'), {
        bold: true,
        fontSize: 14,
        heading: 'HEADING_2',
        spaceAbove: 12,
        spaceBelow: 6,
        color: { red: 0.26, green: 0.42, blue: 0.92 },
      })
    );

    profile.certificates.forEach((cert) => {
      // Certificate Name & Issuer
      content.push(
        createParagraph(`${cert.name} - ${cert.issuer}`, {
          bold: true,
          fontSize: 11,
          spaceAbove: 4,
        })
      );

      // Date & ID
      const dateLine = cert.date ? formatDate(cert.date, language) : '';
      const idLine = cert.credentialId ? ` (ID: ${cert.credentialId})` : '';
      if (dateLine || idLine) {
        content.push(
          createParagraph(dateLine + idLine, {
            fontSize: 10,
            italic: true,
          })
        );
      }

      // URL
      if (cert.url) {
        content.push(
          createParagraph(cert.url, {
            fontSize: 9,
            color: { red: 0.26, green: 0.42, blue: 0.92 },
            spaceBelow: 4,
          })
        );
      }
    });
  }

  return content;
}

/**
 * Export CV to Google Docs
 * Creates a new Google Doc with the CV content
 */
export async function exportToGoogleDocs(
  profile: ResumeProfile,
  language: Language = 'en'
): Promise<{ documentId: string; documentUrl: string }> {
  try {
    // Get auth token
    const token = await getAuthToken();

    // Generate document title
    const title = `${profile.personal.firstName} ${profile.personal.lastName} - CV`;

    // Create new Google Doc
    const createResponse = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(error.error?.message || 'Failed to create document');
    }

    const doc = await createResponse.json();
    const documentId = doc.documentId;

    // Prepare content
    const content = profileToGoogleDocs(profile, language);

    // Insert content into document using batchUpdate
    const requests = content.map((item, index) => ({
      insertText: {
        location: { index: 1 },
        text: item.paragraph.elements[0].textRun.content,
      },
    }));

    // Style requests
    let currentIndex = 1;
    const styleRequests: any[] = [];

    content.forEach((item) => {
      const text = item.paragraph.elements[0].textRun.content;
      const textLength = text.length;
      const style = item.paragraph.elements[0].textRun.textStyle;
      const paragraphStyle = item.paragraph.paragraphStyle;

      // Text styling
      if (style && Object.keys(style).length > 0) {
        styleRequests.push({
          updateTextStyle: {
            range: {
              startIndex: currentIndex,
              endIndex: currentIndex + textLength - 1, // -1 to exclude newline
            },
            textStyle: style,
            fields: Object.keys(style).join(','),
          },
        });
      }

      // Paragraph styling
      if (paragraphStyle && Object.keys(paragraphStyle).length > 0) {
        styleRequests.push({
          updateParagraphStyle: {
            range: {
              startIndex: currentIndex,
              endIndex: currentIndex + textLength,
            },
            paragraphStyle: paragraphStyle,
            fields: Object.keys(paragraphStyle).join(','),
          },
        });
      }

      currentIndex += textLength;
    });

    // Apply all updates
    const batchUpdateResponse = await fetch(
      `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [...requests.reverse(), ...styleRequests],
        }),
      }
    );

    if (!batchUpdateResponse.ok) {
      const error = await batchUpdateResponse.json();
      throw new Error(error.error?.message || 'Failed to update document');
    }

    return {
      documentId,
      documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
    };
  } catch (error: any) {
    console.error('Google Docs export error:', error);
    throw new Error(error.message || 'Failed to export to Google Docs');
  }
}

/**
 * Check if Google Docs export is available (user is authenticated)
 */
export async function isGoogleDocsAvailable(): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get(['google_auth_token', 'google_token_expiry']);
    const token = result.google_auth_token;
    const expiry = result.google_token_expiry;

    return !!(token && expiry && Date.now() < expiry);
  } catch {
    return false;
  }
}
