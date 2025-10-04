export interface CVTemplateStyle {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: {
    headerAlign: 'left' | 'center' | 'right';
    sectionSpacing: number;
    columnLayout: 'single' | 'two-column';
  };
  features: string[];
}

export const defaultCVTemplates: CVTemplateStyle[] = [
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Traditional, ATS-friendly format perfect for corporate positions',
    preview: '📄',
    colors: {
      primary: '#2c3e50',
      secondary: '#34495e',
      text: '#333333',
      background: '#ffffff',
      accent: '#3498db',
    },
    fonts: {
      heading: 'Arial, sans-serif',
      body: 'Arial, sans-serif',
    },
    layout: {
      headerAlign: 'center',
      sectionSpacing: 16,
      columnLayout: 'single',
    },
    features: ['ATS-Optimized', 'Clean Layout', 'Professional Typography', 'Easy to Read'],
  },
  {
    id: 'modern',
    name: 'Modern Minimalist',
    description: 'Clean, contemporary design for tech and creative roles',
    preview: '✨',
    colors: {
      primary: '#1a202c',
      secondary: '#2d3748',
      text: '#2d3748',
      background: '#ffffff',
      accent: '#10b981',
    },
    fonts: {
      heading: 'Helvetica, sans-serif',
      body: 'Helvetica, sans-serif',
    },
    layout: {
      headerAlign: 'left',
      sectionSpacing: 20,
      columnLayout: 'single',
    },
    features: ['Modern Design', 'Left-Aligned Header', 'Generous Spacing', 'Tech-Friendly'],
  },
  {
    id: 'executive',
    name: 'Executive Elite',
    description: 'Sophisticated design for senior leadership positions',
    preview: '👔',
    colors: {
      primary: '#1e3a8a',
      secondary: '#1e40af',
      text: '#374151',
      background: '#ffffff',
      accent: '#dc2626',
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Arial, sans-serif',
    },
    layout: {
      headerAlign: 'center',
      sectionSpacing: 18,
      columnLayout: 'single',
    },
    features: ['Executive Style', 'Serif Headings', 'Bold Sections', 'Leadership Focus'],
  },
  {
    id: 'creative',
    name: 'Creative Portfolio',
    description: 'Eye-catching design for designers and creative professionals',
    preview: '🎨',
    colors: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      text: '#1f2937',
      background: '#ffffff',
      accent: '#ec4899',
    },
    fonts: {
      heading: 'Helvetica, sans-serif',
      body: 'Helvetica, sans-serif',
    },
    layout: {
      headerAlign: 'left',
      sectionSpacing: 22,
      columnLayout: 'two-column',
    },
    features: ['Creative Layout', 'Two-Column Design', 'Colorful Accents', 'Portfolio Ready'],
  },
  {
    id: 'compact',
    name: 'Compact Professional',
    description: 'Space-efficient design to fit more content on one page',
    preview: '📋',
    colors: {
      primary: '#0f172a',
      secondary: '#1e293b',
      text: '#334155',
      background: '#ffffff',
      accent: '#0ea5e9',
    },
    fonts: {
      heading: 'Arial, sans-serif',
      body: 'Arial, sans-serif',
    },
    layout: {
      headerAlign: 'center',
      sectionSpacing: 12,
      columnLayout: 'single',
    },
    features: ['Space Efficient', 'Tight Spacing', 'More Content', 'Single Page Focus'],
  },
  {
    id: 'academic',
    name: 'Academic CV',
    description: 'Comprehensive format for researchers and academics',
    preview: '🎓',
    colors: {
      primary: '#422006',
      secondary: '#78350f',
      text: '#44403c',
      background: '#ffffff',
      accent: '#b45309',
    },
    fonts: {
      heading: 'Times New Roman, serif',
      body: 'Times New Roman, serif',
    },
    layout: {
      headerAlign: 'center',
      sectionSpacing: 16,
      columnLayout: 'single',
    },
    features: ['Academic Format', 'Publication Ready', 'Traditional Style', 'Research Focused'],
  },
  {
    id: 'tech',
    name: 'Tech Developer',
    description: 'Developer-focused design with GitHub integration emphasis',
    preview: '💻',
    colors: {
      primary: '#0d1117',
      secondary: '#161b22',
      text: '#24292f',
      background: '#ffffff',
      accent: '#2da44e',
    },
    fonts: {
      heading: 'Consolas, monospace',
      body: 'Arial, sans-serif',
    },
    layout: {
      headerAlign: 'left',
      sectionSpacing: 18,
      columnLayout: 'single',
    },
    features: ['Developer Focused', 'GitHub Style', 'Monospace Headings', 'Project Emphasis'],
  },
  {
    id: 'startup',
    name: 'Startup Ready',
    description: 'Dynamic design for startup and fast-paced environments',
    preview: '🚀',
    colors: {
      primary: '#ea580c',
      secondary: '#f97316',
      text: '#292524',
      background: '#ffffff',
      accent: '#06b6d4',
    },
    fonts: {
      heading: 'Arial, sans-serif',
      body: 'Arial, sans-serif',
    },
    layout: {
      headerAlign: 'left',
      sectionSpacing: 20,
      columnLayout: 'single',
    },
    features: ['Dynamic Layout', 'Startup Culture', 'Bold Colors', 'Action Oriented'],
  },
  {
    id: 'finance',
    name: 'Finance Professional',
    description: 'Conservative and trustworthy design for banking and finance roles',
    preview: '💼',
    colors: {
      primary: '#1e3a5f',
      secondary: '#2c5282',
      text: '#2d3748',
      background: '#ffffff',
      accent: '#2b6cb0',
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Times New Roman, serif',
    },
    layout: {
      headerAlign: 'center',
      sectionSpacing: 16,
      columnLayout: 'single',
    },
    features: ['Conservative Design', 'Trust Building', 'Finance Focused', 'Professional Tone'],
  },
  {
    id: 'marketing',
    name: 'Marketing Maven',
    description: 'Vibrant and creative design for marketing and brand professionals',
    preview: '📣',
    colors: {
      primary: '#d53f8c',
      secondary: '#ed64a6',
      text: '#2d3748',
      background: '#ffffff',
      accent: '#38b2ac',
    },
    fonts: {
      heading: 'Helvetica, sans-serif',
      body: 'Arial, sans-serif',
    },
    layout: {
      headerAlign: 'left',
      sectionSpacing: 20,
      columnLayout: 'two-column',
    },
    features: ['Creative Layout', 'Brand Focused', 'Marketing Metrics', 'Campaign Highlights'],
  },
  {
    id: 'healthcare',
    name: 'Healthcare Professional',
    description: 'Clean and caring design for medical and healthcare roles',
    preview: '⚕️',
    colors: {
      primary: '#2f855a',
      secondary: '#38a169',
      text: '#2d3748',
      background: '#ffffff',
      accent: '#48bb78',
    },
    fonts: {
      heading: 'Arial, sans-serif',
      body: 'Arial, sans-serif',
    },
    layout: {
      headerAlign: 'center',
      sectionSpacing: 18,
      columnLayout: 'single',
    },
    features: ['Professional Medical', 'Care Focused', 'Certification Ready', 'Patient-Centric'],
  },
  {
    id: 'legal',
    name: 'Legal Professional',
    description: 'Formal and authoritative design for legal and compliance roles',
    preview: '⚖️',
    colors: {
      primary: '#1a202c',
      secondary: '#2d3748',
      text: '#1a202c',
      background: '#ffffff',
      accent: '#744210',
    },
    fonts: {
      heading: 'Times New Roman, serif',
      body: 'Times New Roman, serif',
    },
    layout: {
      headerAlign: 'center',
      sectionSpacing: 16,
      columnLayout: 'single',
    },
    features: ['Formal Layout', 'Legal Standard', 'Detail Oriented', 'Compliance Ready'],
  },
  {
    id: 'education',
    name: 'Education & Teaching',
    description: 'Friendly and professional design for educators and trainers',
    preview: '📚',
    colors: {
      primary: '#4c51bf',
      secondary: '#5a67d8',
      text: '#2d3748',
      background: '#ffffff',
      accent: '#ed8936',
    },
    fonts: {
      heading: 'Helvetica, sans-serif',
      body: 'Arial, sans-serif',
    },
    layout: {
      headerAlign: 'center',
      sectionSpacing: 18,
      columnLayout: 'single',
    },
    features: ['Educational Focus', 'Teaching Experience', 'Curriculum Ready', 'Student Centered'],
  },
  {
    id: 'engineering',
    name: 'Engineering Expert',
    description: 'Technical and precise design for engineers and technical roles',
    preview: '⚙️',
    colors: {
      primary: '#2c5282',
      secondary: '#2b6cb0',
      text: '#2d3748',
      background: '#ffffff',
      accent: '#4299e1',
    },
    fonts: {
      heading: 'Calibri, sans-serif',
      body: 'Calibri, sans-serif',
    },
    layout: {
      headerAlign: 'left',
      sectionSpacing: 16,
      columnLayout: 'single',
    },
    features: ['Technical Focus', 'Project Emphasis', 'Engineering Standards', 'Detail Oriented'],
  },
  {
    id: 'sales',
    name: 'Sales Champion',
    description: 'Results-driven design for sales and business development roles',
    preview: '📈',
    colors: {
      primary: '#c05621',
      secondary: '#dd6b20',
      text: '#2d3748',
      background: '#ffffff',
      accent: '#38b2ac',
    },
    fonts: {
      heading: 'Arial, sans-serif',
      body: 'Arial, sans-serif',
    },
    layout: {
      headerAlign: 'left',
      sectionSpacing: 18,
      columnLayout: 'single',
    },
    features: ['Results Focused', 'Metrics Driven', 'Achievement Highlights', 'Revenue Growth'],
  },
  {
    id: 'consulting',
    name: 'Management Consulting',
    description: 'Strategic and polished design for consulting professionals',
    preview: '🎯',
    colors: {
      primary: '#2c5282',
      secondary: '#2b6cb0',
      text: '#2d3748',
      background: '#ffffff',
      accent: '#805ad5',
    },
    fonts: {
      heading: 'Arial, sans-serif',
      body: 'Arial, sans-serif',
    },
    layout: {
      headerAlign: 'center',
      sectionSpacing: 18,
      columnLayout: 'single',
    },
    features: ['Strategic Focus', 'Case Studies', 'Impact Driven', 'Client Success'],
  },
  {
    id: 'data-science',
    name: 'Data Science & Analytics',
    description: 'Data-focused design for data scientists and analysts',
    preview: '📊',
    colors: {
      primary: '#2d3748',
      secondary: '#4a5568',
      text: '#1a202c',
      background: '#ffffff',
      accent: '#00b4d8',
    },
    fonts: {
      heading: 'Consolas, monospace',
      body: 'Arial, sans-serif',
    },
    layout: {
      headerAlign: 'left',
      sectionSpacing: 18,
      columnLayout: 'single',
    },
    features: ['Data Focused', 'Analytics Emphasis', 'Model Highlights', 'Python/R Skills'],
  },
];

export const getTemplateById = (id: string): CVTemplateStyle => {
  const template = defaultCVTemplates.find((t) => t.id === id);
  return template ?? defaultCVTemplates[0]!;
};

export const getDefaultTemplate = (): CVTemplateStyle => {
  return defaultCVTemplates[0]!; // Classic Professional
};
