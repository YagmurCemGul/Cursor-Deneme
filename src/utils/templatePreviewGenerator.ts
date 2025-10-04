/**
 * Template Preview Generator
 * Generates preview with sample data for templates
 */

import { CVData, PersonalInfo, Experience, Education } from '../types';
import { CVTemplateStyle } from '../data/cvTemplates';

export interface TemplatePreviewData {
  cvData: CVData;
  html: string;
}

export class TemplatePreviewGenerator {
  /**
   * Generate sample CV data for preview
   */
  static generateSampleData(): CVData {
    const samplePersonalInfo: PersonalInfo = {
      firstName: 'John',
      middleName: 'Michael',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phoneNumber: '555-0123',
      countryCode: '+1',
      linkedInUsername: 'johndoe',
      githubUsername: 'johndoe',
      portfolioUrl: 'https://johndoe.com',
      whatsappLink: '',
      summary: 'Experienced software engineer with 5+ years in full-stack development. Passionate about creating efficient, scalable solutions and leading teams to success.',
      photoDataUrl: '',
    };

    const sampleExperience: Experience[] = [
      {
        id: '1',
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        employmentType: 'Full-time',
        startDate: '2020-01',
        endDate: '2024-01',
        currentlyWorking: true,
        location: 'San Francisco, CA',
        country: 'United States',
        city: 'San Francisco',
        locationType: 'On-site',
        description: 'Led development of microservices architecture, improving system performance by 40%. Mentored junior developers and conducted code reviews.',
        skills: ['React', 'Node.js', 'AWS', 'Docker'],
      },
      {
        id: '2',
        title: 'Software Developer',
        company: 'Startup Inc',
        employmentType: 'Full-time',
        startDate: '2018-06',
        endDate: '2019-12',
        location: 'New York, NY',
        country: 'United States',
        city: 'New York',
        locationType: 'Hybrid',
        description: 'Developed and maintained web applications using modern JavaScript frameworks. Collaborated with UX team to improve user experience.',
        skills: ['JavaScript', 'React', 'MongoDB'],
      },
    ];

    const sampleEducation: Education[] = [
      {
        id: '1',
        school: 'University of Technology',
        degree: "Bachelor's Degree",
        fieldOfStudy: 'Computer Science',
        startDate: '2014-09',
        endDate: '2018-05',
        grade: '3.8 GPA',
        activities: 'Programming Club President, Hackathon Winner',
        description: 'Focused on software engineering, algorithms, and data structures.',
        skills: ['Java', 'Python', 'Data Structures'],
        country: 'United States',
        city: 'Boston',
      },
    ];

    return {
      personalInfo: samplePersonalInfo,
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'Git'],
      experience: sampleExperience,
      education: sampleEducation,
      certifications: [
        {
          id: '1',
          name: 'AWS Certified Solutions Architect',
          issuingOrganization: 'Amazon Web Services',
          issueDate: '2022-06',
          expirationDate: '2025-06',
          credentialId: 'AWS-12345',
          credentialUrl: '',
          skills: ['AWS', 'Cloud Computing'],
        },
      ],
      projects: [
        {
          id: '1',
          name: 'E-Commerce Platform',
          description: 'Built a scalable e-commerce platform serving 10,000+ users with real-time inventory management.',
          skills: ['React', 'Node.js', 'PostgreSQL'],
          startDate: '2023-01',
          endDate: '2023-06',
          currentlyWorking: false,
          associatedWith: 'Freelance',
        },
      ],
      customQuestions: [],
    };
  }

  /**
   * Generate HTML preview for a template
   */
  static generatePreviewHTML(template: CVTemplateStyle, cvData?: CVData): string {
    const data = cvData || this.generateSampleData();

    const styles = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: ${template.fonts.body};
          color: ${template.colors.text};
          background: ${template.colors.background};
          padding: ${template.layout.margins.top}px ${template.layout.margins.right}px ${template.layout.margins.bottom}px ${template.layout.margins.left}px;
          line-height: 1.6;
        }
        .container {
          max-width: 850px;
          margin: 0 auto;
        }
        .header {
          text-align: ${template.layout.headerAlign};
          margin-bottom: ${template.layout.sectionSpacing}px;
          padding-bottom: ${template.layout.sectionSpacing / 2}px;
          border-bottom: 2px solid ${template.colors.primary};
        }
        h1 {
          font-family: ${template.fonts.heading};
          font-size: ${template.fonts.size.heading};
          color: ${template.colors.primary};
          margin-bottom: 10px;
        }
        h2 {
          font-family: ${template.fonts.heading};
          font-size: ${template.fonts.size.subheading};
          color: ${template.colors.primary};
          margin-top: ${template.layout.sectionSpacing}px;
          margin-bottom: ${template.layout.sectionSpacing / 2}px;
          padding-bottom: 5px;
          border-bottom: 1px solid ${template.colors.accent};
        }
        .contact-info {
          font-size: ${template.fonts.size.body};
          color: ${template.colors.secondary};
          margin-bottom: 15px;
        }
        .summary {
          font-size: ${template.fonts.size.body};
          margin-bottom: ${template.layout.sectionSpacing}px;
          line-height: 1.8;
        }
        .section {
          margin-bottom: ${template.layout.sectionSpacing}px;
        }
        .experience-item, .education-item, .project-item {
          margin-bottom: 20px;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
        }
        .item-title {
          font-weight: bold;
          color: ${template.colors.primary};
          font-size: calc(${template.fonts.size.body} + 2px);
        }
        .item-company, .item-school {
          color: ${template.colors.secondary};
          font-style: italic;
        }
        .item-date {
          color: ${template.colors.secondary};
          font-size: calc(${template.fonts.size.body} - 1px);
        }
        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .skill-tag {
          background: ${template.colors.accent};
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: calc(${template.fonts.size.body} - 2px);
        }
        .certification-item {
          margin-bottom: 15px;
        }
        ul {
          list-style-position: inside;
          margin-left: 10px;
        }
      </style>
    `;

    const fullName = `${data.personalInfo.firstName} ${data.personalInfo.middleName} ${data.personalInfo.lastName}`.trim();
    const contact = [
      data.personalInfo.email,
      `${data.personalInfo.countryCode}${data.personalInfo.phoneNumber}`,
      data.personalInfo.linkedInUsername ? `linkedin.com/in/${data.personalInfo.linkedInUsername}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          ${styles}
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <h1>${fullName}</h1>
              <div class="contact-info">${contact}</div>
            </div>

            <!-- Summary -->
            ${
              data.personalInfo.summary
                ? `
              <div class="summary">
                ${data.personalInfo.summary}
              </div>
            `
                : ''
            }

            <!-- Skills -->
            ${
              data.skills.length > 0
                ? `
              <div class="section">
                <h2>SKILLS</h2>
                <div class="skills">
                  ${data.skills.map((skill) => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
              </div>
            `
                : ''
            }

            <!-- Experience -->
            ${
              data.experience.length > 0
                ? `
              <div class="section">
                <h2>EXPERIENCE</h2>
                ${data.experience
                  .map(
                    (exp) => `
                  <div class="experience-item">
                    <div class="item-header">
                      <div>
                        <div class="item-title">${exp.title}</div>
                        <div class="item-company">${exp.company} | ${exp.location}</div>
                      </div>
                      <div class="item-date">
                        ${exp.startDate} - ${exp.currentlyWorking ? 'Present' : exp.endDate || 'Present'}
                      </div>
                    </div>
                    <div>${exp.description}</div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
                : ''
            }

            <!-- Education -->
            ${
              data.education.length > 0
                ? `
              <div class="section">
                <h2>EDUCATION</h2>
                ${data.education
                  .map(
                    (edu) => `
                  <div class="education-item">
                    <div class="item-header">
                      <div>
                        <div class="item-title">${edu.school}</div>
                        <div class="item-company">${edu.degree} in ${edu.fieldOfStudy}</div>
                      </div>
                      <div class="item-date">
                        ${edu.startDate} - ${edu.currentlyStudying ? 'Expected' : edu.endDate}
                      </div>
                    </div>
                    ${edu.grade ? `<div>Grade: ${edu.grade}</div>` : ''}
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
                : ''
            }

            <!-- Certifications -->
            ${
              data.certifications.length > 0
                ? `
              <div class="section">
                <h2>CERTIFICATIONS</h2>
                ${data.certifications
                  .map(
                    (cert) => `
                  <div class="certification-item">
                    <div class="item-title">${cert.name}</div>
                    <div class="item-company">${cert.issuingOrganization} | ${cert.issueDate}</div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
                : ''
            }

            <!-- Projects -->
            ${
              data.projects.length > 0
                ? `
              <div class="section">
                <h2>PROJECTS</h2>
                ${data.projects
                  .map(
                    (proj) => `
                  <div class="project-item">
                    <div class="item-title">${proj.name}</div>
                    <div>${proj.description}</div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
                : ''
            }
          </div>
        </body>
      </html>
    `;

    return html;
  }

  /**
   * Generate preview data URL for display
   */
  static generatePreviewDataURL(template: CVTemplateStyle, cvData?: CVData): string {
    const html = this.generatePreviewHTML(template, cvData);
    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }
}
