import type { Meta, StoryObj } from '@storybook/react';
import { ATSScoreCard } from './ATSScoreCard';
import { CVData } from '../types';

const meta: Meta<typeof ATSScoreCard> = {
  title: 'Components/ATSScoreCard',
  component: ATSScoreCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays the ATS (Applicant Tracking System) compatibility score with detailed metrics and improvement suggestions.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ATSScoreCard>;

const minimalCV: CVData = {
  personalInfo: {
    firstName: 'John',
    middleName: '',
    lastName: 'Doe',
    email: 'john@example.com',
    linkedInUsername: '',
    portfolioUrl: '',
    githubUsername: '',
    whatsappLink: '',
    phoneNumber: '',
    countryCode: '',
    summary: 'Basic summary',
  },
  skills: ['JavaScript'],
  experience: [],
  education: [],
  certifications: [],
  projects: [],
  customQuestions: [],
};

const goodCV: CVData = {
  personalInfo: {
    firstName: 'Jane',
    middleName: 'M',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    linkedInUsername: 'janesmith',
    portfolioUrl: 'https://janesmith.dev',
    githubUsername: 'janesmith',
    whatsappLink: '',
    phoneNumber: '+1234567890',
    countryCode: '',
    summary: 'Experienced software engineer with 5+ years of expertise in full-stack development.',
  },
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS'],
  experience: [
    {
      id: '1',
      title: 'Senior Software Engineer',
      employmentType: 'Full-time',
      company: 'Tech Corp',
      startDate: '2020-01',
      endDate: '',
      location: 'San Francisco, CA',
      locationType: 'Remote',
      description: 'Led development of microservices architecture',
      skills: ['React', 'Node.js', 'AWS'],
    },
  ],
  education: [
    {
      id: '1',
      school: 'University',
      degree: "Bachelor's Degree",
      fieldOfStudy: 'Computer Science',
      startDate: '2014-09',
      endDate: '2018-05',
      grade: '3.8',
      activities: '',
      description: '',
      skills: [],
    },
  ],
  certifications: [],
  projects: [],
  customQuestions: [],
};

const jobDescription = `
Senior Full Stack Engineer

Required Skills:
- JavaScript, TypeScript
- React, Node.js
- AWS
- 5+ years experience

Responsibilities:
- Build scalable applications
- Lead technical initiatives
- Mentor junior engineers
`;

export const WithMinimalCV: Story = {
  args: {
    cvData: minimalCV,
    jobDescription: '',
    language: 'en',
  },
};

export const WithGoodCV: Story = {
  args: {
    cvData: goodCV,
    jobDescription: jobDescription,
    language: 'en',
  },
};

export const WithJobDescription: Story = {
  args: {
    cvData: goodCV,
    jobDescription: jobDescription,
    language: 'en',
  },
};

export const TurkishLanguage: Story = {
  args: {
    cvData: goodCV,
    jobDescription: jobDescription,
    language: 'tr',
  },
};
