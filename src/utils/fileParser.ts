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
    // Basic extraction logic - lightweight heuristics
    const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
    const phoneRegex = /(\+\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3}[\s-]?\d{2,4}[\s-]?\d{2,4}/g;
    const linkedInRegex = /(linkedin\.com\/in\/|@?linkedin:\s*)([\w-]+)/i;
    const githubRegex = /(github\.com\/|@?github:\s*)([\w-]+)/i;
    const portfolioRegex = /(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-._~:?#[\]@!$&'()*+,;=]*)?/i;

    const emails = text.match(emailRegex);
    const phones = text.match(phoneRegex);
    const linkedInMatch = text.match(linkedInRegex);
    const githubMatch = text.match(githubRegex);

    // Extract name heuristically: look for a line with 2-3 words with initial caps
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const nameLine = lines.find(l => /^(?:[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\s){1,2}[A-ZÇĞİÖŞÜ][a-zçğıöşü]+$/.test(l)) || lines[0] || '';
    const nameParts = nameLine.trim().split(/\s+/);

    // Look for a Summary section
    const summaryIdx = lines.findIndex(l => /^(summary|about me|hakkımda)/i.test(l));
    const summary = summaryIdx >= 0 ? lines.slice(summaryIdx + 1, summaryIdx + 6).join(' ').slice(0, 500) : '';

    // Extract a simple skills line if present
    const skillsLine = lines.find(l => /^skills?:/i.test(l));
    const parsedSkills = skillsLine ? skillsLine.split(/skills?:/i)[1].split(/[•,;|]/).map(s => s.trim()).filter(Boolean) : [];

    const portfolioMatch = text.match(/(portfolio|website|site):?\s*(.*)/i);
    const portfolioUrl = portfolioMatch ? (portfolioMatch[2].match(portfolioRegex)?.[0] || '') : '';

    const firstPhone = phones?.[0] || '';
    const countryCode = (firstPhone.match(/^(\+\d{1,3})/) || [])[1] || '';
    const phoneNumber = firstPhone.replace(countryCode, '').trim();

    return {
      personalInfo: {
        firstName: nameParts[0] || '',
        middleName: nameParts.length === 3 ? nameParts[1] : '',
        lastName: nameParts[nameParts.length - 1] || '',
        email: emails?.[0] || '',
        linkedInUsername: linkedInMatch ? (linkedInMatch[2] || '').replace(/^\//, '') : '',
        portfolioUrl: portfolioUrl,
        githubUsername: githubMatch ? (githubMatch[2] || '').replace(/^\//, '') : '',
        whatsappLink: '',
        phoneNumber,
        countryCode,
        summary
      },
      skills: parsedSkills,
      experience: [],
      education: [],
      certifications: [],
      projects: [],
      customQuestions: []
    };
  }
}
