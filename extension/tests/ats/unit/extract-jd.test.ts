/**
 * Unit tests for JD extraction
 */

import { describe, it, expect } from 'vitest';
import { extractKeywords } from '../../content/core/extract-jd';

describe('JD Extractor', () => {
  it('should extract keywords from job description', () => {
    const jd = {
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'Remote',
      description: 'We are looking for a senior software engineer with React and TypeScript experience',
      requirements: ['5+ years React', 'TypeScript', 'Node.js'],
      responsibilities: ['Build scalable applications', 'Code reviews'],
      benefits: [],
      url: 'https://example.com/job',
    };

    const keywords = extractKeywords(jd);
    expect(keywords.length).toBeGreaterThan(0);
    expect(keywords.some(kw => ['react', 'typescript', 'node'].includes(kw))).toBe(true);
  });

  it('should handle empty requirements', () => {
    const jd = {
      title: 'Job',
      company: 'Company',
      location: 'Location',
      description: 'Short description',
      requirements: [],
      responsibilities: [],
      benefits: [],
      url: 'https://example.com',
    };

    const keywords = extractKeywords(jd);
    expect(Array.isArray(keywords)).toBe(true);
  });
});
