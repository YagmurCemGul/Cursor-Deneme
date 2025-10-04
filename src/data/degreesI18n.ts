import { Lang } from '../i18n';

export type DegreeCountry = 'US' | 'UK' | 'EU' | 'TR' | 'IN' | 'CA' | 'AU' | 'GLOBAL';
export type ExpandedLang = Lang | 'de' | 'es' | 'fr' | 'zh' | 'ar' | 'pt' | 'ja' | 'ko' | 'it' | 'nl';

export interface DegreeEquivalency {
  country: DegreeCountry;
  degreeName: string;
  similarity: number; // 0-100%
  notes?: string;
}

export interface AccreditationInfo {
  body: string;
  country: DegreeCountry;
  url?: string;
  type: 'national' | 'regional' | 'professional';
}

export interface InstitutionInfo {
  country: DegreeCountry;
  searchUrl?: string;
  exampleInstitutions?: string[];
}

export interface DegreeOption {
  en: string;
  tr: string;
  de?: string;
  es?: string;
  fr?: string;
  zh?: string; // Chinese (Simplified)
  ar?: string; // Arabic
  pt?: string; // Portuguese
  ja?: string; // Japanese
  ko?: string; // Korean
  it?: string; // Italian
  nl?: string; // Dutch
  fullName?: string;
  description?: string;
  countries: DegreeCountry[];
  category: 'high-school' | 'associate' | 'bachelor' | 'master' | 'doctoral' | 'professional' | 'other';
  relatedFields?: string[];
  verificationLinks?: {
    [country: string]: string;
  };
  equivalentDegrees?: DegreeEquivalency[];
  accreditation?: AccreditationInfo[];
  institutions?: InstitutionInfo[];
  historicalNames?: string[]; // Deprecated/old names for this degree
  aiValidation?: {
    requiredFields?: string[];
    incompatibleFields?: string[];
  };
}

export const degreeOptions: DegreeOption[] = [
  // High School & Associate
  {
    en: 'High School Diploma',
    tr: 'Lise Diploması',
    de: 'Abitur / Hochschulreife',
    es: 'Bachillerato',
    fr: 'Baccalauréat',
    fullName: 'High School Diploma',
    description: 'Secondary education completion certificate',
    countries: ['GLOBAL'],
    category: 'high-school',
    verificationLinks: {
      US: 'https://www.studentclearinghouse.org/',
      UK: 'https://www.gov.uk/check-uk-qualifications',
    },
  },
  {
    en: 'Associate Degree',
    tr: 'Ön Lisans',
    de: 'Associate-Abschluss',
    es: 'Grado Asociado',
    fr: 'Diplôme Associé',
    fullName: 'Associate Degree',
    description: 'Two-year undergraduate degree',
    countries: ['US', 'GLOBAL'],
    category: 'associate',
    relatedFields: [],
  },

  // Bachelor's Degrees (Lisans)
  {
    en: "Bachelor's Degree",
    tr: 'Lisans Derecesi',
    de: 'Bachelor-Abschluss',
    es: 'Licenciatura',
    fr: 'Licence',
    fullName: "Bachelor's Degree",
    description: 'Undergraduate degree (3-4 years)',
    countries: ['GLOBAL'],
    category: 'bachelor',
    relatedFields: [],
  },
  {
    en: 'Bachelor of Arts (BA)',
    tr: 'Edebiyat Fakültesi (BA)',
    de: 'Bachelor of Arts (BA)',
    es: 'Licenciatura en Artes (BA)',
    fr: 'Licence ès Arts (BA)',
    fullName: 'Bachelor of Arts',
    description: 'Undergraduate degree in liberal arts, humanities, or social sciences',
    countries: ['GLOBAL'],
    category: 'bachelor',
    relatedFields: ['humanities', 'social sciences', 'languages', 'history', 'psychology', 'arts'],
  },
  {
    en: 'Bachelor of Science (BSc)',
    tr: 'Fen Fakültesi (BSc)',
    de: 'Bachelor of Science (BSc)',
    es: 'Licenciatura en Ciencias (BSc)',
    fr: 'Licence ès Sciences (BSc)',
    fullName: 'Bachelor of Science',
    description: 'Undergraduate degree in science, technology, or mathematics',
    countries: ['GLOBAL'],
    category: 'bachelor',
    relatedFields: ['science', 'technology', 'mathematics', 'physics', 'chemistry', 'biology', 'computer science'],
  },
  {
    en: 'Bachelor of Engineering (BEng)',
    tr: 'Mühendislik Fakültesi (BEng)',
    de: 'Bachelor of Engineering (BEng)',
    es: 'Ingeniería (BEng)',
    fr: 'Licence en Ingénierie (BEng)',
    fullName: 'Bachelor of Engineering',
    description: 'Undergraduate degree in engineering',
    countries: ['UK', 'EU', 'GLOBAL'],
    category: 'bachelor',
    relatedFields: ['engineering', 'mechanical', 'electrical', 'civil', 'chemical'],
  },
  {
    en: 'Bachelor of Technology (BTech)',
    tr: 'Teknoloji Fakültesi (BTech)',
    de: 'Bachelor of Technology (BTech)',
    es: 'Licenciatura en Tecnología (BTech)',
    fr: 'Licence en Technologie (BTech)',
    fullName: 'Bachelor of Technology',
    description: 'Undergraduate degree in technology and applied sciences',
    countries: ['GLOBAL'],
    category: 'bachelor',
    relatedFields: ['technology', 'engineering', 'computer science', 'information technology'],
  },
  {
    en: 'Bachelor of Business Administration (BBA)',
    tr: 'İşletme Fakültesi (BBA)',
    de: 'Bachelor of Business Administration (BBA)',
    es: 'Licenciatura en Administración de Empresas (BBA)',
    fr: 'Licence en Administration des Affaires (BBA)',
    fullName: 'Bachelor of Business Administration',
    description: 'Undergraduate degree in business management',
    countries: ['GLOBAL'],
    category: 'bachelor',
    relatedFields: ['business', 'management', 'finance', 'marketing', 'economics'],
  },
  {
    en: 'Bachelor of Commerce (BCom)',
    tr: 'Ticaret Fakültesi (BCom)',
    de: 'Bachelor of Commerce (BCom)',
    es: 'Licenciatura en Comercio (BCom)',
    fr: 'Licence en Commerce (BCom)',
    fullName: 'Bachelor of Commerce',
    description: 'Undergraduate degree in commerce and business',
    countries: ['UK', 'GLOBAL'],
    category: 'bachelor',
    relatedFields: ['commerce', 'accounting', 'finance', 'business'],
  },
  {
    en: 'Bachelor of Fine Arts (BFA)',
    tr: 'Güzel Sanatlar Fakültesi (BFA)',
    de: 'Bachelor of Fine Arts (BFA)',
    es: 'Licenciatura en Bellas Artes (BFA)',
    fr: 'Licence en Beaux-Arts (BFA)',
    fullName: 'Bachelor of Fine Arts',
    description: 'Undergraduate degree in visual or performing arts',
    countries: ['GLOBAL'],
    category: 'bachelor',
    relatedFields: ['art', 'design', 'music', 'theater', 'dance', 'film'],
  },
  {
    en: 'Bachelor of Education (BEd)',
    tr: 'Eğitim Fakültesi (BEd)',
    de: 'Bachelor of Education (BEd)',
    es: 'Licenciatura en Educación (BEd)',
    fr: 'Licence en Éducation (BEd)',
    fullName: 'Bachelor of Education',
    description: 'Undergraduate degree in education and teaching',
    countries: ['GLOBAL'],
    category: 'bachelor',
    relatedFields: ['education', 'teaching', 'pedagogy'],
  },
  {
    en: 'Bachelor of Laws (LLB)',
    tr: 'Hukuk Fakültesi (LLB)',
    de: 'Bachelor of Laws (LLB)',
    es: 'Licenciatura en Derecho (LLB)',
    fr: 'Licence en Droit (LLB)',
    zh: '法学士 (LLB)',
    ar: 'بكالوريوس القانون (LLB)',
    pt: 'Bacharelado em Direito (LLB)',
    fullName: 'Bachelor of Laws / Legum Baccalaureus',
    description: 'Undergraduate degree in law',
    countries: ['UK', 'EU', 'IN', 'AU', 'CA', 'GLOBAL'],
    category: 'bachelor',
    relatedFields: ['law', 'legal', 'jurisprudence'],
    equivalentDegrees: [
      { country: 'US', degreeName: 'Juris Doctor (JD)', similarity: 75, notes: 'JD is a professional doctorate in US, while LLB is undergraduate in other countries' },
    ],
    historicalNames: ['Bachelor of Law', 'LL.B.'],
    accreditation: [
      { body: 'SRA', country: 'UK', url: 'https://www.sra.org.uk/', type: 'professional' },
      { body: 'Bar Council', country: 'UK', url: 'https://www.barcouncil.org.uk/', type: 'professional' },
    ],
    aiValidation: {
      requiredFields: ['law', 'legal', 'jurisprudence'],
      incompatibleFields: ['engineering', 'medicine', 'science'],
    },
  },
  {
    en: 'Bachelor of Medicine, Bachelor of Surgery (MBBS)',
    tr: 'Tıp Fakültesi (MBBS)',
    de: 'Bachelor of Medicine, Bachelor of Surgery (MBBS)',
    es: 'Licenciatura en Medicina y Cirugía (MBBS)',
    fr: 'Licence en Médecine et Chirurgie (MBBS)',
    fullName: 'Bachelor of Medicine, Bachelor of Surgery',
    description: 'Medical degree',
    countries: ['UK', 'EU', 'GLOBAL'],
    category: 'bachelor',
    relatedFields: ['medicine', 'medical', 'healthcare'],
  },
  {
    en: 'Bachelor of Architecture (BArch)',
    tr: 'Mimarlık Fakültesi (BArch)',
    de: 'Bachelor of Architecture (BArch)',
    es: 'Licenciatura en Arquitectura (BArch)',
    fr: 'Licence en Architecture (BArch)',
    fullName: 'Bachelor of Architecture',
    description: 'Undergraduate degree in architecture',
    countries: ['GLOBAL'],
    category: 'bachelor',
    relatedFields: ['architecture', 'design', 'urban planning'],
  },
  {
    en: 'Bachelor of Computer Applications (BCA)',
    tr: 'Bilgisayar Uygulamaları (BCA)',
    de: 'Bachelor of Computer Applications (BCA)',
    es: 'Licenciatura en Aplicaciones Informáticas (BCA)',
    fr: 'Licence en Applications Informatiques (BCA)',
    fullName: 'Bachelor of Computer Applications',
    description: 'Undergraduate degree in computer applications',
    countries: ['GLOBAL'],
    category: 'bachelor',
    relatedFields: ['computer science', 'programming', 'software development', 'IT'],
  },
  {
    en: 'Bachelor of Social Work (BSW)',
    tr: 'Sosyal Hizmetler (BSW)',
    de: 'Bachelor of Social Work (BSW)',
    es: 'Licenciatura en Trabajo Social (BSW)',
    fr: 'Licence en Travail Social (BSW)',
    fullName: 'Bachelor of Social Work',
    description: 'Undergraduate degree in social work',
    countries: ['GLOBAL'],
    category: 'bachelor',
    relatedFields: ['social work', 'social services', 'community service'],
  },
  {
    en: 'Bachelor of Pharmacy (BPharm)',
    tr: 'Eczacılık Fakültesi (BPharm)',
    de: 'Bachelor of Pharmacy (BPharm)',
    es: 'Licenciatura en Farmacia (BPharm)',
    fr: 'Licence en Pharmacie (BPharm)',
    fullName: 'Bachelor of Pharmacy',
    description: 'Undergraduate degree in pharmacy',
    countries: ['GLOBAL'],
    category: 'bachelor',
    relatedFields: ['pharmacy', 'pharmaceutical', 'healthcare'],
  },
  {
    en: 'Bachelor of Nursing (BN)',
    tr: 'Hemşirelik Fakültesi (BN)',
    de: 'Bachelor of Nursing (BN)',
    es: 'Licenciatura en Enfermería (BN)',
    fr: 'Licence en Sciences Infirmières (BN)',
    zh: '护理学学士 (BN)',
    ar: 'بكالوريوس التمريض (BN)',
    pt: 'Bacharelado em Enfermagem (BN)',
    fullName: 'Bachelor of Nursing',
    description: 'Undergraduate degree in nursing',
    countries: ['GLOBAL'],
    category: 'bachelor',
    relatedFields: ['nursing', 'healthcare', 'medical'],
    accreditation: [
      { body: 'ACEN', country: 'US', url: 'https://www.acenursing.org/', type: 'national' },
      { body: 'NMC', country: 'UK', url: 'https://www.nmc.org.uk/', type: 'national' },
    ],
  },

  // India-Specific Degrees
  {
    en: 'Bachelor of Technology (B.Tech)',
    tr: 'Teknoloji Lisansı (B.Tech)',
    de: 'Bachelor of Technology (B.Tech)',
    es: 'Licenciatura en Tecnología (B.Tech)',
    fr: 'Licence en Technologie (B.Tech)',
    zh: '技术学士 (B.Tech)',
    ar: 'بكالوريوس التكنولوجيا (B.Tech)',
    pt: 'Bacharelado em Tecnologia (B.Tech)',
    fullName: 'Bachelor of Technology',
    description: 'Four-year undergraduate engineering degree (India)',
    countries: ['IN', 'GLOBAL'],
    category: 'bachelor',
    relatedFields: ['engineering', 'technology', 'computer science'],
    verificationLinks: {
      IN: 'https://www.aicte-india.org/',
    },
    equivalentDegrees: [
      { country: 'US', degreeName: 'Bachelor of Science (BSc)', similarity: 90, notes: 'Similar to BSc in Engineering' },
      { country: 'UK', degreeName: 'Bachelor of Engineering (BEng)', similarity: 95 },
    ],
    accreditation: [
      { body: 'AICTE', country: 'IN', url: 'https://www.aicte-india.org/', type: 'national' },
      { body: 'NBA', country: 'IN', url: 'https://www.nbaind.org/', type: 'national' },
    ],
    institutions: [
      {
        country: 'IN',
        searchUrl: 'https://www.ugc.ac.in/',
        exampleInstitutions: ['IIT', 'NIT', 'BITS Pilani'],
      },
    ],
    aiValidation: {
      requiredFields: ['engineering', 'technology', 'computer science', 'electronics'],
      incompatibleFields: ['arts', 'humanities', 'social sciences'],
    },
  },
  {
    en: 'Bachelor of Engineering (B.E.)',
    tr: 'Mühendislik Lisansı (B.E.)',
    de: 'Bachelor of Engineering (B.E.)',
    es: 'Ingeniería (B.E.)',
    fr: 'Licence en Ingénierie (B.E.)',
    zh: '工学士 (B.E.)',
    ar: 'بكالوريوس الهندسة (B.E.)',
    pt: 'Bacharelado em Engenharia (B.E.)',
    fullName: 'Bachelor of Engineering',
    description: 'Four-year undergraduate engineering degree (India)',
    countries: ['IN', 'GLOBAL'],
    category: 'bachelor',
    relatedFields: ['engineering', 'mechanical', 'civil', 'electrical'],
    verificationLinks: {
      IN: 'https://www.aicte-india.org/',
    },
    equivalentDegrees: [
      { country: 'IN', degreeName: 'Bachelor of Technology (B.Tech)', similarity: 98 },
      { country: 'UK', degreeName: 'Bachelor of Engineering (BEng)', similarity: 95 },
    ],
    accreditation: [
      { body: 'AICTE', country: 'IN', url: 'https://www.aicte-india.org/', type: 'national' },
    ],
  },
  {
    en: 'Master of Technology (M.Tech)',
    tr: 'Teknoloji Yüksek Lisansı (M.Tech)',
    de: 'Master of Technology (M.Tech)',
    es: 'Maestría en Tecnología (M.Tech)',
    fr: 'Master en Technologie (M.Tech)',
    zh: '技术硕士 (M.Tech)',
    ar: 'ماجستير التكنولوجيا (M.Tech)',
    pt: 'Mestrado em Tecnologia (M.Tech)',
    fullName: 'Master of Technology',
    description: 'Two-year postgraduate degree in technology (India)',
    countries: ['IN', 'GLOBAL'],
    category: 'master',
    relatedFields: ['technology', 'engineering', 'computer science'],
    equivalentDegrees: [
      { country: 'US', degreeName: 'Master of Science (MSc)', similarity: 90 },
      { country: 'UK', degreeName: 'Master of Engineering (MEng)', similarity: 92 },
    ],
    accreditation: [
      { body: 'AICTE', country: 'IN', url: 'https://www.aicte-india.org/', type: 'national' },
    ],
  },

  // Canada-Specific Degrees
  {
    en: 'Honours Bachelor Degree',
    tr: 'Onur Lisans Derecesi',
    de: 'Honours Bachelor',
    es: 'Licenciatura con Honores',
    fr: 'Baccalauréat avec Distinction',
    zh: '荣誉学士学位',
    ar: 'درجة البكالوريوس مع مرتبة الشرف',
    pt: 'Bacharelado com Honras',
    fullName: 'Honours Bachelor Degree',
    description: 'Four-year intensive undergraduate degree (Canada)',
    countries: ['CA', 'GLOBAL'],
    category: 'bachelor',
    relatedFields: [],
    verificationLinks: {
      CA: 'https://www.cicic.ca/',
    },
    equivalentDegrees: [
      { country: 'US', degreeName: "Bachelor's Degree", similarity: 95, notes: 'More rigorous than standard BA/BSc' },
      { country: 'UK', degreeName: "Bachelor's Degree", similarity: 95 },
    ],
    historicalNames: ['4-year Bachelor with Honours'],
    institutions: [
      {
        country: 'CA',
        searchUrl: 'https://www.univcan.ca/',
        exampleInstitutions: ['University of Toronto', 'McGill University', 'UBC'],
      },
    ],
  },
  {
    en: 'Graduate Diploma',
    tr: 'Lisansüstü Diploma',
    de: 'Graduate Diploma',
    es: 'Diploma de Posgrado',
    fr: 'Diplôme d\'Études Supérieures',
    zh: '研究生文凭',
    ar: 'دبلوم الدراسات العليا',
    pt: 'Diploma de Pós-Graduação',
    fullName: 'Graduate Diploma',
    description: 'Post-bachelor qualification (Canada/Australia)',
    countries: ['CA', 'AU', 'GLOBAL'],
    category: 'professional',
    relatedFields: [],
    equivalentDegrees: [
      { country: 'US', degreeName: 'Graduate Certificate', similarity: 85 },
    ],
  },

  // Australia-Specific Degrees
  {
    en: 'Bachelor (Honours)',
    tr: 'Onur Lisans Derecesi',
    de: 'Bachelor mit Auszeichnung',
    es: 'Licenciatura con Honores',
    fr: 'Licence avec Mention',
    zh: '荣誉学士',
    ar: 'بكالوريوس مع مرتبة الشرف',
    pt: 'Bacharelado com Honras',
    fullName: 'Bachelor with Honours',
    description: 'Four-year degree or 3-year + 1 honours year (Australia)',
    countries: ['AU', 'GLOBAL'],
    category: 'bachelor',
    relatedFields: [],
    verificationLinks: {
      AU: 'https://www.aqf.edu.au/',
    },
    equivalentDegrees: [
      { country: 'CA', degreeName: 'Honours Bachelor Degree', similarity: 98 },
      { country: 'UK', degreeName: 'Honours Degree', similarity: 95 },
    ],
    institutions: [
      {
        country: 'AU',
        searchUrl: 'https://www.universitiesaustralia.edu.au/',
        exampleInstitutions: ['ANU', 'University of Melbourne', 'University of Sydney'],
      },
    ],
  },
  {
    en: 'Graduate Certificate (Australia)',
    tr: 'Lisansüstü Sertifika',
    de: 'Graduate Certificate',
    es: 'Certificado de Posgrado',
    fr: 'Certificat de Troisième Cycle',
    zh: '研究生证书',
    ar: 'شهادة الدراسات العليا',
    pt: 'Certificado de Pós-Graduação',
    fullName: 'Graduate Certificate',
    description: 'Six-month postgraduate qualification (Australia)',
    countries: ['AU', 'GLOBAL'],
    category: 'professional',
    relatedFields: [],
    verificationLinks: {
      AU: 'https://www.aqf.edu.au/',
    },
  },

  // Master's Degrees (Yüksek Lisans)
  {
    en: "Master's Degree",
    tr: 'Yüksek Lisans Derecesi',
    de: 'Master-Abschluss',
    es: 'Maestría',
    fr: 'Master',
    fullName: "Master's Degree",
    description: 'Postgraduate degree (1-2 years)',
    countries: ['GLOBAL'],
    category: 'master',
    relatedFields: [],
  },
  {
    en: 'Master of Arts (MA)',
    tr: 'Yüksek Lisans - Edebiyat (MA)',
    de: 'Master of Arts (MA)',
    es: 'Maestría en Artes (MA)',
    fr: 'Master ès Arts (MA)',
    fullName: 'Master of Arts',
    description: 'Postgraduate degree in humanities or social sciences',
    countries: ['GLOBAL'],
    category: 'master',
    relatedFields: ['humanities', 'social sciences', 'arts', 'languages'],
  },
  {
    en: 'Master of Science (MSc)',
    tr: 'Yüksek Lisans - Fen (MSc)',
    de: 'Master of Science (MSc)',
    es: 'Maestría en Ciencias (MSc)',
    fr: 'Master ès Sciences (MSc)',
    fullName: 'Master of Science',
    description: 'Postgraduate degree in sciences or technology',
    countries: ['GLOBAL'],
    category: 'master',
    relatedFields: ['science', 'technology', 'engineering', 'mathematics'],
  },
  {
    en: 'Master of Engineering (MEng)',
    tr: 'Yüksek Lisans - Mühendislik (MEng)',
    de: 'Master of Engineering (MEng)',
    es: 'Maestría en Ingeniería (MEng)',
    fr: 'Master en Ingénierie (MEng)',
    fullName: 'Master of Engineering',
    description: 'Postgraduate degree in engineering',
    countries: ['GLOBAL'],
    category: 'master',
    relatedFields: ['engineering', 'technology'],
  },
  {
    en: 'Master of Business Administration (MBA)',
    tr: 'İşletme Yüksek Lisansı (MBA)',
    de: 'Master of Business Administration (MBA)',
    es: 'Maestría en Administración de Empresas (MBA)',
    fr: 'Master en Administration des Affaires (MBA)',
    zh: '工商管理硕士 (MBA)',
    ar: 'ماجستير إدارة الأعمال (MBA)',
    pt: 'Mestrado em Administração de Empresas (MBA)',
    ja: '経営学修士 (MBA)',
    ko: '경영학석사 (MBA)',
    it: 'Master in Amministrazione Aziendale (MBA)',
    nl: 'Master in Bedrijfskunde (MBA)',
    fullName: 'Master of Business Administration',
    description: 'Postgraduate degree in business administration',
    countries: ['GLOBAL'],
    category: 'master',
    relatedFields: ['business', 'management', 'leadership', 'finance'],
    historicalNames: ['M.B.A.', 'Masters in Business Administration'],
    accreditation: [
      { body: 'AACSB', country: 'GLOBAL', url: 'https://www.aacsb.edu/', type: 'professional' },
      { body: 'AMBA', country: 'UK', url: 'https://www.associationofmbas.com/', type: 'professional' },
      { body: 'EQUIS', country: 'EU', url: 'https://www.efmdglobal.org/accreditations/business-school-accreditation/equis/', type: 'professional' },
    ],
    institutions: [
      {
        country: 'GLOBAL',
        exampleInstitutions: ['Harvard Business School', 'Stanford GSB', 'Wharton', 'INSEAD', 'LBS'],
      },
    ],
    aiValidation: {
      requiredFields: ['business', 'management', 'finance', 'economics'],
      incompatibleFields: [],
    },
  },
  {
    en: 'Master of Technology (MTech)',
    tr: 'Yüksek Lisans - Teknoloji (MTech)',
    de: 'Master of Technology (MTech)',
    es: 'Maestría en Tecnología (MTech)',
    fr: 'Master en Technologie (MTech)',
    fullName: 'Master of Technology',
    description: 'Postgraduate degree in technology',
    countries: ['GLOBAL'],
    category: 'master',
    relatedFields: ['technology', 'engineering'],
  },
  {
    en: 'Master of Computer Applications (MCA)',
    tr: 'Yüksek Lisans - Bilgisayar Uygulamaları (MCA)',
    de: 'Master of Computer Applications (MCA)',
    es: 'Maestría en Aplicaciones Informáticas (MCA)',
    fr: 'Master en Applications Informatiques (MCA)',
    fullName: 'Master of Computer Applications',
    description: 'Postgraduate degree in computer applications',
    countries: ['GLOBAL'],
    category: 'master',
    relatedFields: ['computer science', 'IT', 'software'],
  },
  {
    en: 'Master of Fine Arts (MFA)',
    tr: 'Yüksek Lisans - Güzel Sanatlar (MFA)',
    de: 'Master of Fine Arts (MFA)',
    es: 'Maestría en Bellas Artes (MFA)',
    fr: 'Master en Beaux-Arts (MFA)',
    fullName: 'Master of Fine Arts',
    description: 'Postgraduate degree in fine arts',
    countries: ['GLOBAL'],
    category: 'master',
    relatedFields: ['art', 'design', 'creative'],
  },
  {
    en: 'Master of Education (MEd)',
    tr: 'Yüksek Lisans - Eğitim (MEd)',
    de: 'Master of Education (MEd)',
    es: 'Maestría en Educación (MEd)',
    fr: 'Master en Éducation (MEd)',
    fullName: 'Master of Education',
    description: 'Postgraduate degree in education',
    countries: ['GLOBAL'],
    category: 'master',
    relatedFields: ['education', 'teaching'],
  },
  {
    en: 'Master of Laws (LLM)',
    tr: 'Yüksek Lisans - Hukuk (LLM)',
    de: 'Master of Laws (LLM)',
    es: 'Maestría en Derecho (LLM)',
    fr: 'Master en Droit (LLM)',
    fullName: 'Master of Laws / Legum Magister',
    description: 'Postgraduate degree in law',
    countries: ['GLOBAL'],
    category: 'master',
    relatedFields: ['law', 'legal'],
  },
  {
    en: 'Master of Public Health (MPH)',
    tr: 'Yüksek Lisans - Halk Sağlığı (MPH)',
    de: 'Master of Public Health (MPH)',
    es: 'Maestría en Salud Pública (MPH)',
    fr: 'Master en Santé Publique (MPH)',
    fullName: 'Master of Public Health',
    description: 'Postgraduate degree in public health',
    countries: ['GLOBAL'],
    category: 'master',
    relatedFields: ['public health', 'healthcare', 'epidemiology'],
  },
  {
    en: 'Master of Social Work (MSW)',
    tr: 'Yüksek Lisans - Sosyal Hizmetler (MSW)',
    de: 'Master of Social Work (MSW)',
    es: 'Maestría en Trabajo Social (MSW)',
    fr: 'Master en Travail Social (MSW)',
    fullName: 'Master of Social Work',
    description: 'Postgraduate degree in social work',
    countries: ['GLOBAL'],
    category: 'master',
    relatedFields: ['social work', 'social services'],
  },
  {
    en: 'Master of Architecture (MArch)',
    tr: 'Yüksek Lisans - Mimarlık (MArch)',
    de: 'Master of Architecture (MArch)',
    es: 'Maestría en Arquitectura (MArch)',
    fr: 'Master en Architecture (MArch)',
    fullName: 'Master of Architecture',
    description: 'Postgraduate degree in architecture',
    countries: ['GLOBAL'],
    category: 'master',
    relatedFields: ['architecture', 'design'],
  },

  // Doctoral Degrees (Doktora)
  {
    en: 'Doctoral Degree',
    tr: 'Doktora Derecesi',
    de: 'Doktorgrad',
    es: 'Doctorado',
    fr: 'Doctorat',
    fullName: 'Doctoral Degree',
    description: 'Highest academic degree (3-7 years)',
    countries: ['GLOBAL'],
    category: 'doctoral',
    relatedFields: [],
  },
  {
    en: 'Doctor of Philosophy (PhD)',
    tr: 'Doktora (PhD)',
    de: 'Doktor der Philosophie (PhD)',
    es: 'Doctorado (PhD)',
    fr: 'Doctorat (PhD)',
    fullName: 'Doctor of Philosophy',
    description: 'Research doctoral degree in any field',
    countries: ['GLOBAL'],
    category: 'doctoral',
    relatedFields: [],
  },
  {
    en: 'Doctor of Medicine (MD)',
    tr: 'Tıp Doktoru (MD)',
    de: 'Doktor der Medizin (MD)',
    es: 'Doctor en Medicina (MD)',
    fr: 'Docteur en Médecine (MD)',
    fullName: 'Doctor of Medicine',
    description: 'Medical doctorate degree',
    countries: ['US', 'GLOBAL'],
    category: 'doctoral',
    relatedFields: ['medicine', 'medical'],
  },
  {
    en: 'Doctor of Dental Surgery (DDS)',
    tr: 'Diş Hekimliği Doktoru (DDS)',
    de: 'Doktor der Zahnmedizin (DDS)',
    es: 'Doctor en Cirugía Dental (DDS)',
    fr: 'Docteur en Chirurgie Dentaire (DDS)',
    fullName: 'Doctor of Dental Surgery',
    description: 'Dental doctorate degree',
    countries: ['US', 'GLOBAL'],
    category: 'doctoral',
    relatedFields: ['dentistry', 'dental'],
  },
  {
    en: 'Doctor of Dental Medicine (DMD)',
    tr: 'Diş Hekimliği Doktoru (DMD)',
    de: 'Doktor der Zahnmedizin (DMD)',
    es: 'Doctor en Medicina Dental (DMD)',
    fr: 'Docteur en Médecine Dentaire (DMD)',
    fullName: 'Doctor of Dental Medicine',
    description: 'Dental doctorate degree',
    countries: ['US', 'GLOBAL'],
    category: 'doctoral',
    relatedFields: ['dentistry', 'dental'],
  },
  {
    en: 'Juris Doctor (JD)',
    tr: 'Hukuk Doktoru (JD)',
    de: 'Juris Doctor (JD)',
    es: 'Doctor en Jurisprudencia (JD)',
    fr: 'Docteur en Droit (JD)',
    zh: '法律博士 (JD)',
    ar: 'دكتوراه في القانون (JD)',
    pt: 'Doutor em Direito (JD)',
    fullName: 'Juris Doctor',
    description: 'Professional doctorate in law (US)',
    countries: ['US', 'CA', 'GLOBAL'],
    category: 'doctoral',
    relatedFields: ['law', 'legal'],
    equivalentDegrees: [
      { country: 'UK', degreeName: 'Bachelor of Laws (LLB)', similarity: 75, notes: 'LLB is undergraduate in UK, JD is professional doctorate in US' },
      { country: 'EU', degreeName: 'Master of Laws (LLM)', similarity: 80 },
    ],
    historicalNames: ['Doctor of Law', 'Doctor of Jurisprudence', 'J.D.'],
    accreditation: [
      { body: 'ABA', country: 'US', url: 'https://www.americanbar.org/', type: 'national' },
    ],
    aiValidation: {
      requiredFields: ['law', 'legal'],
      incompatibleFields: ['engineering', 'medicine'],
    },
  },
  {
    en: 'Doctor of Education (EdD)',
    tr: 'Eğitim Doktoru (EdD)',
    de: 'Doktor der Erziehungswissenschaften (EdD)',
    es: 'Doctor en Educación (EdD)',
    fr: 'Docteur en Éducation (EdD)',
    fullName: 'Doctor of Education',
    description: 'Professional doctorate in education',
    countries: ['GLOBAL'],
    category: 'doctoral',
    relatedFields: ['education', 'teaching'],
  },
  {
    en: 'Doctor of Business Administration (DBA)',
    tr: 'İşletme Doktoru (DBA)',
    de: 'Doktor der Betriebswirtschaftslehre (DBA)',
    es: 'Doctor en Administración de Empresas (DBA)',
    fr: 'Docteur en Administration des Affaires (DBA)',
    fullName: 'Doctor of Business Administration',
    description: 'Professional doctorate in business',
    countries: ['GLOBAL'],
    category: 'doctoral',
    relatedFields: ['business', 'management'],
  },
  {
    en: 'Doctor of Engineering (EngD)',
    tr: 'Mühendislik Doktoru (EngD)',
    de: 'Doktor der Ingenieurwissenschaften (EngD)',
    es: 'Doctor en Ingeniería (EngD)',
    fr: 'Docteur en Ingénierie (EngD)',
    fullName: 'Doctor of Engineering',
    description: 'Professional doctorate in engineering',
    countries: ['UK', 'GLOBAL'],
    category: 'doctoral',
    relatedFields: ['engineering'],
  },
  {
    en: 'Doctor of Pharmacy (PharmD)',
    tr: 'Eczacılık Doktoru (PharmD)',
    de: 'Doktor der Pharmazie (PharmD)',
    es: 'Doctor en Farmacia (PharmD)',
    fr: 'Docteur en Pharmacie (PharmD)',
    fullName: 'Doctor of Pharmacy',
    description: 'Professional doctorate in pharmacy',
    countries: ['US', 'GLOBAL'],
    category: 'doctoral',
    relatedFields: ['pharmacy', 'pharmaceutical'],
  },
  {
    en: 'Doctor of Veterinary Medicine (DVM)',
    tr: 'Veteriner Hekimliği Doktoru (DVM)',
    de: 'Doktor der Veterinärmedizin (DVM)',
    es: 'Doctor en Medicina Veterinaria (DVM)',
    fr: 'Docteur en Médecine Vétérinaire (DVM)',
    fullName: 'Doctor of Veterinary Medicine',
    description: 'Professional doctorate in veterinary medicine',
    countries: ['US', 'GLOBAL'],
    category: 'doctoral',
    relatedFields: ['veterinary', 'animal health'],
  },

  // Professional & Other Degrees
  {
    en: 'Professional Degree',
    tr: 'Profesyonel Derece',
    de: 'Berufsabschluss',
    es: 'Título Profesional',
    fr: 'Diplôme Professionnel',
    fullName: 'Professional Degree',
    description: 'Specialized professional qualification',
    countries: ['GLOBAL'],
    category: 'professional',
    relatedFields: [],
  },
  {
    en: 'Certificate',
    tr: 'Sertifika',
    de: 'Zertifikat',
    es: 'Certificado',
    fr: 'Certificat',
    fullName: 'Certificate',
    description: 'Short-term specialized training certificate',
    countries: ['GLOBAL'],
    category: 'other',
    relatedFields: [],
  },
  {
    en: 'Diploma',
    tr: 'Diploma',
    de: 'Diplom',
    es: 'Diploma',
    fr: 'Diplôme',
    fullName: 'Diploma',
    description: 'Professional or vocational diploma',
    countries: ['GLOBAL'],
    category: 'other',
    relatedFields: [],
  },
  {
    en: 'Other',
    tr: 'Diğer',
    de: 'Sonstiges',
    es: 'Otro',
    fr: 'Autre',
    fullName: 'Other',
    description: 'Other educational qualifications',
    countries: ['GLOBAL'],
    category: 'other',
    relatedFields: [],
  },
];

export function getDegrees(lang: Lang, country?: DegreeCountry): string[] {
  let filteredOptions = degreeOptions;
  
  // Filter by country if specified
  if (country && country !== 'GLOBAL') {
    filteredOptions = degreeOptions.filter(
      (option) => option.countries.includes(country) || option.countries.includes('GLOBAL')
    );
  }
  
  return filteredOptions.map((option) => {
    const langKey = lang as keyof DegreeOption;
    return (option[langKey] as string) || option.en;
  });
}

export function getDegreeName(englishName: string, lang: Lang): string {
  const option = degreeOptions.find((opt) => opt.en === englishName);
  if (!option) return englishName;
  
  const langKey = lang as keyof DegreeOption;
  return (option[langKey] as string) || option.en;
}

export function getDegreeInfo(degreeName: string): DegreeOption | undefined {
  return degreeOptions.find((opt) => 
    opt.en === degreeName || 
    opt.tr === degreeName ||
    opt.de === degreeName ||
    opt.es === degreeName ||
    opt.fr === degreeName
  );
}

export function suggestDegreesByField(fieldOfStudy: string): DegreeOption[] {
  if (!fieldOfStudy) return [];
  
  const field = fieldOfStudy.toLowerCase();
  const suggestions: DegreeOption[] = [];
  
  for (const degree of degreeOptions) {
    if (!degree.relatedFields) continue;
    
    for (const relatedField of degree.relatedFields) {
      if (field.includes(relatedField) || relatedField.includes(field)) {
        suggestions.push(degree);
        break;
      }
    }
  }
  
  return suggestions;
}

export function getVerificationLink(degreeName: string, country: string): string | undefined {
  const degree = getDegreeInfo(degreeName);
  return degree?.verificationLinks?.[country];
}

export function getEquivalentDegrees(degreeName: string, targetCountry?: DegreeCountry): DegreeEquivalency[] {
  const degree = getDegreeInfo(degreeName);
  if (!degree?.equivalentDegrees) return [];
  
  if (targetCountry) {
    return degree.equivalentDegrees.filter(eq => eq.country === targetCountry);
  }
  
  return degree.equivalentDegrees;
}

export function getAccreditationBodies(degreeName: string, country?: DegreeCountry): AccreditationInfo[] {
  const degree = getDegreeInfo(degreeName);
  if (!degree?.accreditation) return [];
  
  if (country) {
    return degree.accreditation.filter(acc => acc.country === country);
  }
  
  return degree.accreditation;
}

export function getInstitutionInfo(degreeName: string, country?: DegreeCountry): InstitutionInfo | undefined {
  const degree = getDegreeInfo(degreeName);
  if (!degree?.institutions) return undefined;
  
  if (country) {
    return degree.institutions.find(inst => inst.country === country);
  }
  
  return degree.institutions[0];
}

export function validateDegreeFieldCombination(degreeName: string, fieldOfStudy: string): {
  valid: boolean;
  confidence: number;
  warnings?: string[];
} {
  const degree = getDegreeInfo(degreeName);
  if (!degree?.aiValidation || !fieldOfStudy) {
    return { valid: true, confidence: 100 };
  }
  
  const field = fieldOfStudy.toLowerCase();
  const warnings: string[] = [];
  let confidence = 100;
  
  // Check incompatible fields
  if (degree.aiValidation.incompatibleFields) {
    for (const incompatible of degree.aiValidation.incompatibleFields) {
      if (field.includes(incompatible)) {
        warnings.push(`This degree is typically not associated with ${incompatible} field`);
        confidence -= 30;
      }
    }
  }
  
  // Check required fields
  if (degree.aiValidation.requiredFields) {
    const hasRequiredField = degree.aiValidation.requiredFields.some(required => 
      field.includes(required)
    );
    
    if (!hasRequiredField && confidence === 100) {
      warnings.push('Consider if this degree matches your field of study');
      confidence -= 15;
    }
  }
  
  return {
    valid: confidence > 50,
    confidence: Math.max(0, confidence),
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

export function findHistoricalDegree(searchTerm: string): DegreeOption | undefined {
  const search = searchTerm.toLowerCase().trim();
  
  for (const degree of degreeOptions) {
    if (degree.historicalNames) {
      for (const historical of degree.historicalNames) {
        if (historical.toLowerCase() === search) {
          return degree;
        }
      }
    }
  }
  
  return undefined;
}

export function findDegreeByName(name: string): DegreeOption | undefined {
  // First try to find by exact match
  let degree = getDegreeInfo(name);
  
  // If not found, try historical names
  if (!degree) {
    degree = findHistoricalDegree(name);
  }
  
  return degree;
}

// Export degree categories for filtering
export const degreeCategories = {
  'high-school': 'High School',
  'associate': 'Associate',
  'bachelor': "Bachelor's",
  'master': "Master's",
  'doctoral': 'Doctoral',
  'professional': 'Professional',
  'other': 'Other',
};

// Country names for display
export const countryNames: Record<DegreeCountry, string> = {
  GLOBAL: 'Global',
  US: 'United States',
  UK: 'United Kingdom',
  EU: 'European Union',
  TR: 'Turkey',
  IN: 'India',
  CA: 'Canada',
  AU: 'Australia',
};
