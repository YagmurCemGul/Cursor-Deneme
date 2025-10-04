import { analyzeTalentGap, getSkillMatchPercentage, groupSkillsByCategory, SkillGap } from '../talentGapAnalyzer';
import { CVData } from '../../types';

describe('Talent Gap Analyzer', () => {
  const mockCV: CVData = {
    personalInfo: {
      firstName: 'Jane',
      middleName: '',
      lastName: 'Smith',
      email: 'jane@example.com',
      linkedInUsername: '',
      portfolioUrl: '',
      githubUsername: '',
      whatsappLink: '',
      phoneNumber: '',
      countryCode: '',
      summary: 'Full-stack developer',
    },
    skills: ['JavaScript', 'React', 'Node.js', 'AWS', 'Docker'],
    experience: [
      {
        id: '1',
        title: 'Senior Developer',
        company: 'Tech Co',
        employmentType: 'Full-time',
        startDate: '2019-01',
        endDate: '',
        location: 'Remote',
        locationType: 'Remote',
        description: 'Built scalable applications',
        skills: ['React', 'Node.js'],
      }
    ],
    education: [
      {
        id: '1',
        school: 'University',
        degree: "Bachelor's Degree",
        fieldOfStudy: 'Computer Science',
        startDate: '2015-09',
        endDate: '2019-05',
        grade: '3.7',
        activities: '',
        description: '',
        skills: [],
      }
    ],
    certifications: [],
    projects: [
      {
        id: '1',
        name: 'E-commerce Platform',
        description: 'Built with React and Node.js',
        startDate: '2020-01',
        endDate: '2020-06',
        currentlyWorking: false,
        associatedWith: 'Personal',
        skills: ['React', 'Node.js'],
      }
    ],
    customQuestions: [],
  };

  const jobDescription = `
    Senior Full Stack Developer
    
    Required Skills:
    - JavaScript, TypeScript
    - React, Node.js
    - AWS
    - Docker
    - PostgreSQL
    - REST API
    - Agile
    
    Preferred:
    - Kubernetes
    - Python
  `;

  describe('analyzeTalentGap', () => {
    it('should analyze talent gaps between CV and job requirements', () => {
      const analysis = analyzeTalentGap(mockCV, jobDescription);
      
      expect(analysis).toBeDefined();
      expect(analysis.overallMatch).toBeGreaterThanOrEqual(0);
      expect(analysis.overallMatch).toBeLessThanOrEqual(100);
      expect(analysis.matchedSkills).toBeInstanceOf(Array);
      expect(analysis.missingSkills).toBeInstanceOf(Array);
      expect(analysis.additionalSkills).toBeInstanceOf(Array);
    });

    it('should identify matched skills', () => {
      const analysis = analyzeTalentGap(mockCV, jobDescription);
      
      expect(analysis.matchedSkills.length).toBeGreaterThan(0);
      expect(analysis.matchedSkills.every(s => s.hasSkill)).toBe(true);
    });

    it('should identify missing skills', () => {
      const analysis = analyzeTalentGap(mockCV, jobDescription);
      
      // Should have some missing skills since CV doesn't have TypeScript, PostgreSQL, etc.
      expect(analysis.missingSkills.length).toBeGreaterThan(0);
      expect(analysis.missingSkills.every(s => !s.hasSkill)).toBe(true);
    });

    it('should provide recommendations', () => {
      const analysis = analyzeTalentGap(mockCV, jobDescription);
      
      expect(analysis.recommendations).toBeInstanceOf(Array);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('should identify strength areas', () => {
      const analysis = analyzeTalentGap(mockCV, jobDescription);
      
      expect(analysis.strengthAreas).toBeInstanceOf(Array);
    });

    it('should identify improvement areas', () => {
      const analysis = analyzeTalentGap(mockCV, jobDescription);
      
      expect(analysis.improvementAreas).toBeInstanceOf(Array);
    });
  });

  describe('getSkillMatchPercentage', () => {
    it('should return 100% for exact match', () => {
      const skill: SkillGap = {
        skill: 'React',
        required: true,
        hasSkill: true,
        matchType: 'exact',
      };
      
      expect(getSkillMatchPercentage(skill)).toBe(100);
    });

    it('should return 50% for partial match', () => {
      const skill: SkillGap = {
        skill: 'React',
        required: true,
        hasSkill: true,
        matchType: 'partial',
      };
      
      expect(getSkillMatchPercentage(skill)).toBe(50);
    });

    it('should return 0% for missing skill', () => {
      const skill: SkillGap = {
        skill: 'React',
        required: true,
        hasSkill: false,
        matchType: 'missing',
      };
      
      expect(getSkillMatchPercentage(skill)).toBe(0);
    });
  });

  describe('groupSkillsByCategory', () => {
    it('should group skills by category', () => {
      const skills: SkillGap[] = [
        {
          skill: 'React',
          required: true,
          hasSkill: true,
          matchType: 'exact',
        },
        {
          skill: 'Leadership',
          required: false,
          hasSkill: true,
          matchType: 'exact',
        },
        {
          skill: 'Node.js',
          required: true,
          hasSkill: true,
          matchType: 'exact',
        },
      ];
      
      const grouped = groupSkillsByCategory(skills);
      
      expect(grouped).toBeInstanceOf(Map);
      expect(grouped.size).toBeGreaterThan(0);
    });
  });
});
