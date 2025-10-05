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
      accent: '#3498db'
    },
    fonts: {
      heading: 'Arial, sans-serif',
      body: 'Arial, sans-serif'
    },
    layout: {
      headerAlign: 'center',
      sectionSpacing: 16,
      columnLayout: 'single'
    },
    features: [
      'ATS-Optimized',
      'Clean Layout',
      'Professional Typography',
      'Easy to Read'
    ]
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
      accent: '#10b981'
    },
    fonts: {
      heading: 'Helvetica, sans-serif',
      body: 'Helvetica, sans-serif'
    },
    layout: {
      headerAlign: 'left',
      sectionSpacing: 20,
      columnLayout: 'single'
    },
    features: [
      'Modern Design',
      'Left-Aligned Header',
      'Generous Spacing',
      'Tech-Friendly'
    ]
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
      accent: '#dc2626'
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Arial, sans-serif'
    },
    layout: {
      headerAlign: 'center',
      sectionSpacing: 18,
      columnLayout: 'single'
    },
    features: [
      'Executive Style',
      'Serif Headings',
      'Bold Sections',
      'Leadership Focus'
    ]
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
      accent: '#ec4899'
    },
    fonts: {
      heading: 'Helvetica, sans-serif',
      body: 'Helvetica, sans-serif'
    },
    layout: {
      headerAlign: 'left',
      sectionSpacing: 22,
      columnLayout: 'two-column'
    },
    features: [
      'Creative Layout',
      'Two-Column Design',
      'Colorful Accents',
      'Portfolio Ready'
    ]
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
      accent: '#0ea5e9'
    },
    fonts: {
      heading: 'Arial, sans-serif',
      body: 'Arial, sans-serif'
    },
    layout: {
      headerAlign: 'center',
      sectionSpacing: 12,
      columnLayout: 'single'
    },
    features: [
      'Space Efficient',
      'Tight Spacing',
      'More Content',
      'Single Page Focus'
    ]
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
      accent: '#b45309'
    },
    fonts: {
      heading: 'Times New Roman, serif',
      body: 'Times New Roman, serif'
    },
    layout: {
      headerAlign: 'center',
      sectionSpacing: 16,
      columnLayout: 'single'
    },
    features: [
      'Academic Format',
      'Publication Ready',
      'Traditional Style',
      'Research Focused'
    ]
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
      accent: '#2da44e'
    },
    fonts: {
      heading: 'Consolas, monospace',
      body: 'Arial, sans-serif'
    },
    layout: {
      headerAlign: 'left',
      sectionSpacing: 18,
      columnLayout: 'single'
    },
    features: [
      'Developer Focused',
      'GitHub Style',
      'Monospace Headings',
      'Project Emphasis'
    ]
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
      accent: '#06b6d4'
    },
    fonts: {
      heading: 'Arial, sans-serif',
      body: 'Arial, sans-serif'
    },
    layout: {
      headerAlign: 'left',
      sectionSpacing: 20,
      columnLayout: 'single'
    },
    features: [
      'Dynamic Layout',
      'Startup Culture',
      'Bold Colors',
      'Action Oriented'
    ]
  }
];

export const getTemplateById = (id: string): CVTemplateStyle | undefined => {
  return defaultCVTemplates.find(template => template.id === id);
};

export const getDefaultTemplate = (): CVTemplateStyle => {
  return defaultCVTemplates[0]; // Classic Professional
};
