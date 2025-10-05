import { ResumeProfile } from './types';

export interface ProfileTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'tech' | 'business' | 'creative' | 'other';
  defaultSkills: string[];
  sampleExperience?: {
    title: string;
    description: string;
  };
}

export const PROFILE_TEMPLATES: ProfileTemplate[] = [
  {
    id: 'frontend',
    name: 'Frontend Developer',
    description: 'Web UI/UX development with modern frameworks',
    icon: '🎨',
    category: 'tech',
    defaultSkills: [
      'React', 'TypeScript', 'JavaScript', 'HTML/CSS',
      'Redux', 'Next.js', 'Tailwind CSS', 'Git',
      'Responsive Design', 'REST APIs', 'GraphQL',
      'Jest', 'Webpack', 'UI/UX Design'
    ],
    sampleExperience: {
      title: 'Frontend Developer',
      description: 'Developed responsive web applications using React and TypeScript, implementing modern UI/UX designs and ensuring cross-browser compatibility.'
    }
  },
  {
    id: 'backend',
    name: 'Backend Developer',
    description: 'Server-side development and API design',
    icon: '⚙️',
    category: 'tech',
    defaultSkills: [
      'Node.js', 'Python', 'Java', 'SQL', 'MongoDB',
      'REST APIs', 'GraphQL', 'Docker', 'Kubernetes',
      'AWS', 'Microservices', 'Redis', 'PostgreSQL',
      'CI/CD', 'System Design', 'Testing'
    ],
    sampleExperience: {
      title: 'Backend Developer',
      description: 'Designed and implemented scalable RESTful APIs, optimized database queries, and maintained cloud infrastructure with 99.9% uptime.'
    }
  },
  {
    id: 'fullstack',
    name: 'Full-Stack Developer',
    description: 'End-to-end web application development',
    icon: '💻',
    category: 'tech',
    defaultSkills: [
      'React', 'Node.js', 'TypeScript', 'JavaScript',
      'MongoDB', 'PostgreSQL', 'Docker', 'AWS',
      'REST APIs', 'Git', 'Agile', 'Redux',
      'Express.js', 'Next.js', 'CI/CD', 'Testing'
    ],
    sampleExperience: {
      title: 'Full-Stack Developer',
      description: 'Built end-to-end web applications from UI design to database architecture, ensuring seamless user experience and robust backend systems.'
    }
  },
  {
    id: 'mobile',
    name: 'Mobile Developer',
    description: 'iOS and Android app development',
    icon: '📱',
    category: 'tech',
    defaultSkills: [
      'React Native', 'Flutter', 'Swift', 'Kotlin',
      'iOS Development', 'Android Development', 'Firebase',
      'REST APIs', 'Mobile UI/UX', 'App Store', 'Google Play',
      'Push Notifications', 'SQLite', 'Git'
    ],
    sampleExperience: {
      title: 'Mobile Developer',
      description: 'Developed cross-platform mobile applications with smooth performance, intuitive UI, and seamless integration with backend services.'
    }
  },
  {
    id: 'devops',
    name: 'DevOps Engineer',
    description: 'Infrastructure and deployment automation',
    icon: '🔧',
    category: 'tech',
    defaultSkills: [
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
      'Jenkins', 'GitLab CI', 'Terraform', 'Ansible',
      'Linux', 'Bash', 'Python', 'Monitoring',
      'CI/CD', 'Networking', 'Security'
    ],
    sampleExperience: {
      title: 'DevOps Engineer',
      description: 'Automated deployment pipelines, managed cloud infrastructure, and implemented monitoring solutions for high-availability systems.'
    }
  },
  {
    id: 'data-science',
    name: 'Data Scientist',
    description: 'Data analysis and machine learning',
    icon: '📊',
    category: 'tech',
    defaultSkills: [
      'Python', 'R', 'SQL', 'Machine Learning', 'Deep Learning',
      'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn',
      'Data Visualization', 'Statistics', 'Big Data', 'Spark',
      'A/B Testing', 'Neural Networks'
    ],
    sampleExperience: {
      title: 'Data Scientist',
      description: 'Built predictive models and conducted data analysis to drive business decisions, achieving 95% model accuracy on production data.'
    }
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    description: 'Product strategy and roadmap planning',
    icon: '📋',
    category: 'business',
    defaultSkills: [
      'Product Strategy', 'Roadmap Planning', 'Agile', 'Scrum',
      'User Research', 'A/B Testing', 'Analytics', 'SQL',
      'Wireframing', 'Stakeholder Management', 'JIRA',
      'Market Research', 'KPIs', 'User Stories'
    ],
    sampleExperience: {
      title: 'Product Manager',
      description: 'Led product development from conception to launch, coordinating cross-functional teams and achieving 150% user growth in first year.'
    }
  },
  {
    id: 'ui-ux-designer',
    name: 'UI/UX Designer',
    description: 'User interface and experience design',
    icon: '🎨',
    category: 'creative',
    defaultSkills: [
      'Figma', 'Adobe XD', 'Sketch', 'Prototyping',
      'User Research', 'Wireframing', 'Visual Design',
      'Interaction Design', 'Usability Testing', 'HTML/CSS',
      'Design Systems', 'Responsive Design', 'Accessibility'
    ],
    sampleExperience: {
      title: 'UI/UX Designer',
      description: 'Designed intuitive user interfaces and conducted user research to create engaging experiences, improving user satisfaction by 40%.'
    }
  },
  {
    id: 'marketing',
    name: 'Digital Marketing Specialist',
    description: 'Digital marketing and growth strategies',
    icon: '📈',
    category: 'business',
    defaultSkills: [
      'SEO', 'SEM', 'Google Analytics', 'Social Media Marketing',
      'Content Marketing', 'Email Marketing', 'PPC',
      'Conversion Optimization', 'Google Ads', 'Facebook Ads',
      'Marketing Automation', 'A/B Testing', 'Copywriting'
    ],
    sampleExperience: {
      title: 'Digital Marketing Specialist',
      description: 'Executed multi-channel marketing campaigns, optimized conversion funnels, and increased organic traffic by 200% year-over-year.'
    }
  },
  {
    id: 'blank',
    name: 'Blank Profile',
    description: 'Start from scratch with no pre-filled data',
    icon: '📄',
    category: 'other',
    defaultSkills: [],
  }
];

export function createProfileFromTemplate(
  template: ProfileTemplate,
  personalInfo?: {
    firstName: string;
    lastName: string;
    email: string;
  }
): ResumeProfile {
  return {
    id: crypto.randomUUID(),
    profileName: template.name,
    personal: {
      firstName: personalInfo?.firstName || '',
      lastName: personalInfo?.lastName || '',
      email: personalInfo?.email || '',
      summary: template.sampleExperience?.description || '',
    },
    skills: [...template.defaultSkills],
    experience: template.sampleExperience ? [{
      title: template.sampleExperience.title,
      company: '',
      startDate: '',
      description: template.sampleExperience.description,
      employmentType: 'Full-time',
    }] : [],
    education: [],
    licenses: [],
    projects: [],
    extraQuestions: [],
    templates: [],
  };
}

export function duplicateProfile(profile: ResumeProfile, newName?: string): ResumeProfile {
  return {
    ...profile,
    id: crypto.randomUUID(),
    profileName: newName || `${profile.profileName} (Copy)`,
  };
}

export function compareProfiles(profile1: ResumeProfile, profile2: ResumeProfile) {
  return {
    skills: {
      profile1Only: profile1.skills.filter(s => !profile2.skills.includes(s)),
      profile2Only: profile2.skills.filter(s => !profile1.skills.includes(s)),
      common: profile1.skills.filter(s => profile2.skills.includes(s)),
    },
    experience: {
      profile1Count: profile1.experience.length,
      profile2Count: profile2.experience.length,
    },
    education: {
      profile1Count: profile1.education.length,
      profile2Count: profile2.education.length,
    },
    completeness: {
      profile1: calculateCompletenessScore(profile1),
      profile2: calculateCompletenessScore(profile2),
    }
  };
}

function calculateCompletenessScore(profile: ResumeProfile): number {
  let score = 0;
  const weights = {
    personal: 30,
    skills: 20,
    experience: 25,
    education: 15,
    projects: 10,
  };

  // Personal info
  if (profile.personal.firstName && profile.personal.lastName && profile.personal.email) {
    score += weights.personal * 0.6;
  }
  if (profile.personal.phone) score += weights.personal * 0.2;
  if (profile.personal.summary) score += weights.personal * 0.2;

  // Skills
  if (profile.skills.length >= 5) score += weights.skills;
  else score += (profile.skills.length / 5) * weights.skills;

  // Experience
  if (profile.experience.length >= 2) score += weights.experience;
  else score += (profile.experience.length / 2) * weights.experience;

  // Education
  if (profile.education.length >= 1) score += weights.education;

  // Projects
  if (profile.projects.length >= 1) score += weights.projects;

  return Math.round(score);
}
