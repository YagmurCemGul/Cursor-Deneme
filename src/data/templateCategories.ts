import { TemplateCategory } from '../types';

export const defaultTemplateCategories: TemplateCategory[] = [
  {
    id: 'corporate',
    name: 'Corporate & Business',
    description: 'Professional templates for corporate and business environments',
    icon: '💼',
    industry: ['finance', 'banking', 'consulting', 'insurance', 'legal'],
    style: ['formal', 'traditional', 'professional'],
  },
  {
    id: 'tech',
    name: 'Technology & Development',
    description: 'Modern templates for tech professionals and developers',
    icon: '💻',
    industry: ['software', 'IT', 'engineering', 'data-science', 'cybersecurity'],
    style: ['modern', 'technical', 'clean'],
  },
  {
    id: 'creative',
    name: 'Creative & Design',
    description: 'Expressive templates for creative professionals',
    icon: '🎨',
    industry: ['design', 'marketing', 'advertising', 'media', 'arts'],
    style: ['creative', 'colorful', 'unique'],
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    description: 'Professional templates for healthcare professionals',
    icon: '⚕️',
    industry: ['medical', 'nursing', 'healthcare', 'pharmaceutical', 'biotech'],
    style: ['clean', 'professional', 'caring'],
  },
  {
    id: 'education',
    name: 'Education & Academia',
    description: 'Academic templates for educators and researchers',
    icon: '📚',
    industry: ['teaching', 'research', 'academic', 'training', 'education'],
    style: ['formal', 'traditional', 'scholarly'],
  },
  {
    id: 'startup',
    name: 'Startup & Innovation',
    description: 'Dynamic templates for startup and fast-paced environments',
    icon: '🚀',
    industry: ['startup', 'entrepreneur', 'venture', 'innovation'],
    style: ['dynamic', 'bold', 'modern'],
  },
  {
    id: 'sales',
    name: 'Sales & Business Development',
    description: 'Results-driven templates for sales professionals',
    icon: '📈',
    industry: ['sales', 'business-development', 'account-management', 'retail'],
    style: ['results-focused', 'achievement-oriented', 'professional'],
  },
  {
    id: 'executive',
    name: 'Executive & Leadership',
    description: 'Premium templates for senior leadership positions',
    icon: '👔',
    industry: ['executive', 'c-level', 'management', 'leadership'],
    style: ['executive', 'sophisticated', 'premium'],
  },
  {
    id: 'engineering',
    name: 'Engineering & Technical',
    description: 'Technical templates for engineers and technical roles',
    icon: '⚙️',
    industry: ['mechanical', 'electrical', 'civil', 'chemical', 'industrial'],
    style: ['technical', 'precise', 'professional'],
  },
  {
    id: 'entry-level',
    name: 'Entry Level & Students',
    description: 'Accessible templates for graduates and entry-level professionals',
    icon: '🎓',
    industry: ['graduate', 'internship', 'entry-level', 'student'],
    style: ['simple', 'clean', 'fresh'],
  },
];

export const getCategoryById = (id: string): TemplateCategory | undefined => {
  return defaultTemplateCategories.find((c) => c.id === id);
};

export const getCategoriesByIndustry = (industry: string): TemplateCategory[] => {
  return defaultTemplateCategories.filter((c) => 
    c.industry?.includes(industry.toLowerCase())
  );
};

export const getCategoriesByStyle = (style: string): TemplateCategory[] => {
  return defaultTemplateCategories.filter((c) => 
    c.style?.includes(style.toLowerCase())
  );
};
