// CV Template definitions and styles

export type TemplateType = 'professional' | 'modern' | 'minimal' | 'creative' | 'technical' | 'academic';

export interface TemplateColors {
  primary: string;
  secondary: string;
  text: string;
  textLight: string;
  background: string;
  accent: string;
}

export interface TemplateFonts {
  heading: string;
  body: string;
  mono?: string;
}

export interface TemplateConfig {
  id: TemplateType;
  name: string;
  description: string;
  colors: TemplateColors;
  fonts: TemplateFonts;
  features: string[];
  bestFor: string[];
  preview: string;
}

export const DEFAULT_TEMPLATES: Record<TemplateType, TemplateConfig> = {
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Classic, ATS-friendly format for corporate positions',
    colors: {
      primary: '#1e293b',
      secondary: '#667eea',
      text: '#333333',
      textLight: '#64748b',
      background: '#ffffff',
      accent: '#667eea',
    },
    fonts: {
      heading: "'Arial', 'Helvetica', sans-serif",
      body: "'Arial', sans-serif",
    },
    features: ['ATS-optimized', 'Clean layout', 'Traditional style'],
    bestFor: ['Corporate jobs', 'Finance', 'Consulting', 'Management'],
    preview: '📊',
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Eye-catching design with gradient header and colors',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      text: '#1e293b',
      textLight: '#64748b',
      background: '#ffffff',
      accent: '#667eea',
    },
    fonts: {
      heading: "'Segoe UI', 'Helvetica', sans-serif",
      body: "'Segoe UI', sans-serif",
    },
    features: ['Gradient header', 'Colorful sections', 'Modern aesthetic'],
    bestFor: ['Startups', 'Tech companies', 'Creative roles', 'Marketing'],
    preview: '🎨',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple design with plenty of white space',
    colors: {
      primary: '#1e293b',
      secondary: '#475569',
      text: '#1e293b',
      textLight: '#64748b',
      background: '#ffffff',
      accent: '#1e293b',
    },
    fonts: {
      heading: "'Helvetica Neue', 'Arial', sans-serif",
      body: "'Helvetica Neue', sans-serif",
    },
    features: ['Minimalist design', 'High readability', 'Elegant typography'],
    bestFor: ['Design', 'Architecture', 'Photography', 'Writing'],
    preview: '✨',
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Bold and unique layout for creative professionals',
    colors: {
      primary: '#ec4899',
      secondary: '#8b5cf6',
      text: '#1e293b',
      textLight: '#64748b',
      background: '#ffffff',
      accent: '#ec4899',
    },
    fonts: {
      heading: "'Montserrat', 'Arial', sans-serif",
      body: "'Open Sans', sans-serif",
    },
    features: ['Bold colors', 'Unique layout', 'Attention-grabbing'],
    bestFor: ['Graphic Design', 'UX/UI Design', 'Art Direction', 'Branding'],
    preview: '🎭',
  },
  technical: {
    id: 'technical',
    name: 'Technical',
    description: 'Code-focused template for developers and engineers',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      text: '#1e293b',
      textLight: '#64748b',
      background: '#ffffff',
      accent: '#0ea5e9',
    },
    fonts: {
      heading: "'Roboto', 'Arial', sans-serif",
      body: "'Roboto', sans-serif",
      mono: "'Fira Code', 'Consolas', monospace",
    },
    features: ['Tech-focused', 'Code snippets', 'GitHub/portfolio emphasis'],
    bestFor: ['Software Engineering', 'DevOps', 'Data Science', 'IT'],
    preview: '💻',
  },
  academic: {
    id: 'academic',
    name: 'Academic',
    description: 'Formal template for research and academic positions',
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      text: '#1e293b',
      textLight: '#64748b',
      background: '#ffffff',
      accent: '#1e40af',
    },
    fonts: {
      heading: "'Times New Roman', 'Georgia', serif",
      body: "'Times New Roman', serif",
    },
    features: ['Publication list', 'Research focus', 'Traditional format'],
    bestFor: ['Academia', 'Research', 'Education', 'Science'],
    preview: '🎓',
  },
};

export function getTemplateStyles(
  template: TemplateType,
  customColors?: Partial<TemplateColors>,
  customFonts?: Partial<TemplateFonts>
) {
  const config = DEFAULT_TEMPLATES[template];
  const colors = { ...config.colors, ...customColors };
  const fonts = { ...config.fonts, ...customFonts };

  const baseStyles = {
    container: {
      width: '100%',
      height: '100%',
      background: '#f5f5f5',
      padding: '20px',
      overflowY: 'auto' as const,
    },
    page: {
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      background: colors.background,
      padding: '40px',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      minHeight: '1056px',
      fontFamily: fonts.body,
      fontSize: '13px',
      lineHeight: '1.5',
      color: colors.text,
    },
    header: {
      borderBottom: `2px solid ${colors.accent}`,
      paddingBottom: '16px',
      marginBottom: '24px',
    },
    name: {
      margin: '0 0 8px 0',
      fontSize: '32px',
      fontWeight: 700,
      color: colors.primary,
      fontFamily: fonts.heading,
      letterSpacing: '-0.5px',
    },
    contactInfo: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '16px',
      fontSize: '12px',
      color: colors.textLight,
      marginTop: '8px',
    },
    section: {
      marginBottom: '24px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 700,
      color: colors.accent,
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
      marginBottom: '12px',
      fontFamily: fonts.heading,
      borderBottom: `1px solid ${colors.textLight}20`,
      paddingBottom: '6px',
    },
    summaryText: {
      margin: 0,
      color: colors.textLight,
      lineHeight: '1.6',
    },
    skillsContainer: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '8px',
    },
    skillPill: {
      padding: '4px 12px',
      background: `${colors.accent}15`,
      border: `1px solid ${colors.accent}40`,
      borderRadius: '4px',
      fontSize: '12px',
      color: colors.text,
    },
    experienceItem: {
      marginBottom: '20px',
    },
    expHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '8px',
    },
    expTitle: {
      margin: '0 0 4px 0',
      fontSize: '15px',
      fontWeight: 600,
      color: colors.primary,
      fontFamily: fonts.heading,
    },
    expCompany: {
      fontSize: '13px',
      color: colors.textLight,
      fontWeight: 500,
    },
    expDate: {
      fontSize: '12px',
      color: colors.textLight,
      textAlign: 'right' as const,
      minWidth: '140px',
    },
    expDuration: {
      fontSize: '11px',
      color: colors.textLight,
      marginTop: '2px',
    },
    expDescription: {
      fontSize: '12px',
      color: colors.textLight,
      lineHeight: '1.6',
      marginTop: '8px',
    },
    educationItem: {
      marginBottom: '16px',
    },
    eduHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    eduTitle: {
      margin: '0 0 4px 0',
      fontSize: '14px',
      fontWeight: 600,
      color: colors.primary,
      fontFamily: fonts.heading,
    },
    eduSchool: {
      fontSize: '13px',
      color: colors.textLight,
    },
    eduDate: {
      fontSize: '12px',
      color: colors.textLight,
      textAlign: 'right' as const,
      minWidth: '140px',
    },
    eduGrade: {
      fontSize: '11px',
      color: colors.textLight,
      marginTop: '2px',
    },
    projectItem: {
      marginBottom: '16px',
    },
    projectTitle: {
      margin: '0 0 4px 0',
      fontSize: '14px',
      fontWeight: 600,
      color: colors.primary,
      fontFamily: fonts.heading,
    },
    projectDesc: {
      margin: 0,
      fontSize: '12px',
      color: colors.textLight,
      lineHeight: '1.6',
    },
    certItem: {
      marginBottom: '12px',
    },
    certTitle: {
      margin: '0 0 4px 0',
      fontSize: '14px',
      fontWeight: 600,
      color: colors.primary,
      fontFamily: fonts.heading,
    },
    certOrg: {
      fontSize: '12px',
      color: colors.textLight,
    },
    certId: {
      fontSize: '11px',
      color: colors.textLight,
      marginTop: '2px',
    },
  };

  // Template-specific customizations
  switch (template) {
    case 'modern':
      return {
        ...baseStyles,
        header: {
          ...baseStyles.header,
          borderBottom: 'none',
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          color: 'white',
          padding: '24px',
          margin: '-40px -40px 24px -40px',
          borderRadius: '0',
        },
        name: {
          ...baseStyles.name,
          color: 'white',
        },
        contactInfo: {
          ...baseStyles.contactInfo,
          color: 'rgba(255,255,255,0.9)',
        },
        sectionTitle: {
          ...baseStyles.sectionTitle,
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
      };

    case 'minimal':
      return {
        ...baseStyles,
        header: {
          ...baseStyles.header,
          borderBottom: 'none',
          borderLeft: `4px solid ${colors.primary}`,
          paddingLeft: '16px',
        },
        sectionTitle: {
          ...baseStyles.sectionTitle,
          borderBottom: 'none',
          fontSize: '14px',
          fontWeight: 600,
          textTransform: 'none' as const,
        },
        skillPill: {
          ...baseStyles.skillPill,
          background: 'transparent',
          border: 'none',
          padding: '0 8px 0 0',
        },
      };

    case 'creative':
      return {
        ...baseStyles,
        page: {
          ...baseStyles.page,
          background: `linear-gradient(180deg, ${colors.accent}05 0%, ${colors.background} 20%)`,
        },
        header: {
          ...baseStyles.header,
          borderBottom: 'none',
          borderLeft: `6px solid ${colors.accent}`,
          paddingLeft: '20px',
        },
        name: {
          ...baseStyles.name,
          fontSize: '36px',
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
        sectionTitle: {
          ...baseStyles.sectionTitle,
          borderBottom: `3px solid ${colors.accent}`,
          paddingBottom: '8px',
        },
        skillPill: {
          ...baseStyles.skillPill,
          background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}20 100%)`,
          borderColor: colors.accent,
        },
      };

    case 'technical':
      return {
        ...baseStyles,
        page: {
          ...baseStyles.page,
          borderLeft: `4px solid ${colors.accent}`,
        },
        header: {
          ...baseStyles.header,
          borderBottom: `2px dashed ${colors.accent}`,
          background: `${colors.accent}05`,
          margin: '-40px -40px 24px -40px',
          padding: '24px 40px',
        },
        name: {
          ...baseStyles.name,
          fontFamily: fonts.mono || fonts.heading,
          color: colors.accent,
        },
        sectionTitle: {
          ...baseStyles.sectionTitle,
          fontFamily: fonts.mono || fonts.heading,
          background: `${colors.accent}10`,
          padding: '8px 12px',
          borderRadius: '4px',
          borderBottom: 'none',
        },
        skillPill: {
          ...baseStyles.skillPill,
          fontFamily: fonts.mono || fonts.body,
          background: `${colors.accent}10`,
          borderColor: colors.accent,
        },
      };

    case 'academic':
      return {
        ...baseStyles,
        header: {
          ...baseStyles.header,
          textAlign: 'center' as const,
          borderBottom: `1px solid ${colors.primary}`,
        },
        name: {
          ...baseStyles.name,
          textAlign: 'center' as const,
        },
        contactInfo: {
          ...baseStyles.contactInfo,
          justifyContent: 'center',
        },
        sectionTitle: {
          ...baseStyles.sectionTitle,
          textAlign: 'center' as const,
          borderBottom: `1px solid ${colors.primary}`,
          textTransform: 'none' as const,
          fontSize: '16px',
        },
      };

    default:
      return baseStyles;
  }
}
