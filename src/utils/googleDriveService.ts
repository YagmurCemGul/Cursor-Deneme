/**
 * Google Drive API Service
 * Handles OAuth2 authentication and file operations for Google Drive, Docs, Sheets, and Slides
 */

import { CVData, ATSOptimization } from '../types';
import { logger } from './logger';

export interface GoogleAuthConfig {
  clientId: string;
  apiKey: string;
  scopes: string[];
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  createdTime: string;
}

export class GoogleDriveService {
  private static accessToken: string | null = null;
  private static tokenExpiry: number = 0;

  /**
   * Validate OAuth2 configuration in manifest.json
   */
  private static async validateOAuth2Config(): Promise<{ valid: boolean; error?: string }> {
    try {
      // Get the manifest
      const manifest = chrome.runtime.getManifest();
      const oauth2 = (manifest as any).oauth2;

      if (!oauth2) {
        return {
          valid: false,
          error: 'OAuth2 configuration is missing from manifest.json',
        };
      }

      const clientId = oauth2.client_id;

      if (!clientId) {
        return {
          valid: false,
          error: 'Client ID is not configured in manifest.json',
        };
      }

      // Check if it's still the placeholder value
      if (
        clientId === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' ||
        clientId.includes('YOUR_GOOGLE_CLIENT_ID') ||
        clientId === 'YOUR_CLIENT_ID'
      ) {
        return {
          valid: false,
          error: 'SETUP_REQUIRED',
        };
      }

      // Validate client ID format
      if (!clientId.endsWith('.apps.googleusercontent.com')) {
        return {
          valid: false,
          error: 'Invalid Client ID format. Must end with .apps.googleusercontent.com',
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: 'Failed to validate OAuth2 configuration',
      };
    }
  }

  /**
   * Initialize Google API client and authenticate
   */
  static async authenticate(): Promise<boolean> {
    try {
      // First, validate the OAuth2 configuration
      const validation = await this.validateOAuth2Config();
      if (!validation.valid) {
        const errorMsg =
          validation.error === 'SETUP_REQUIRED'
            ? 'Google Drive integration requires setup. Please configure your Google Client ID in manifest.json. See GOOGLE_DRIVE_INTEGRATION.md for instructions.'
            : validation.error;
        throw new Error(errorMsg || 'OAuth2 configuration validation failed');
      }

      // Use Chrome Identity API for OAuth2
      return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (chrome.runtime.lastError) {
            const error = chrome.runtime.lastError;
            logger.error('Auth error:', error);

            // Provide helpful error messages
            let errorMessage = error.message || 'Authentication failed';

            if (errorMessage.includes('bad client id')) {
              errorMessage =
                'Invalid Client ID. Please verify your Google Client ID in manifest.json matches the one from Google Cloud Console.';
            } else if (errorMessage.includes('invalid_client')) {
              errorMessage =
                'Invalid OAuth2 client configuration. Make sure all required APIs are enabled in Google Cloud Console.';
            } else if (errorMessage.includes('access_denied')) {
              errorMessage = 'Access denied. Please grant the required permissions.';
            }

            reject(new Error(errorMessage));
            return;
          }

          if (token) {
            this.accessToken = token;
            this.tokenExpiry = Date.now() + 3600000; // 1 hour
            resolve(true);
          } else {
            reject(new Error('No authentication token received from Google'));
          }
        });
      });
    } catch (error: any) {
      logger.error('Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Check if we have a valid token
   */
  static async ensureAuthenticated(): Promise<boolean> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return true;
    }
    return await this.authenticate();
  }

  /**
   * Revoke authentication
   */
  static async signOut(): Promise<void> {
    if (this.accessToken) {
      chrome.identity.removeCachedAuthToken({ token: this.accessToken }, () => {
        this.accessToken = null;
        this.tokenExpiry = 0;
      });
    }
  }

  /**
   * Export CV to Google Docs
   */
  static async exportToGoogleDocs(
    cvData: CVData,
    optimizations: ATSOptimization[],
    _templateId?: string
  ): Promise<GoogleDriveFile> {
    await this.ensureAuthenticated();

    // Create a new Google Doc
    const createResponse = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `${cvData.personalInfo.firstName}_${cvData.personalInfo.lastName}_Resume_${new Date().toISOString().split('T')[0]}`,
      }),
    });

    const doc = await createResponse.json();
    const documentId = doc.documentId;

    // Build content for the document
    const requests = this.buildDocumentContent(cvData, optimizations);

    // Update the document with content
    await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    return {
      id: documentId,
      name: doc.title,
      mimeType: 'application/vnd.google-apps.document',
      webViewLink: `https://docs.google.com/document/d/${documentId}/edit`,
      createdTime: new Date().toISOString(),
    };
  }

  /**
   * Build Google Docs content structure
   */
  private static buildDocumentContent(cvData: CVData, _optimizations: ATSOptimization[]): any[] {
    const requests: any[] = [];
    let index = 1;

    // Helper to insert text
    const insertText = (text: string, style?: any) => {
      requests.push({
        insertText: {
          location: { index },
          text: text,
        },
      });

      if (style) {
        requests.push({
          updateTextStyle: {
            range: {
              startIndex: index,
              endIndex: index + text.length,
            },
            textStyle: style,
            fields: Object.keys(style).join(','),
          },
        });
      }

      index += text.length;
    };

    // Header - Name
    const fullName =
      `${cvData.personalInfo.firstName} ${cvData.personalInfo.middleName} ${cvData.personalInfo.lastName}`.trim();
    insertText(fullName + '\n', {
      bold: true,
      fontSize: { magnitude: 20, unit: 'PT' },
    });

    // Contact Information
    const contact = `${cvData.personalInfo.email} | ${cvData.personalInfo.countryCode}${cvData.personalInfo.phoneNumber}\n`;
    insertText(contact);

    if (cvData.personalInfo.linkedInUsername || cvData.personalInfo.githubUsername) {
      let links = '';
      if (cvData.personalInfo.linkedInUsername) {
        links += `linkedin.com/in/${cvData.personalInfo.linkedInUsername}`;
      }
      if (cvData.personalInfo.githubUsername) {
        links += `${links ? ' | ' : ''}github.com/${cvData.personalInfo.githubUsername}`;
      }
      insertText(links + '\n');
    }

    insertText('\n');

    // Summary
    if (cvData.personalInfo.summary) {
      insertText('SUMMARY\n', {
        bold: true,
        fontSize: { magnitude: 14, unit: 'PT' },
      });
      insertText(cvData.personalInfo.summary + '\n\n');
    }

    // Skills
    if (cvData.skills.length > 0) {
      insertText('SKILLS\n', {
        bold: true,
        fontSize: { magnitude: 14, unit: 'PT' },
      });
      insertText(cvData.skills.join(' • ') + '\n\n');
    }

    // Experience
    if (cvData.experience.length > 0) {
      insertText('EXPERIENCE\n', {
        bold: true,
        fontSize: { magnitude: 14, unit: 'PT' },
      });

      cvData.experience.forEach((exp) => {
        insertText(`${exp.title} | ${exp.company}\n`, { bold: true });
        insertText(
          `${exp.startDate} - ${exp.currentlyWorking ? 'Present' : exp.endDate || 'Present'} | ${exp.location}\n`,
          { italic: true }
        );
        if (exp.description) {
          insertText(exp.description + '\n');
        }
        insertText('\n');
      });
    }

    // Education
    if (cvData.education.length > 0) {
      insertText('EDUCATION\n', {
        bold: true,
        fontSize: { magnitude: 14, unit: 'PT' },
      });

      cvData.education.forEach((edu) => {
        insertText(edu.school + '\n', { bold: true });
        insertText(`${edu.degree} in ${edu.fieldOfStudy}\n`);
        insertText(`${edu.startDate} - ${edu.currentlyStudying ? 'Expected' : edu.endDate}\n`, {
          italic: true,
        });
        if (edu.description) {
          insertText(edu.description + '\n');
        }
        insertText('\n');
      });
    }

    // Certifications
    if (cvData.certifications.length > 0) {
      insertText('CERTIFICATIONS\n', {
        bold: true,
        fontSize: { magnitude: 14, unit: 'PT' },
      });

      cvData.certifications.forEach((cert) => {
        insertText(`${cert.name}\n`, { bold: true });
        insertText(`${cert.issuingOrganization}`);
        if (cert.issueDate) {
          insertText(` | Issued: ${cert.issueDate}`);
        }
        insertText('\n\n');
      });
    }

    // Projects
    if (cvData.projects.length > 0) {
      insertText('PROJECTS\n', {
        bold: true,
        fontSize: { magnitude: 14, unit: 'PT' },
      });

      cvData.projects.forEach((proj) => {
        insertText(proj.name + '\n', { bold: true });
        if (proj.associatedWith) {
          insertText(proj.associatedWith + '\n', { italic: true });
        }
        if (proj.description) {
          insertText(proj.description + '\n');
        }
        insertText('\n');
      });
    }

    return requests;
  }

  /**
   * Export CV to Google Sheets (structured data format)
   */
  static async exportToGoogleSheets(cvData: CVData): Promise<GoogleDriveFile> {
    await this.ensureAuthenticated();

    const spreadsheet = {
      properties: {
        title: `${cvData.personalInfo.firstName}_${cvData.personalInfo.lastName}_CV_Data_${new Date().toISOString().split('T')[0]}`,
      },
      sheets: [
        {
          properties: { title: 'Personal Info' },
          data: [
            {
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: 'Field' } },
                    { userEnteredValue: { stringValue: 'Value' } },
                  ],
                },
                {
                  values: [
                    { userEnteredValue: { stringValue: 'First Name' } },
                    { userEnteredValue: { stringValue: cvData.personalInfo.firstName } },
                  ],
                },
                {
                  values: [
                    { userEnteredValue: { stringValue: 'Last Name' } },
                    { userEnteredValue: { stringValue: cvData.personalInfo.lastName } },
                  ],
                },
                {
                  values: [
                    { userEnteredValue: { stringValue: 'Email' } },
                    { userEnteredValue: { stringValue: cvData.personalInfo.email } },
                  ],
                },
                {
                  values: [
                    { userEnteredValue: { stringValue: 'Phone' } },
                    {
                      userEnteredValue: {
                        stringValue: `${cvData.personalInfo.countryCode}${cvData.personalInfo.phoneNumber}`,
                      },
                    },
                  ],
                },
                {
                  values: [
                    { userEnteredValue: { stringValue: 'LinkedIn' } },
                    { userEnteredValue: { stringValue: cvData.personalInfo.linkedInUsername } },
                  ],
                },
                {
                  values: [
                    { userEnteredValue: { stringValue: 'GitHub' } },
                    { userEnteredValue: { stringValue: cvData.personalInfo.githubUsername } },
                  ],
                },
                {
                  values: [
                    { userEnteredValue: { stringValue: 'Summary' } },
                    { userEnteredValue: { stringValue: cvData.personalInfo.summary } },
                  ],
                },
              ],
            },
          ],
        },
        {
          properties: { title: 'Skills' },
          data: [
            {
              rowData: [
                { values: [{ userEnteredValue: { stringValue: 'Skill' } }] },
                ...cvData.skills.map((skill) => ({
                  values: [{ userEnteredValue: { stringValue: skill } }],
                })),
              ],
            },
          ],
        },
        {
          properties: { title: 'Experience' },
          data: [
            {
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: 'Title' } },
                    { userEnteredValue: { stringValue: 'Company' } },
                    { userEnteredValue: { stringValue: 'Start Date' } },
                    { userEnteredValue: { stringValue: 'End Date' } },
                    { userEnteredValue: { stringValue: 'Location' } },
                    { userEnteredValue: { stringValue: 'Description' } },
                  ],
                },
                ...cvData.experience.map((exp) => ({
                  values: [
                    { userEnteredValue: { stringValue: exp.title } },
                    { userEnteredValue: { stringValue: exp.company } },
                    { userEnteredValue: { stringValue: exp.startDate } },
                    { userEnteredValue: { stringValue: exp.endDate } },
                    { userEnteredValue: { stringValue: exp.location } },
                    { userEnteredValue: { stringValue: exp.description } },
                  ],
                })),
              ],
            },
          ],
        },
        {
          properties: { title: 'Education' },
          data: [
            {
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: 'School' } },
                    { userEnteredValue: { stringValue: 'Degree' } },
                    { userEnteredValue: { stringValue: 'Field of Study' } },
                    { userEnteredValue: { stringValue: 'Start Date' } },
                    { userEnteredValue: { stringValue: 'End Date' } },
                    { userEnteredValue: { stringValue: 'Grade' } },
                  ],
                },
                ...cvData.education.map((edu) => ({
                  values: [
                    { userEnteredValue: { stringValue: edu.school } },
                    { userEnteredValue: { stringValue: edu.degree } },
                    { userEnteredValue: { stringValue: edu.fieldOfStudy } },
                    { userEnteredValue: { stringValue: edu.startDate } },
                    { userEnteredValue: { stringValue: edu.endDate } },
                    { userEnteredValue: { stringValue: edu.grade } },
                  ],
                })),
              ],
            },
          ],
        },
      ],
    };

    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(spreadsheet),
    });

    const result = await response.json();

    return {
      id: result.spreadsheetId,
      name: spreadsheet.properties.title,
      mimeType: 'application/vnd.google-apps.spreadsheet',
      webViewLink: result.spreadsheetUrl,
      createdTime: new Date().toISOString(),
    };
  }

  /**
   * Export CV to Google Slides (presentation format)
   */
  static async exportToGoogleSlides(cvData: CVData): Promise<GoogleDriveFile> {
    await this.ensureAuthenticated();

    // Create a new presentation
    const createResponse = await fetch('https://slides.googleapis.com/v1/presentations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `${cvData.personalInfo.firstName}_${cvData.personalInfo.lastName}_Resume_Presentation_${new Date().toISOString().split('T')[0]}`,
      }),
    });

    const presentation = await createResponse.json();
    const presentationId = presentation.presentationId;

    // Build slides content
    const requests = this.buildSlidesContent(cvData, presentation.slides[0].objectId);

    // Update the presentation with content
    await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    return {
      id: presentationId,
      name: presentation.title,
      mimeType: 'application/vnd.google-apps.presentation',
      webViewLink: `https://docs.google.com/presentation/d/${presentationId}/edit`,
      createdTime: new Date().toISOString(),
    };
  }

  /**
   * Build Google Slides content structure
   */
  private static buildSlidesContent(cvData: CVData, firstSlideId: string): any[] {
    const requests: any[] = [];

    // Update first slide with title
    const fullName =
      `${cvData.personalInfo.firstName} ${cvData.personalInfo.middleName} ${cvData.personalInfo.lastName}`.trim();

    requests.push({
      createShape: {
        objectId: 'titleTextBox',
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: firstSlideId,
          size: {
            width: { magnitude: 6000000, unit: 'EMU' },
            height: { magnitude: 1000000, unit: 'EMU' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 1000000,
            translateY: 1000000,
            unit: 'EMU',
          },
        },
      },
    });

    requests.push({
      insertText: {
        objectId: 'titleTextBox',
        text: fullName,
      },
    });

    // Add contact info
    const contactText = `${cvData.personalInfo.email} | ${cvData.personalInfo.countryCode}${cvData.personalInfo.phoneNumber}`;

    requests.push({
      createShape: {
        objectId: 'contactTextBox',
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: firstSlideId,
          size: {
            width: { magnitude: 6000000, unit: 'EMU' },
            height: { magnitude: 500000, unit: 'EMU' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 1000000,
            translateY: 2200000,
            unit: 'EMU',
          },
        },
      },
    });

    requests.push({
      insertText: {
        objectId: 'contactTextBox',
        text: contactText,
      },
    });

    // Create slides for each section
    let slideIndex = 0;

    // Skills slide
    if (cvData.skills.length > 0) {
      const slideId = `slide_skills_${slideIndex++}`;
      requests.push({
        createSlide: {
          objectId: slideId,
          slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' },
        },
      });

      requests.push({
        insertText: {
          objectId: slideId,
          text: 'Skills\n\n' + cvData.skills.join(' • '),
        },
      });
    }

    // Experience slides
    cvData.experience.forEach((exp) => {
      const slideId = `slide_exp_${slideIndex++}`;
      requests.push({
        createSlide: {
          objectId: slideId,
          slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' },
        },
      });

      const expText = `${exp.title} - ${exp.company}\n\n${exp.startDate} - ${exp.currentlyWorking ? 'Present' : exp.endDate || 'Present'}\n${exp.location}\n\n${exp.description}`;

      requests.push({
        insertText: {
          objectId: slideId,
          text: expText,
        },
      });
    });

    // Education slides
    cvData.education.forEach((edu) => {
      const slideId = `slide_edu_${slideIndex++}`;
      requests.push({
        createSlide: {
          objectId: slideId,
          slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' },
        },
      });

      const eduText = `${edu.school}\n\n${edu.degree} in ${edu.fieldOfStudy}\n${edu.startDate} - ${edu.currentlyStudying ? 'Expected' : edu.endDate}\n\n${edu.description}`;

      requests.push({
        insertText: {
          objectId: slideId,
          text: eduText,
        },
      });
    });

    return requests;
  }

  /**
   * List files in Google Drive
   */
  static async listFiles(query?: string): Promise<GoogleDriveFile[]> {
    await this.ensureAuthenticated();

    const queryParam =
      query ||
      "mimeType='application/vnd.google-apps.document' or mimeType='application/vnd.google-apps.spreadsheet' or mimeType='application/vnd.google-apps.presentation'";

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(queryParam)}&fields=files(id,name,mimeType,webViewLink,createdTime)&orderBy=createdTime desc`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    const result = await response.json();
    return result.files || [];
  }

  /**
   * Delete a file from Google Drive
   */
  static async deleteFile(fileId: string): Promise<boolean> {
    await this.ensureAuthenticated();

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    return response.ok;
  }

  /**
   * Share a file with specific email
   */
  static async shareFile(
    fileId: string,
    email: string,
    role: 'reader' | 'writer' = 'reader'
  ): Promise<boolean> {
    await this.ensureAuthenticated();

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: role,
          type: 'user',
          emailAddress: email,
        }),
      }
    );

    return response.ok;
  }

  /**
   * Create a folder in Google Drive
   */
  static async createFolder(name: string): Promise<GoogleDriveFile> {
    await this.ensureAuthenticated();

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    const result = await response.json();
    return {
      id: result.id,
      name: result.name,
      mimeType: result.mimeType,
      webViewLink: result.webViewLink,
      createdTime: new Date().toISOString(),
    };
  }
}
