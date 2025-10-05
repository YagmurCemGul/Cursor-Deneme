// Form validation utilities

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email) return { isValid: true }; // Empty is ok, not required
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  return { isValid: true };
}

export function validatePhone(phone: string): ValidationResult {
  if (!phone) return { isValid: true };
  
  // Allow various phone formats
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Invalid phone format' };
  }
  
  // Check if has at least 7 digits
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) {
    return { isValid: false, error: 'Phone too short' };
  }
  
  return { isValid: true };
}

export function validateURL(url: string): ValidationResult {
  if (!url) return { isValid: true };
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    // Check if it's just a username without protocol
    if (!url.includes('http') && !url.includes('://')) {
      return { isValid: true }; // Allow usernames
    }
    return { isValid: false, error: 'Invalid URL format' };
  }
}

export function validateLinkedIn(username: string): ValidationResult {
  if (!username) return { isValid: true };
  
  // If it's a full URL, extract username
  if (username.includes('linkedin.com')) {
    return { isValid: true };
  }
  
  // Username validation
  if (username.length < 3 || username.length > 100) {
    return { isValid: false, error: 'LinkedIn username length invalid' };
  }
  
  return { isValid: true };
}

export function validateGitHub(username: string): ValidationResult {
  if (!username) return { isValid: true };
  
  // If it's a full URL, extract username
  if (username.includes('github.com')) {
    return { isValid: true };
  }
  
  // GitHub username validation (alphanumeric and hyphens, max 39 chars)
  const githubRegex = /^[a-zA-Z0-9-]{1,39}$/;
  if (!githubRegex.test(username)) {
    return { isValid: false, error: 'Invalid GitHub username' };
  }
  
  return { isValid: true };
}

export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  
  // Turkish format
  if (digits.startsWith('90') && digits.length === 12) {
    return `+90 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  }
  
  // US format
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  return phone;
}

export function calculateDateDuration(startDate: string, endDate?: string, isCurrent?: boolean): string {
  if (!startDate) return '';
  
  const start = new Date(startDate + '-01');
  const end = isCurrent ? new Date() : (endDate ? new Date(endDate + '-01') : new Date());
  
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  
  if (months < 0) return 'Invalid dates';
  if (months === 0) return 'Less than a month';
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  let result = '';
  if (years > 0) result += `${years} year${years > 1 ? 's' : ''}`;
  if (remainingMonths > 0) {
    if (result) result += ' ';
    result += `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  }
  
  return result;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const [year, month] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]} ${year}`;
}

// Calculate profile completion percentage
export function calculateProfileCompletion(profile: any): { percentage: number; missingFields: string[] } {
  const missingFields: string[] = [];
  let totalFields = 0;
  let filledFields = 0;
  
  // Personal info (weight: 6)
  const personalFields = [
    { key: 'firstName', label: 'First Name', required: true },
    { key: 'lastName', label: 'Last Name', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'location', label: 'Location', required: false },
    { key: 'summary', label: 'Professional Summary', required: false },
  ];
  
  personalFields.forEach(field => {
    totalFields++;
    if (profile?.personal?.[field.key]) {
      filledFields++;
    } else if (field.required) {
      missingFields.push(field.label);
    }
  });
  
  // Skills (weight: 1)
  totalFields++;
  if (profile?.skills?.length > 0) {
    filledFields++;
  } else {
    missingFields.push('Skills');
  }
  
  // Experience (weight: 2)
  totalFields += 2;
  if (profile?.experience?.length > 0) {
    filledFields++;
    // Check if at least one experience has description
    if (profile.experience.some((exp: any) => exp.description)) {
      filledFields++;
    } else {
      missingFields.push('Experience descriptions');
    }
  } else {
    missingFields.push('Work Experience');
  }
  
  // Education (weight: 1)
  totalFields++;
  if (profile?.education?.length > 0) {
    filledFields++;
  } else {
    missingFields.push('Education');
  }
  
  const percentage = Math.round((filledFields / totalFields) * 100);
  return { percentage, missingFields };
}

// Popular skills by category
export const skillSuggestions: Record<string, string[]> = {
  'Software Development': [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask', 'Spring Boot', 'ASP.NET',
    'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap', 'jQuery', 'Redux', 'Next.js'
  ],
  'DevOps & Cloud': [
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions',
    'Terraform', 'Ansible', 'Linux', 'Bash', 'CI/CD', 'Monitoring', 'Logging'
  ],
  'Database': [
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Oracle', 'SQL Server',
    'DynamoDB', 'Cassandra', 'Firebase', 'SQL', 'NoSQL'
  ],
  'Data Science & AI': [
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas',
    'NumPy', 'Data Analysis', 'Statistics', 'R', 'Jupyter', 'Neural Networks', 'NLP', 'Computer Vision'
  ],
  'Mobile Development': [
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS Development', 'Android Development',
    'Xamarin', 'Ionic', 'Mobile UI/UX'
  ],
  'Design': [
    'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'UI/UX Design', 'Wireframing',
    'Prototyping', 'User Research', 'Design Systems'
  ],
  'Project Management': [
    'Agile', 'Scrum', 'Kanban', 'JIRA', 'Trello', 'Asana', 'Project Planning', 'Team Leadership',
    'Stakeholder Management', 'Risk Management', 'Budgeting'
  ],
  'Soft Skills': [
    'Communication', 'Leadership', 'Problem Solving', 'Critical Thinking', 'Teamwork',
    'Time Management', 'Adaptability', 'Creativity', 'Emotional Intelligence'
  ]
};

export function getSkillSuggestions(currentSkills: string[], category?: string): string[] {
  let allSuggestions: string[] = [];
  
  if (category && skillSuggestions[category]) {
    allSuggestions = skillSuggestions[category];
  } else {
    // Combine all categories
    Object.values(skillSuggestions).forEach(skills => {
      allSuggestions.push(...skills);
    });
  }
  
  // Filter out already added skills (case insensitive)
  const currentSkillsLower = currentSkills.map(s => s.toLowerCase());
  return allSuggestions.filter(s => !currentSkillsLower.includes(s.toLowerCase()));
}
