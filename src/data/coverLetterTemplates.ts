export interface CoverLetterTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  style: {
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
    paragraphSpacing: number;
    headerFormat: 'left' | 'center' | 'right';
    includeDate: boolean;
    includeAddress: boolean;
    signatureStyle: 'formal' | 'casual' | 'modern';
  };
  colors: {
    primary: string;
    text: string;
    accent: string;
  };
  tone: 'formal' | 'professional' | 'modern' | 'creative' | 'executive' | 'friendly';
  features: string[];
  industry?: string[];
  tags?: string[];
}

export const defaultCoverLetterTemplates: CoverLetterTemplate[] = [
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Traditional business letter format, perfect for corporate positions',
    preview: '📄',
    style: {
      fontSize: 11,
      fontFamily: 'Times New Roman, serif',
      lineHeight: 1.5,
      paragraphSpacing: 12,
      headerFormat: 'left',
      includeDate: true,
      includeAddress: true,
      signatureStyle: 'formal',
    },
    colors: {
      primary: '#000000',
      text: '#333333',
      accent: '#1a73e8',
    },
    tone: 'formal',
    features: ['Traditional Format', 'Formal Tone', 'ATS-Friendly', 'Corporate Standard'],
  },
  {
    id: 'modern',
    name: 'Modern Professional',
    description: 'Clean, contemporary design for tech and innovative companies',
    preview: '✨',
    style: {
      fontSize: 11,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.6,
      paragraphSpacing: 14,
      headerFormat: 'left',
      includeDate: true,
      includeAddress: false,
      signatureStyle: 'modern',
    },
    colors: {
      primary: '#2c3e50',
      text: '#2d3748',
      accent: '#10b981',
    },
    tone: 'modern',
    features: ['Clean Design', 'Modern Tone', 'Tech-Friendly', 'Concise Format'],
  },
  {
    id: 'executive',
    name: 'Executive Elite',
    description: 'Sophisticated format for senior leadership positions',
    preview: '👔',
    style: {
      fontSize: 11,
      fontFamily: 'Georgia, serif',
      lineHeight: 1.5,
      paragraphSpacing: 16,
      headerFormat: 'center',
      includeDate: true,
      includeAddress: true,
      signatureStyle: 'formal',
    },
    colors: {
      primary: '#1e3a8a',
      text: '#374151',
      accent: '#dc2626',
    },
    tone: 'executive',
    features: ['Executive Style', 'Authoritative Tone', 'Leadership Focus', 'Premium Look'],
  },
  {
    id: 'creative',
    name: 'Creative Professional',
    description: 'Expressive design for creative and design roles',
    preview: '🎨',
    style: {
      fontSize: 11,
      fontFamily: 'Helvetica, sans-serif',
      lineHeight: 1.7,
      paragraphSpacing: 16,
      headerFormat: 'left',
      includeDate: true,
      includeAddress: false,
      signatureStyle: 'casual',
    },
    colors: {
      primary: '#7c3aed',
      text: '#1f2937',
      accent: '#ec4899',
    },
    tone: 'creative',
    features: ['Creative Layout', 'Expressive Tone', 'Design Focus', 'Personality Showcase'],
  },
  {
    id: 'startup',
    name: 'Startup Ready',
    description: 'Dynamic and energetic format for startup environments',
    preview: '🚀',
    style: {
      fontSize: 11,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.6,
      paragraphSpacing: 14,
      headerFormat: 'left',
      includeDate: false,
      includeAddress: false,
      signatureStyle: 'casual',
    },
    colors: {
      primary: '#ea580c',
      text: '#292524',
      accent: '#06b6d4',
    },
    tone: 'friendly',
    features: ['Energetic Tone', 'Fast-Paced Feel', 'Startup Culture', 'Direct Communication'],
  },
  {
    id: 'academic',
    name: 'Academic & Research',
    description: 'Formal academic format for research and faculty positions',
    preview: '🎓',
    style: {
      fontSize: 12,
      fontFamily: 'Times New Roman, serif',
      lineHeight: 2.0,
      paragraphSpacing: 16,
      headerFormat: 'left',
      includeDate: true,
      includeAddress: true,
      signatureStyle: 'formal',
    },
    colors: {
      primary: '#000000',
      text: '#000000',
      accent: '#b45309',
    },
    tone: 'formal',
    features: ['Academic Format', 'Scholarly Tone', 'Research Focus', 'Publication Standard'],
    industry: ['Academia', 'Research', 'Education', 'Science', 'Publishing'],
    tags: ['academic', 'research', 'formal'],
  },
  {
    id: 'healthcare',
    name: 'Healthcare Professional',
    description: 'Professional format for medical and healthcare positions',
    preview: '🏥',
    style: {
      fontSize: 11,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.5,
      paragraphSpacing: 14,
      headerFormat: 'left',
      includeDate: true,
      includeAddress: true,
      signatureStyle: 'formal',
    },
    colors: {
      primary: '#0369a1',
      text: '#1e293b',
      accent: '#0ea5e9',
    },
    tone: 'professional',
    features: ['Healthcare Format', 'Compassionate Tone', 'Patient-Focused', 'Certification Emphasis'],
    industry: ['Healthcare', 'Medical', 'Nursing', 'Pharmacy', 'Clinical'],
    tags: ['healthcare', 'medical', 'professional'],
  },
  {
    id: 'legal',
    name: 'Legal Professional',
    description: 'Formal format for legal and law positions',
    preview: '⚖️',
    style: {
      fontSize: 12,
      fontFamily: 'Times New Roman, serif',
      lineHeight: 2.0,
      paragraphSpacing: 16,
      headerFormat: 'left',
      includeDate: true,
      includeAddress: true,
      signatureStyle: 'formal',
    },
    colors: {
      primary: '#18181b',
      text: '#3f3f46',
      accent: '#71717a',
    },
    tone: 'formal',
    features: ['Legal Format', 'Authoritative Tone', 'Detail Oriented', 'Bar Standards'],
    industry: ['Legal', 'Law', 'Attorney', 'Paralegal', 'Compliance'],
    tags: ['legal', 'law', 'formal'],
  },
  {
    id: 'sales',
    name: 'Sales & Business Development',
    description: 'Results-driven format for sales professionals',
    preview: '📈',
    style: {
      fontSize: 11,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.6,
      paragraphSpacing: 14,
      headerFormat: 'left',
      includeDate: true,
      includeAddress: false,
      signatureStyle: 'modern',
    },
    colors: {
      primary: '#047857',
      text: '#1f2937',
      accent: '#10b981',
    },
    tone: 'professional',
    features: ['Achievement Focus', 'Metrics Driven', 'Results Oriented', 'Persuasive Tone'],
    industry: ['Sales', 'Business Development', 'Account Management', 'Revenue', 'Commerce'],
    tags: ['sales', 'results', 'business'],
  },
  {
    id: 'engineering',
    name: 'Engineering Professional',
    description: 'Technical format for engineering positions',
    preview: '⚙️',
    style: {
      fontSize: 11,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.5,
      paragraphSpacing: 14,
      headerFormat: 'left',
      includeDate: true,
      includeAddress: true,
      signatureStyle: 'formal',
    },
    colors: {
      primary: '#0f172a',
      text: '#334155',
      accent: '#0ea5e9',
    },
    tone: 'professional',
    features: ['Technical Format', 'Project Focused', 'Detail Oriented', 'Problem Solving'],
    industry: ['Engineering', 'Technical', 'Manufacturing', 'Construction', 'Infrastructure'],
    tags: ['engineering', 'technical', 'professional'],
  },
  {
    id: 'tech',
    name: 'Tech Developer',
    description: 'Concise and direct format for software development roles',
    preview: '💻',
    style: {
      fontSize: 11,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.5,
      paragraphSpacing: 14,
      headerFormat: 'left',
      includeDate: false,
      includeAddress: false,
      signatureStyle: 'modern',
    },
    colors: {
      primary: '#0d1117',
      text: '#24292f',
      accent: '#2da44e',
    },
    tone: 'professional',
    features: ['Developer Focused', 'GitHub Style', 'Technical Emphasis', 'Project Highlights'],
  },
  {
    id: 'consulting',
    name: 'Consulting Professional',
    description: 'Strategic format for consulting and advisory roles',
    preview: '🎯',
    style: {
      fontSize: 11,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.6,
      paragraphSpacing: 16,
      headerFormat: 'center',
      includeDate: true,
      includeAddress: true,
      signatureStyle: 'formal',
    },
    colors: {
      primary: '#2c5282',
      text: '#2d3748',
      accent: '#805ad5',
    },
    tone: 'professional',
    features: ['Strategic Focus', 'Impact Driven', 'Case Examples', 'Client Success'],
  },
  {
    id: 'sales',
    name: 'Sales & Business Development',
    description: 'Results-oriented format for sales professionals',
    preview: '📈',
    style: {
      fontSize: 11,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.6,
      paragraphSpacing: 14,
      headerFormat: 'left',
      includeDate: true,
      includeAddress: false,
      signatureStyle: 'modern',
    },
    colors: {
      primary: '#c05621',
      text: '#2d3748',
      accent: '#38b2ac',
    },
    tone: 'professional',
    features: ['Results Focused', 'Achievement Metrics', 'Revenue Growth', 'Client Relations'],
  },
];

export const getCoverLetterTemplateById = (id: string): CoverLetterTemplate => {
  const template = defaultCoverLetterTemplates.find((t) => t.id === id);
  return template ?? defaultCoverLetterTemplates[0]!;
};

export const getDefaultCoverLetterTemplate = (): CoverLetterTemplate => {
  return defaultCoverLetterTemplates[0]!; // Classic Professional
};

// Helper functions to get i18n keys for templates
export const getCoverLetterTemplateNameKey = (templateId: string): string => {
  return `coverTemplates.${templateId}`;
};

export const getCoverLetterTemplateDescriptionKey = (templateId: string): string => {
  return `coverTemplates.${templateId}.desc`;
};

// Mapping of feature text to i18n keys
const featureToI18nKey: Record<string, string> = {
  'Traditional Format': 'coverTemplates.feature.traditionalFormat',
  'Formal Tone': 'coverTemplates.feature.formalTone',
  'ATS-Friendly': 'coverTemplates.feature.atsFriendly',
  'Corporate Standard': 'coverTemplates.feature.corporateStandard',
  'Clean Design': 'coverTemplates.feature.cleanDesign',
  'Modern Tone': 'coverTemplates.feature.modernTone',
  'Tech-Friendly': 'coverTemplates.feature.techFriendly',
  'Concise Format': 'coverTemplates.feature.conciseFormat',
  'Executive Style': 'coverTemplates.feature.executiveStyle',
  'Authoritative Tone': 'coverTemplates.feature.authoritativeTone',
  'Leadership Focus': 'coverTemplates.feature.leadershipFocus',
  'Premium Look': 'coverTemplates.feature.premiumLook',
  'Creative Layout': 'coverTemplates.feature.creativeLayout',
  'Expressive Tone': 'coverTemplates.feature.expressiveTone',
  'Design Focus': 'coverTemplates.feature.designFocus',
  'Personality Showcase': 'coverTemplates.feature.personalityShowcase',
  'Energetic Tone': 'coverTemplates.feature.energeticTone',
  'Fast-Paced Feel': 'coverTemplates.feature.fastPacedFeel',
  'Startup Culture': 'coverTemplates.feature.startupCulture',
  'Direct Communication': 'coverTemplates.feature.directCommunication',
  'Academic Format': 'coverTemplates.feature.academicFormat',
  'Scholarly Tone': 'coverTemplates.feature.scholarlyTone',
  'Research Focus': 'coverTemplates.feature.researchFocus',
  'Publication Standard': 'coverTemplates.feature.publicationStandard',
};

export const getCoverLetterFeatureI18nKey = (featureText: string): string => {
  return featureToI18nKey[featureText] || featureText;
};
