import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
// Import the pdf.js worker as a bundled asset and set workerSrc explicitly
// to avoid protocol-relative CDN URLs inside a Chrome Extension context.
// @ts-ignore - treated as asset URL by webpack
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js';

// Ensure the worker script is correctly referenced for pdf.js
// This avoids "Setting up fake worker failed" errors.
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker as unknown as string;
import { CVData } from '../types';

export class FileParser {
  // Ensure pdf.js worker is resolved from bundled assets, not a CDN
  // This avoids the "fake worker" fallback and CSP/network issues in extensions
  static configurePdfJsWorker(): void {
    try {
      // Prefer explicit worker script URL (UMD build) for broad compatibility
      const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerUrl;
    } catch (error) {
      // If the above fails (unlikely in modern bundlers), silently continue; parsing may still work
      // eslint-disable-next-line no-console
      console.warn('Failed to configure pdf.js workerSrc; falling back to default', error);
    }
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
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return this.extractCVData(fullText);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw error;
    }
  }

  private static async parseDOCX(file: File): Promise<Partial<CVData>> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return this.extractCVData(result.value);
    } catch (error) {
      console.error('Error parsing DOCX:', error);
      throw error;
    }
  }

  private static extractCVData(text: string): Partial<CVData> {
    // Basic extraction logic - in a real implementation, this would use NLP or AI
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const linkedInRegex = /linkedin\.com\/in\/([\w-]+)/i;
    const githubRegex = /github\.com\/([\w-]+)/i;

    const emails = text.match(emailRegex);
    const phones = text.match(phoneRegex);
    const linkedInMatch = text.match(linkedInRegex);
    const githubMatch = text.match(githubRegex);

    // Extract name (usually the first line or largest text)
    const lines = text.split('\n').filter(line => line.trim());
    const possibleName = lines[0] || '';
    const nameParts = possibleName.trim().split(' ');

    return {
      personalInfo: {
        firstName: nameParts[0] || '',
        middleName: nameParts.length > 2 ? nameParts[1] : '',
        lastName: nameParts[nameParts.length - 1] || '',
        email: emails?.[0] || '',
        linkedInUsername: linkedInMatch?.[1] || '',
        portfolioUrl: '',
        githubUsername: githubMatch?.[1] || '',
        whatsappLink: '',
        phoneNumber: phones?.[0] || '',
        countryCode: '',
        summary: ''
      },
      skills: [],
      experience: [],
      education: [],
      certifications: [],
      projects: [],
      customQuestions: []
    };
  }
}
