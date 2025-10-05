/**
 * Industry-Specific Prompt Library
 * Optimized prompts for different industries and roles
 */

export interface IndustryPrompt {
  id: string;
  name: string;
  category: 'technology' | 'business' | 'creative' | 'healthcare' | 'engineering' | 'education';
  roles: string[];
  keywordDensity: number; // 0.05 - 0.15 (5% - 15%)
  toneGuidelines: string[];
  commonTerms: string[];
  avoidTerms: string[];
  successMetrics: string[];
  resumeStructure: {
    summaryFocus: string;
    experienceEmphasis: string[];
    skillsPresentation: string;
  };
  atsOptimization: {
    keywords: string[];
    phrases: string[];
    formatting: string[];
  };
}

/**
 * Comprehensive Industry Prompt Library
 */
export const INDUSTRY_PROMPTS: Record<string, IndustryPrompt> = {
  // ==================== TECHNOLOGY ====================
  'tech-frontend': {
    id: 'tech-frontend',
    name: 'Frontend Developer',
    category: 'technology',
    roles: ['Frontend Developer', 'UI Developer', 'React Developer', 'Vue Developer', 'Angular Developer'],
    keywordDensity: 0.08,
    toneGuidelines: [
      'Technical yet accessible',
      'Focus on user impact and experience',
      'Emphasize modern frameworks and best practices',
      'Quantify performance improvements',
      'Highlight cross-functional collaboration'
    ],
    commonTerms: [
      'React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Redux', 'Next.js',
      'Responsive Design', 'Accessibility', 'Performance Optimization', 'REST APIs',
      'GraphQL', 'Jest', 'Testing', 'Webpack', 'UI/UX', 'Agile', 'Git',
      'Cross-browser Compatibility', 'Progressive Web Apps', 'Component Libraries'
    ],
    avoidTerms: ['Rockstar', 'Ninja', 'Guru', 'Wizard', 'Hacker'],
    successMetrics: [
      'Page load time reduction (e.g., "reduced load time by 40%")',
      'User engagement increase (e.g., "improved user engagement by 25%")',
      'Code coverage percentage (e.g., "achieved 90% test coverage")',
      'Accessibility score (e.g., "achieved WCAG 2.1 AA compliance")',
      'Performance score (e.g., "Lighthouse score of 95+")'
    ],
    resumeStructure: {
      summaryFocus: 'Technical skills, user-centric approach, and measurable impact',
      experienceEmphasis: ['Technical implementations', 'Performance improvements', 'User experience enhancements', 'Team collaboration'],
      skillsPresentation: 'Group by: Frameworks/Libraries, Languages, Tools, Methodologies'
    },
    atsOptimization: {
      keywords: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Frontend', 'UI', 'Responsive'],
      phrases: ['modern web development', 'user interface design', 'performance optimization', 'cross-browser compatibility'],
      formatting: ['Use standard section headers', 'Include technical skills section', 'Quantify all achievements']
    }
  },

  'tech-backend': {
    id: 'tech-backend',
    name: 'Backend Developer',
    category: 'technology',
    roles: ['Backend Developer', 'API Developer', 'Server-Side Engineer', 'Node.js Developer'],
    keywordDensity: 0.08,
    toneGuidelines: [
      'Technical and precise',
      'Emphasize scalability and performance',
      'Highlight system architecture decisions',
      'Focus on reliability and uptime',
      'Mention security best practices'
    ],
    commonTerms: [
      'Node.js', 'Python', 'Java', 'Go', 'REST APIs', 'GraphQL', 'Microservices',
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'PostgreSQL', 'MongoDB', 'Redis',
      'System Design', 'Scalability', 'Performance', 'Security', 'CI/CD', 'Git'
    ],
    avoidTerms: ['10x Developer', 'Code Monkey', 'Script Kiddie'],
    successMetrics: [
      'API response time improvements',
      'System uptime percentage',
      'Request throughput (requests/second)',
      'Cost optimization (infrastructure savings)',
      'Database query performance improvements'
    ],
    resumeStructure: {
      summaryFocus: 'System architecture, scalability achievements, and technical depth',
      experienceEmphasis: ['Architecture decisions', 'Performance optimizations', 'Scale challenges', 'Technical leadership'],
      skillsPresentation: 'Group by: Languages, Frameworks, Databases, Cloud/DevOps, Tools'
    },
    atsOptimization: {
      keywords: ['Backend', 'API', 'Microservices', 'Database', 'Cloud', 'Scalability', 'Node.js', 'Python'],
      phrases: ['distributed systems', 'RESTful APIs', 'microservices architecture', 'database optimization'],
      formatting: ['Highlight system design experience', 'Include tech stack details', 'Quantify scale (users, requests, data)']
    }
  },

  'tech-fullstack': {
    id: 'tech-fullstack',
    name: 'Full Stack Developer',
    category: 'technology',
    roles: ['Full Stack Developer', 'Full Stack Engineer', 'MERN Stack Developer', 'MEAN Stack Developer'],
    keywordDensity: 0.09,
    toneGuidelines: [
      'Versatile and adaptable',
      'Balance frontend and backend expertise',
      'Emphasize end-to-end ownership',
      'Highlight problem-solving across the stack'
    ],
    commonTerms: [
      'React', 'Node.js', 'TypeScript', 'JavaScript', 'MongoDB', 'PostgreSQL',
      'Express', 'REST APIs', 'GraphQL', 'Docker', 'AWS', 'Git', 'Agile',
      'Full Stack', 'End-to-End', 'Frontend', 'Backend', 'Database Design'
    ],
    avoidTerms: ['Jack of all trades', 'Swiss Army Knife'],
    successMetrics: [
      'End-to-end feature delivery metrics',
      'Application performance improvements',
      'User satisfaction scores',
      'Development velocity improvements'
    ],
    resumeStructure: {
      summaryFocus: 'Breadth of technical skills and end-to-end delivery capability',
      experienceEmphasis: ['Full stack implementations', 'Cross-layer optimizations', 'Complete feature ownership'],
      skillsPresentation: 'Clearly separate: Frontend, Backend, Database, DevOps'
    },
    atsOptimization: {
      keywords: ['Full Stack', 'Frontend', 'Backend', 'JavaScript', 'React', 'Node.js', 'API', 'Database'],
      phrases: ['end-to-end development', 'full application lifecycle', 'frontend and backend'],
      formatting: ['Show both frontend and backend projects', 'Highlight versatility']
    }
  },

  'tech-devops': {
    id: 'tech-devops',
    name: 'DevOps Engineer',
    category: 'technology',
    roles: ['DevOps Engineer', 'SRE', 'Platform Engineer', 'Infrastructure Engineer'],
    keywordDensity: 0.07,
    toneGuidelines: [
      'Automation-focused',
      'Emphasize reliability and uptime',
      'Highlight infrastructure as code',
      'Focus on CI/CD and deployment pipelines'
    ],
    commonTerms: [
      'Kubernetes', 'Docker', 'AWS', 'Azure', 'GCP', 'Terraform', 'Ansible',
      'Jenkins', 'GitLab CI', 'GitHub Actions', 'Monitoring', 'Prometheus',
      'ELK Stack', 'CI/CD', 'Infrastructure as Code', 'Automation', 'Linux'
    ],
    avoidTerms: ['DevOps Ninja', 'Cloud Wizard'],
    successMetrics: [
      'Deployment frequency (e.g., "50 deployments/day")',
      'Mean time to recovery (MTTR)',
      'System uptime (e.g., "99.99% uptime")',
      'Infrastructure cost savings',
      'Build/deployment time reduction'
    ],
    resumeStructure: {
      summaryFocus: 'Automation expertise, reliability engineering, and infrastructure management',
      experienceEmphasis: ['CI/CD implementations', 'Infrastructure automation', 'Incident response', 'Cost optimization'],
      skillsPresentation: 'Group by: Cloud Platforms, Container Orchestration, CI/CD Tools, Monitoring'
    },
    atsOptimization: {
      keywords: ['DevOps', 'Kubernetes', 'Docker', 'AWS', 'CI/CD', 'Terraform', 'Automation', 'Infrastructure'],
      phrases: ['continuous integration', 'continuous deployment', 'infrastructure as code', 'site reliability'],
      formatting: ['Highlight uptime achievements', 'Include certifications (AWS, Kubernetes)', 'Show automation impact']
    }
  },

  'tech-data-science': {
    id: 'tech-data-science',
    name: 'Data Scientist',
    category: 'technology',
    roles: ['Data Scientist', 'ML Engineer', 'AI Engineer', 'Research Scientist'],
    keywordDensity: 0.07,
    toneGuidelines: [
      'Analytical and research-focused',
      'Emphasize statistical rigor',
      'Highlight business impact of insights',
      'Balance technical depth with accessibility'
    ],
    commonTerms: [
      'Python', 'R', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
      'Scikit-learn', 'Pandas', 'NumPy', 'SQL', 'Big Data', 'Statistics',
      'Data Visualization', 'A/B Testing', 'Predictive Modeling', 'NLP', 'Computer Vision'
    ],
    avoidTerms: ['Data Wizard', 'Analytics Guru'],
    successMetrics: [
      'Model accuracy improvements (e.g., "improved accuracy from 85% to 94%")',
      'Business impact (e.g., "$2M revenue increase")',
      'Processing time reduction',
      'Prediction precision/recall improvements'
    ],
    resumeStructure: {
      summaryFocus: 'Technical expertise in ML/AI and business impact of data-driven insights',
      experienceEmphasis: ['Model development', 'Business impact', 'Research contributions', 'Cross-functional collaboration'],
      skillsPresentation: 'Group by: Languages, ML Frameworks, Statistical Methods, Tools & Platforms'
    },
    atsOptimization: {
      keywords: ['Data Science', 'Machine Learning', 'Python', 'TensorFlow', 'Statistics', 'SQL', 'AI', 'Analytics'],
      phrases: ['machine learning models', 'predictive analytics', 'data-driven insights', 'statistical analysis'],
      formatting: ['Include publications/research', 'Highlight model performance', 'Show business impact']
    }
  },

  // ==================== BUSINESS ====================
  'business-product-manager': {
    id: 'business-product-manager',
    name: 'Product Manager',
    category: 'business',
    roles: ['Product Manager', 'Senior Product Manager', 'Product Owner', 'Technical Product Manager'],
    keywordDensity: 0.06,
    toneGuidelines: [
      'Strategic and user-focused',
      'Emphasize business impact',
      'Highlight cross-functional leadership',
      'Balance technical and business acumen'
    ],
    commonTerms: [
      'Product Strategy', 'Roadmap', 'User Research', 'A/B Testing', 'Metrics',
      'KPIs', 'Agile', 'Scrum', 'Stakeholder Management', 'Go-to-Market',
      'Product-Market Fit', 'User Stories', 'Prioritization', 'Analytics'
    ],
    avoidTerms: ['Product Ninja', 'Growth Hacker'],
    successMetrics: [
      'Revenue growth (e.g., "drove $5M ARR growth")',
      'User adoption (e.g., "increased MAU by 150%")',
      'Feature success rate',
      'Time to market improvements',
      'Customer satisfaction scores (NPS, CSAT)'
    ],
    resumeStructure: {
      summaryFocus: 'Product vision, business impact, and cross-functional leadership',
      experienceEmphasis: ['Product launches', 'Revenue impact', 'User growth', 'Strategic initiatives'],
      skillsPresentation: 'Mix of: Product Skills, Technical Knowledge, Business Acumen, Tools'
    },
    atsOptimization: {
      keywords: ['Product Manager', 'Product Strategy', 'Roadmap', 'Agile', 'Stakeholder', 'Analytics', 'KPI'],
      phrases: ['product lifecycle', 'go-to-market strategy', 'user-centric design', 'cross-functional teams'],
      formatting: ['Quantify business impact', 'Show product launches', 'Highlight user metrics']
    }
  },

  'business-project-manager': {
    id: 'business-project-manager',
    name: 'Project Manager',
    category: 'business',
    roles: ['Project Manager', 'Program Manager', 'Scrum Master', 'Agile Coach'],
    keywordDensity: 0.06,
    toneGuidelines: [
      'Organized and results-driven',
      'Emphasize on-time delivery',
      'Highlight stakeholder management',
      'Focus on process improvement'
    ],
    commonTerms: [
      'Project Management', 'Agile', 'Scrum', 'Waterfall', 'Stakeholder Management',
      'Risk Management', 'Budget Management', 'Resource Planning', 'JIRA', 'PMP',
      'Gantt Charts', 'Sprint Planning', 'Retrospectives', 'Team Leadership'
    ],
    avoidTerms: ['Meeting Master', 'Excel Wizard'],
    successMetrics: [
      'On-time delivery rate (e.g., "95% on-time delivery")',
      'Budget adherence',
      'Team velocity improvements',
      'Stakeholder satisfaction scores',
      'Project cost savings'
    ],
    resumeStructure: {
      summaryFocus: 'Delivery track record, stakeholder management, and process optimization',
      experienceEmphasis: ['Project deliveries', 'Team management', 'Process improvements', 'Risk mitigation'],
      skillsPresentation: 'Certifications first, then: Methodologies, Tools, Soft Skills'
    },
    atsOptimization: {
      keywords: ['Project Manager', 'Agile', 'Scrum', 'PMP', 'Stakeholder', 'Budget', 'Delivery', 'Planning'],
      phrases: ['project lifecycle', 'stakeholder engagement', 'on-time delivery', 'budget management'],
      formatting: ['Include PMP/CSM certifications prominently', 'Show project portfolio', 'Quantify success rates']
    }
  },

  'business-sales': {
    id: 'business-sales',
    name: 'Sales Professional',
    category: 'business',
    roles: ['Sales Executive', 'Account Executive', 'Business Development', 'Sales Manager'],
    keywordDensity: 0.05,
    toneGuidelines: [
      'Results-oriented and persuasive',
      'Emphasize revenue generation',
      'Highlight relationship building',
      'Focus on quota achievement'
    ],
    commonTerms: [
      'Sales', 'Revenue', 'Quota', 'Pipeline', 'CRM', 'Salesforce', 'B2B', 'B2C',
      'Account Management', 'Negotiation', 'Closing', 'Prospecting', 'Lead Generation',
      'Client Relationship', 'Sales Strategy', 'Territory Management'
    ],
    avoidTerms: ['Sales Rockstar', 'Deal Closer Extraordinaire'],
    successMetrics: [
      'Revenue generated (e.g., "$2.5M in annual revenue")',
      'Quota attainment (e.g., "150% of quota")',
      'Deal size growth',
      'Customer retention rate',
      'Sales cycle reduction'
    ],
    resumeStructure: {
      summaryFocus: 'Revenue achievements, quota performance, and relationship building',
      experienceEmphasis: ['Revenue numbers', 'Quota achievement', 'Key accounts', 'Territory growth'],
      skillsPresentation: 'Emphasize: Sales Methodologies, CRM Tools, Industry Knowledge'
    },
    atsOptimization: {
      keywords: ['Sales', 'Revenue', 'Quota', 'B2B', 'CRM', 'Account Management', 'Negotiation', 'Pipeline'],
      phrases: ['revenue generation', 'quota attainment', 'client relationships', 'sales pipeline'],
      formatting: ['Lead with revenue numbers', 'Show percentage achievements', 'Include territory info']
    }
  },

  // ==================== MARKETING ====================
  'marketing-digital': {
    id: 'marketing-digital',
    name: 'Digital Marketing Specialist',
    category: 'business',
    roles: ['Digital Marketing Manager', 'Growth Marketer', 'Marketing Specialist', 'Performance Marketer'],
    keywordDensity: 0.07,
    toneGuidelines: [
      'Data-driven and creative',
      'Emphasize ROI and metrics',
      'Highlight multi-channel expertise',
      'Focus on growth and conversion'
    ],
    commonTerms: [
      'Digital Marketing', 'SEO', 'SEM', 'PPC', 'Google Ads', 'Facebook Ads',
      'Content Marketing', 'Email Marketing', 'Analytics', 'Google Analytics',
      'Conversion Rate', 'ROI', 'A/B Testing', 'Social Media', 'Marketing Automation'
    ],
    avoidTerms: ['Marketing Ninja', 'Growth Hacker'],
    successMetrics: [
      'ROI improvements (e.g., "300% ROI on ad spend")',
      'Conversion rate increases',
      'Lead generation numbers',
      'Traffic growth',
      'Cost per acquisition reduction'
    ],
    resumeStructure: {
      summaryFocus: 'Multi-channel expertise, data-driven approach, and growth achievements',
      experienceEmphasis: ['Campaign performance', 'Channel growth', 'ROI improvements', 'Conversion optimization'],
      skillsPresentation: 'Group by: Channels, Tools, Analytics, Creative Skills'
    },
    atsOptimization: {
      keywords: ['Digital Marketing', 'SEO', 'SEM', 'PPC', 'Analytics', 'Conversion', 'ROI', 'Content Marketing'],
      phrases: ['digital marketing strategy', 'performance marketing', 'growth marketing', 'conversion optimization'],
      formatting: ['Quantify all campaign results', 'Show channel expertise', 'Include certifications (Google, Facebook)']
    }
  },

  // ==================== DESIGN ====================
  'design-ux-ui': {
    id: 'design-ux-ui',
    name: 'UX/UI Designer',
    category: 'creative',
    roles: ['UX Designer', 'UI Designer', 'Product Designer', 'Interaction Designer'],
    keywordDensity: 0.06,
    toneGuidelines: [
      'User-centric and creative',
      'Balance aesthetics with usability',
      'Emphasize user research',
      'Highlight measurable impact on user experience'
    ],
    commonTerms: [
      'UX Design', 'UI Design', 'User Research', 'Wireframing', 'Prototyping',
      'Figma', 'Sketch', 'Adobe XD', 'User Testing', 'Usability', 'Information Architecture',
      'Design Systems', 'Interaction Design', 'Visual Design', 'Accessibility'
    ],
    avoidTerms: ['Design Ninja', 'Pixel Pusher'],
    successMetrics: [
      'User satisfaction improvements (e.g., "increased NPS by 25 points")',
      'Conversion rate increases',
      'Task completion time reduction',
      'Usability scores (SUS)',
      'Adoption rate improvements'
    ],
    resumeStructure: {
      summaryFocus: 'User-centric design philosophy and measurable UX improvements',
      experienceEmphasis: ['Design process', 'User research insights', 'Impact on metrics', 'Collaboration'],
      skillsPresentation: 'Group by: Design Tools, UX Methods, Soft Skills'
    },
    atsOptimization: {
      keywords: ['UX', 'UI', 'User Experience', 'User Interface', 'Design', 'Figma', 'Prototyping', 'Usability'],
      phrases: ['user-centered design', 'design thinking', 'user research', 'usability testing'],
      formatting: ['Include portfolio link prominently', 'Show design process', 'Quantify UX improvements']
    }
  },

  'marketing-content': {
    id: 'marketing-content',
    name: 'Content Marketing Specialist',
    category: 'business',
    roles: ['Content Marketing Manager', 'Content Strategist', 'Content Writer', 'Copywriter'],
    keywordDensity: 0.06,
    toneGuidelines: [
      'Creative and strategic',
      'Emphasize storytelling and engagement',
      'Highlight content performance',
      'Balance creativity with data-driven results'
    ],
    commonTerms: [
      'Content Strategy', 'SEO', 'Copywriting', 'Blog', 'Social Media', 'Content Creation',
      'Editorial Calendar', 'Content Marketing', 'Storytelling', 'Brand Voice', 'WordPress',
      'Analytics', 'Engagement', 'Audience Growth', 'Content Distribution'
    ],
    avoidTerms: ['Content Ninja', 'Word Wizard'],
    successMetrics: [
      'Content engagement rates',
      'Organic traffic growth',
      'Lead generation from content',
      'Audience growth metrics',
      'SEO ranking improvements'
    ],
    resumeStructure: {
      summaryFocus: 'Content strategy expertise and audience engagement achievements',
      experienceEmphasis: ['Content performance', 'Audience growth', 'SEO success', 'Brand development'],
      skillsPresentation: 'Group by: Content Types, Platforms, Tools, Analytics'
    },
    atsOptimization: {
      keywords: ['Content Marketing', 'SEO', 'Copywriting', 'Content Strategy', 'Social Media', 'Analytics', 'Engagement'],
      phrases: ['content strategy', 'audience engagement', 'SEO optimization', 'brand storytelling'],
      formatting: ['Include content portfolio', 'Show engagement metrics', 'Highlight publications']
    }
  },

  // ==================== HEALTHCARE ====================
  'healthcare-nursing': {
    id: 'healthcare-nursing',
    name: 'Registered Nurse',
    category: 'healthcare',
    roles: ['Registered Nurse', 'RN', 'Nurse Practitioner', 'Clinical Nurse'],
    keywordDensity: 0.05,
    toneGuidelines: [
      'Professional and compassionate',
      'Emphasize patient care',
      'Highlight clinical competencies',
      'Focus on safety and quality'
    ],
    commonTerms: [
      'Patient Care', 'Clinical Skills', 'EMR', 'Epic', 'HIPAA', 'BLS', 'ACLS',
      'IV Therapy', 'Wound Care', 'Medication Administration', 'Patient Assessment',
      'Critical Care', 'Emergency Care', 'Nursing Process', 'Charting'
    ],
    avoidTerms: ['Healthcare Hero', 'Medical Marvel'],
    successMetrics: [
      'Patient satisfaction scores',
      'Safety record (zero incidents)',
      'Patient-to-nurse ratio managed',
      'Certification achievements',
      'Quality improvement initiatives'
    ],
    resumeStructure: {
      summaryFocus: 'Clinical expertise, patient care philosophy, and certifications',
      experienceEmphasis: ['Clinical skills', 'Patient outcomes', 'Specialty areas', 'Certifications'],
      skillsPresentation: 'Separate: Clinical Skills, Technical Systems, Certifications'
    },
    atsOptimization: {
      keywords: ['RN', 'Registered Nurse', 'Patient Care', 'Clinical', 'EMR', 'BLS', 'ACLS', 'HIPAA'],
      phrases: ['patient-centered care', 'clinical excellence', 'evidence-based practice'],
      formatting: ['Lead with licenses/certifications', 'Include specialty areas', 'Show patient care experience']
    }
  },

  // ==================== FINANCE ====================
  'finance-analyst': {
    id: 'finance-analyst',
    name: 'Financial Analyst',
    category: 'business',
    roles: ['Financial Analyst', 'Investment Analyst', 'Budget Analyst', 'Business Analyst'],
    keywordDensity: 0.06,
    toneGuidelines: [
      'Analytical and precise',
      'Emphasize financial acumen',
      'Highlight data-driven decisions',
      'Focus on business impact'
    ],
    commonTerms: [
      'Financial Analysis', 'Financial Modeling', 'Excel', 'SQL', 'Forecasting',
      'Budgeting', 'Variance Analysis', 'Financial Reporting', 'KPI', 'ROI',
      'P&L', 'Cash Flow', 'Valuation', 'Investment Analysis', 'Risk Assessment'
    ],
    avoidTerms: ['Number Cruncher', 'Excel Ninja'],
    successMetrics: [
      'Forecast accuracy rates',
      'Cost savings identified',
      'Revenue growth supported',
      'Process efficiency improvements',
      'Model accuracy improvements'
    ],
    resumeStructure: {
      summaryFocus: 'Analytical expertise, financial modeling skills, and business impact',
      experienceEmphasis: ['Financial analysis', 'Model development', 'Business insights', 'Strategic recommendations'],
      skillsPresentation: 'Group by: Analysis Tools, Financial Software, Technical Skills, Certifications'
    },
    atsOptimization: {
      keywords: ['Financial Analyst', 'Excel', 'Financial Modeling', 'Forecasting', 'Analysis', 'Budgeting', 'SQL'],
      phrases: ['financial analysis', 'business intelligence', 'data-driven decisions', 'financial planning'],
      formatting: ['Include CFA/certifications', 'Show analytical tools', 'Quantify financial impact']
    }
  },

  // ==================== EDUCATION ====================
  'education-teacher': {
    id: 'education-teacher',
    name: 'Teacher / Educator',
    category: 'education',
    roles: ['Teacher', 'Educator', 'Professor', 'Instructor', 'Lecturer'],
    keywordDensity: 0.05,
    toneGuidelines: [
      'Educational and inspiring',
      'Emphasize student outcomes',
      'Highlight pedagogical expertise',
      'Focus on curriculum development'
    ],
    commonTerms: [
      'Curriculum Development', 'Lesson Planning', 'Student Assessment', 'Classroom Management',
      'Differentiated Instruction', 'Educational Technology', 'Learning Outcomes', 'Pedagogy',
      'Student Engagement', 'Parent Communication', 'Professional Development'
    ],
    avoidTerms: ['Education Guru', 'Teaching Wizard'],
    successMetrics: [
      'Student achievement improvements',
      'Test score increases',
      'Student engagement rates',
      'Curriculum adoption success',
      'Parent satisfaction scores'
    ],
    resumeStructure: {
      summaryFocus: 'Teaching philosophy, subject expertise, and student success',
      experienceEmphasis: ['Student outcomes', 'Curriculum development', 'Teaching methods', 'Innovation in education'],
      skillsPresentation: 'Group by: Subject Areas, Teaching Methods, Technology, Certifications'
    },
    atsOptimization: {
      keywords: ['Teacher', 'Education', 'Curriculum', 'Instruction', 'Assessment', 'Classroom', 'Student'],
      phrases: ['student-centered learning', 'differentiated instruction', 'curriculum development'],
      formatting: ['Include teaching certifications', 'Show subject areas', 'Quantify student outcomes']
    }
  },

  // ==================== GENERIC FALLBACK ====================
  'generic-professional': {
    id: 'generic-professional',
    name: 'Professional',
    category: 'business',
    roles: ['Professional', 'Specialist', 'Consultant', 'Analyst'],
    keywordDensity: 0.05,
    toneGuidelines: [
      'Professional and clear',
      'Emphasize results and impact',
      'Highlight relevant skills',
      'Focus on achievements'
    ],
    commonTerms: [
      'Professional', 'Analysis', 'Strategy', 'Planning', 'Implementation',
      'Team Collaboration', 'Project Management', 'Communication', 'Problem Solving'
    ],
    avoidTerms: ['Synergy', 'Thought Leader', 'Best of Breed'],
    successMetrics: [
      'Project outcomes',
      'Efficiency improvements',
      'Cost savings',
      'Team productivity increases'
    ],
    resumeStructure: {
      summaryFocus: 'Professional experience and key achievements',
      experienceEmphasis: ['Key accomplishments', 'Impact on business', 'Skills demonstrated'],
      skillsPresentation: 'List relevant technical and soft skills'
    },
    atsOptimization: {
      keywords: ['Professional', 'Experience', 'Skills', 'Results', 'Team', 'Project'],
      phrases: ['proven track record', 'results-oriented', 'team player'],
      formatting: ['Clear structure', 'Quantified achievements', 'Relevant keywords']
    }
  }
};

/**
 * Get industry prompt by ID
 */
export function getIndustryPrompt(industryId: string): IndustryPrompt {
  return INDUSTRY_PROMPTS[industryId] || INDUSTRY_PROMPTS['generic-professional'];
}

/**
 * Get all available industries grouped by category
 */
export function getIndustriesByCategory(): Record<string, IndustryPrompt[]> {
  const grouped: Record<string, IndustryPrompt[]> = {};
  
  Object.values(INDUSTRY_PROMPTS).forEach(prompt => {
    if (!grouped[prompt.category]) {
      grouped[prompt.category] = [];
    }
    grouped[prompt.category].push(prompt);
  });
  
  return grouped;
}

/**
 * Suggest industry based on skills and experience
 */
export function suggestIndustry(skills: string[], experienceTitles: string[]): string {
  let bestMatch = 'generic-professional';
  let highestScore = 0;
  
  Object.entries(INDUSTRY_PROMPTS).forEach(([id, prompt]) => {
    let score = 0;
    
    // Check skill matches
    skills.forEach(skill => {
      if (prompt.commonTerms.some(term => 
        term.toLowerCase() === skill.toLowerCase()
      )) {
        score += 2;
      }
    });
    
    // Check role matches
    experienceTitles.forEach(title => {
      if (prompt.roles.some(role => 
        title.toLowerCase().includes(role.toLowerCase())
      )) {
        score += 5;
      }
    });
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = id;
    }
  });
  
  return bestMatch;
}

/**
 * Generate industry-specific resume prompt
 */
/**
 * More industries to add to INDUSTRY_PROMPTS (in separate expansions)
 */
export const ADDITIONAL_INDUSTRIES = [
  'tech-mobile', 'tech-qa', 'tech-security', 'tech-cloud-architect',
  'business-consultant', 'business-hr', 'business-operations',
  'design-graphic', 'design-motion', 'creative-writer',
  'healthcare-medical-doctor', 'healthcare-pharmacist',
  'engineering-mechanical', 'engineering-civil', 'engineering-electrical',
  'finance-accountant', 'finance-investment-banker',
  'legal-attorney', 'legal-paralegal',
  'education-administrator'
];

/**
 * Generate industry-specific resume prompt
 */
export function generateIndustryPrompt(
  industryId: string,
  jobDescription: string,
  profileSummary: string
): string {
  const industry = getIndustryPrompt(industryId);
  
  const prompt = `You are an expert resume writer specializing in ${industry.name} roles.

INDUSTRY CONTEXT:
- Category: ${industry.category}
- Target Roles: ${industry.roles.join(', ')}
- Tone: ${industry.toneGuidelines.join('; ')}

KEY REQUIREMENTS:
1. Use industry-standard terminology: ${industry.commonTerms.slice(0, 10).join(', ')}
2. AVOID these terms: ${industry.avoidTerms.join(', ')}
3. Include quantifiable metrics like: ${industry.successMetrics.slice(0, 3).join('; ')}
4. Maintain ${Math.round(industry.keywordDensity * 100)}% keyword density for ATS optimization

RESUME STRUCTURE GUIDELINES:
- Summary Focus: ${industry.resumeStructure.summaryFocus}
- Experience Emphasis: ${industry.resumeStructure.experienceEmphasis.join(', ')}
- Skills Presentation: ${industry.resumeStructure.skillsPresentation}

ATS OPTIMIZATION:
- Must include keywords: ${industry.atsOptimization.keywords.slice(0, 8).join(', ')}
- Use phrases like: ${industry.atsOptimization.phrases.join(', ')}
- Formatting tips: ${industry.atsOptimization.formatting.join('; ')}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE PROFILE:
${profileSummary}

Generate a professional, ATS-optimized resume tailored specifically for ${industry.name} roles. Focus on relevant achievements and use industry-appropriate language.`;

  return prompt;
}
