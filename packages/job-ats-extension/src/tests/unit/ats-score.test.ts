/**
 * Unit tests for ATS score calculation
 */

import { describe, it, expect } from 'vitest';
import { extractKeywords } from '../../content/core/extract-jd';

describe('ATS Score Calculation', () => {
  it('should extract keywords from job description', () => {
    const jd = {
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'Remote',
      description: 'We are looking for a senior software engineer with React, TypeScript, and Node.js experience. Strong problem-solving skills required.',
      requirements: [
        '5+ years of React experience',
        'Expert in TypeScript',
        'Node.js backend development',
        'Strong communication skills',
      ],
      responsibilities: [
        'Build scalable applications',
        'Code reviews and mentoring',
        'Architecture decisions',
      ],
      benefits: ['Health insurance', 'Remote work', '401k'],
      url: 'https://example.com/job',
    };

    const keywords = extractKeywords(jd);
    
    expect(keywords.length).toBeGreaterThan(0);
    expect(keywords).toContain('react');
    expect(keywords).toContain('typescript');
    expect(keywords).toContain('node');
  });

  it('should handle empty requirements', () => {
    const jd = {
      title: 'Job Title',
      company: 'Company',
      location: 'Location',
      description: 'Short description',
      requirements: [],
      responsibilities: [],
      benefits: [],
      url: 'https://example.com/job',
    };

    const keywords = extractKeywords(jd);
    expect(Array.isArray(keywords)).toBe(true);
  });

  it('should filter out short words', () => {
    const jd = {
      title: 'A B C Test Job',
      company: 'Co',
      location: 'NY',
      description: 'We are seeking an experienced developer with Python and Java skills.',
      requirements: ['Python', 'Java', 'SQL'],
      responsibilities: ['Code', 'Test', 'Deploy'],
      benefits: [],
      url: 'https://example.com/job',
    };

    const keywords = extractKeywords(jd);
    
    // Should not include single/double letter words
    expect(keywords.every(k => k.length > 2)).toBe(true);
  });

  it('should extract frequently mentioned keywords', () => {
    const jd = {
      title: 'Python Developer',
      company: 'Company',
      location: 'Location',
      description: 'Python Python Python developer needed. Experience with Python frameworks required.',
      requirements: ['Python', 'Python experience'],
      responsibilities: ['Write Python code'],
      benefits: [],
      url: 'https://example.com/job',
    };

    const keywords = extractKeywords(jd);
    
    // 'python' should appear as a top keyword due to frequency
    expect(keywords.slice(0, 10)).toContain('python');
  });
});
