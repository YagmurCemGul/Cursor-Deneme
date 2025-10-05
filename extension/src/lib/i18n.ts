import { storage } from './storage';

export type Language = 'en' | 'tr';

const STORAGE_KEY = 'app_language';

let currentLanguage: Language = 'en';

export async function initLanguage(): Promise<Language> {
  const saved = await storage.get<Language>(STORAGE_KEY);
  currentLanguage = saved || 'en';
  return currentLanguage;
}

export async function setLanguage(lang: Language): Promise<void> {
  currentLanguage = lang;
  await storage.set(STORAGE_KEY, lang);
}

export function getCurrentLanguage(): Language {
  return currentLanguage;
}

export function t(key: string, lang?: Language): string {
  const translations = getTranslations(lang || currentLanguage);
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
  }
  
  return value;
}

function getTranslations(lang: Language): any {
  return lang === 'tr' ? TR_TRANSLATIONS : EN_TRANSLATIONS;
}

// English Translations
const EN_TRANSLATIONS = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    apply: 'Apply',
    generate: 'Generate',
    download: 'Download',
    upload: 'Upload',
    import: 'Import',
    export: 'Export',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    loading: 'Loading...',
    success: 'Success!',
    error: 'Error',
    required: 'Required',
    optional: 'Optional',
  },
  
  header: {
    title: 'AI CV & Cover Letter Optimizer',
    subtitle: 'Create ATS-optimized resumes and cover letters powered by AI',
    saving: 'Saving...',
    saved: 'Saved',
    profileCompletion: 'Profile Completion',
  },
  
  tabs: {
    cv: 'CV Profile',
    job: 'Job Description',
    preview: 'Resume Preview',
    cover: 'Cover Letter',
    tracker: 'Job Tracker',
    downloads: 'Downloads',
    settings: 'Settings',
  },
  
  profile: {
    title: 'Personal Information',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    location: 'Location',
    linkedin: 'LinkedIn Username',
    github: 'GitHub Username',
    portfolio: 'Portfolio URL',
    summary: 'Professional Summary',
    summaryPlaceholder: 'Write a brief professional summary highlighting your key strengths and experience...',
    aiGenerate: 'AI Generate',
    enhance: 'Enhance',
  },
  
  skills: {
    title: 'Skills',
    addSkill: 'Add Skill',
    showSuggestions: 'Show Suggestions',
    hideSuggestions: 'Hide Suggestions',
    searchPlaceholder: 'Search skills...',
  },
  
  experience: {
    title: 'Work Experience',
    addExperience: 'Add Experience',
    jobTitle: 'Job Title',
    company: 'Company',
    startDate: 'Start Date',
    endDate: 'End Date',
    current: 'Currently working here',
    description: 'Description',
    employmentType: 'Employment Type',
    locationType: 'Location Type',
    duplicate: 'Duplicate',
    collapse: 'Collapse',
    expand: 'Expand',
  },
  
  education: {
    title: 'Education',
    addEducation: 'Add Education',
    school: 'School/University',
    degree: 'Degree',
    fieldOfStudy: 'Field of Study',
    grade: 'Grade/GPA',
    startDate: 'Start Date',
    endDate: 'End Date',
    expected: 'Expected graduation',
  },
  
  projects: {
    title: 'Projects',
    addProject: 'Add Project',
    projectName: 'Project Name',
    description: 'Description',
    startDate: 'Start Date',
    endDate: 'End Date',
    current: 'Ongoing project',
  },
  
  certificates: {
    title: 'Licenses & Certifications',
    addCertificate: 'Add Certificate',
    name: 'Certificate Name',
    organization: 'Issuing Organization',
    issueDate: 'Issue Date',
    expirationDate: 'Expiration Date',
    credentialId: 'Credential ID',
    credentialUrl: 'Credential URL',
  },
  
  ats: {
    title: 'ATS Score',
    checkScore: 'Check ATS Score',
    overallScore: 'Overall Score',
    keywordMatch: 'Keyword Match',
    formatScore: 'Format Score',
    completeness: 'Completeness',
    matched: 'Matched Keywords',
    missing: 'Missing Keywords',
    suggestions: 'Improvement Suggestions',
    refresh: 'Refresh Score',
  },
  
  linkedin: {
    title: 'Import from LinkedIn',
    subtitle: 'Save time by importing your LinkedIn profile data',
    importNow: 'Import Now',
    pasteText: 'Paste Text',
    uploadFile: 'Upload File',
    fromPage: 'From Page',
  },
  
  jobTracker: {
    title: 'Job Application Tracker',
    subtitle: 'Track and manage all your job applications',
    addApplication: 'Add Application',
    total: 'Total',
    wishlist: 'Wishlist',
    applied: 'Applied',
    interview: 'Interview',
    offers: 'Offers',
    rejected: 'Rejected',
    kanban: 'Kanban',
    list: 'List',
    timeline: 'Timeline',
    allStatus: 'All Status',
    sortByDate: 'Sort by Date',
    sortByCompany: 'Sort by Company',
    sortByPriority: 'Sort by Priority',
  },
  
  profileManager: {
    title: 'Profile Manager',
    subtitle: 'Manage multiple CV profiles for different job applications',
    myProfiles: 'My Profiles',
    createFromTemplate: 'Create from Template',
    compareProfiles: 'Compare Profiles',
    switchProfile: 'Switch',
    duplicateProfile: 'Duplicate',
    deleteProfile: 'Delete',
    completeness: 'Completeness',
  },
  
  coverLetter: {
    title: 'Cover Letter',
    useTemplate: 'Use Template',
    changeTemplate: 'Change Template',
    createPerfect: 'Create Your Perfect Cover Letter',
    chooseTemplates: 'Choose from 8 professional templates tailored to your role',
    getStarted: 'Get Started',
    preview: 'Cover Letter Preview',
    copyToClipboard: 'Copy to Clipboard',
    goToDownloads: 'Go to Downloads',
  },
  
  settings: {
    title: 'Settings',
    apiSettings: 'API Settings',
    aiProvider: 'AI Provider',
    apiKey: 'API Key',
    language: 'Language',
    languageDescription: 'Choose your preferred language',
    saveSettings: 'Save Settings',
    testConnection: 'Test Connection',
  },
  
  downloads: {
    title: 'Download Your Documents',
    professionalCV: 'Professional CV (Formatted)',
    cvDescription: 'Export your beautifully formatted CV in PDF or image format',
    downloadPDF: 'Download PDF',
    downloadPNG: 'Download PNG',
    print: 'Print',
    resumeMarkdown: 'Resume (Markdown)',
    coverLetterMarkdown: 'Cover Letter (Markdown)',
    downloadTXT: 'Download .txt',
    downloadMD: 'Download .md',
  },
  
  validation: {
    invalidEmail: 'Invalid email address',
    invalidPhone: 'Invalid phone number',
    invalidURL: 'Invalid URL',
    invalidLinkedIn: 'Invalid LinkedIn username',
    invalidGitHub: 'Invalid GitHub username',
    required: 'This field is required',
    tooShort: 'Too short',
    tooLong: 'Too long',
  },
  
  messages: {
    profileSaved: 'Profile saved successfully',
    profileDeleted: 'Profile deleted successfully',
    linkedinImported: 'LinkedIn profile imported successfully',
    coverLetterGenerated: 'Cover letter generated successfully',
    resumeGenerated: 'Resume generated successfully',
    noApiKey: 'API key not set. Go to Settings to configure.',
    generationError: 'Failed to generate. Please try again.',
    confirmDelete: 'Are you sure you want to delete this?',
  },
};

// Turkish Translations
const TR_TRANSLATIONS = {
  common: {
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    close: 'Kapat',
    back: 'Geri',
    next: 'İleri',
    apply: 'Uygula',
    generate: 'Oluştur',
    download: 'İndir',
    upload: 'Yükle',
    import: 'İçe Aktar',
    export: 'Dışa Aktar',
    search: 'Ara',
    filter: 'Filtrele',
    sort: 'Sırala',
    loading: 'Yükleniyor...',
    success: 'Başarılı!',
    error: 'Hata',
    required: 'Zorunlu',
    optional: 'İsteğe Bağlı',
  },
  
  header: {
    title: 'Yapay Zeka CV & Ön Yazı Optimize Edici',
    subtitle: 'Yapay zeka destekli ATS uyumlu özgeçmiş ve ön yazı oluşturun',
    saving: 'Kaydediliyor...',
    saved: 'Kaydedildi',
    profileCompletion: 'Profil Tamamlanma',
  },
  
  tabs: {
    cv: 'CV Profili',
    job: 'İş İlanı',
    preview: 'Özgeçmiş Önizleme',
    cover: 'Ön Yazı',
    tracker: 'İş Takibi',
    downloads: 'İndirilenler',
    settings: 'Ayarlar',
  },
  
  profile: {
    title: 'Kişisel Bilgiler',
    firstName: 'Ad',
    lastName: 'Soyad',
    email: 'E-posta',
    phone: 'Telefon',
    location: 'Konum',
    linkedin: 'LinkedIn Kullanıcı Adı',
    github: 'GitHub Kullanıcı Adı',
    portfolio: 'Portfolyo URL',
    summary: 'Profesyonel Özet',
    summaryPlaceholder: 'Ana yeteneklerinizi ve deneyiminizi vurgulayan kısa bir profesyonel özet yazın...',
    aiGenerate: 'Yapay Zeka ile Oluştur',
    enhance: 'İyileştir',
  },
  
  skills: {
    title: 'Yetenekler',
    addSkill: 'Yetenek Ekle',
    showSuggestions: 'Önerileri Göster',
    hideSuggestions: 'Önerileri Gizle',
    searchPlaceholder: 'Yetenek ara...',
  },
  
  experience: {
    title: 'İş Deneyimi',
    addExperience: 'Deneyim Ekle',
    jobTitle: 'İş Ünvanı',
    company: 'Şirket',
    startDate: 'Başlangıç Tarihi',
    endDate: 'Bitiş Tarihi',
    current: 'Halen burada çalışıyorum',
    description: 'Açıklama',
    employmentType: 'İstihdam Türü',
    locationType: 'Konum Türü',
    duplicate: 'Çoğalt',
    collapse: 'Daralt',
    expand: 'Genişlet',
  },
  
  education: {
    title: 'Eğitim',
    addEducation: 'Eğitim Ekle',
    school: 'Okul/Üniversite',
    degree: 'Derece',
    fieldOfStudy: 'Bölüm',
    grade: 'Not/GPA',
    startDate: 'Başlangıç Tarihi',
    endDate: 'Bitiş Tarihi',
    expected: 'Beklenen mezuniyet',
  },
  
  projects: {
    title: 'Projeler',
    addProject: 'Proje Ekle',
    projectName: 'Proje Adı',
    description: 'Açıklama',
    startDate: 'Başlangıç Tarihi',
    endDate: 'Bitiş Tarihi',
    current: 'Devam eden proje',
  },
  
  certificates: {
    title: 'Lisanslar ve Sertifikalar',
    addCertificate: 'Sertifika Ekle',
    name: 'Sertifika Adı',
    organization: 'Veren Kuruluş',
    issueDate: 'Veriliş Tarihi',
    expirationDate: 'Son Kullanma Tarihi',
    credentialId: 'Kimlik Numarası',
    credentialUrl: 'Kimlik URL',
  },
  
  ats: {
    title: 'ATS Skoru',
    checkScore: 'ATS Skorunu Kontrol Et',
    overallScore: 'Genel Skor',
    keywordMatch: 'Anahtar Kelime Eşleşmesi',
    formatScore: 'Format Skoru',
    completeness: 'Tamlık',
    matched: 'Eşleşen Anahtar Kelimeler',
    missing: 'Eksik Anahtar Kelimeler',
    suggestions: 'İyileştirme Önerileri',
    refresh: 'Skoru Yenile',
  },
  
  linkedin: {
    title: 'LinkedIn\'den İçe Aktar',
    subtitle: 'LinkedIn profil verilerinizi içe aktararak zaman kazanın',
    importNow: 'Şimdi İçe Aktar',
    pasteText: 'Metin Yapıştır',
    uploadFile: 'Dosya Yükle',
    fromPage: 'Sayfadan',
  },
  
  jobTracker: {
    title: 'İş Başvuru Takibi',
    subtitle: 'Tüm iş başvurularınızı takip edin ve yönetin',
    addApplication: 'Başvuru Ekle',
    total: 'Toplam',
    wishlist: 'İstek Listesi',
    applied: 'Başvuruldu',
    interview: 'Mülakat',
    offers: 'Teklifler',
    rejected: 'Reddedildi',
    kanban: 'Kanban',
    list: 'Liste',
    timeline: 'Zaman Çizelgesi',
    allStatus: 'Tüm Durumlar',
    sortByDate: 'Tarihe Göre Sırala',
    sortByCompany: 'Şirkete Göre Sırala',
    sortByPriority: 'Önceliğe Göre Sırala',
  },
  
  profileManager: {
    title: 'Profil Yöneticisi',
    subtitle: 'Farklı iş başvuruları için birden fazla CV profili yönetin',
    myProfiles: 'Profillerim',
    createFromTemplate: 'Şablondan Oluştur',
    compareProfiles: 'Profilleri Karşılaştır',
    switchProfile: 'Değiştir',
    duplicateProfile: 'Çoğalt',
    deleteProfile: 'Sil',
    completeness: 'Tamlık',
  },
  
  coverLetter: {
    title: 'Ön Yazı',
    useTemplate: 'Şablon Kullan',
    changeTemplate: 'Şablonu Değiştir',
    createPerfect: 'Mükemmel Ön Yazınızı Oluşturun',
    chooseTemplates: 'Rolünüze uygun 8 profesyonel şablon arasından seçim yapın',
    getStarted: 'Başlayın',
    preview: 'Ön Yazı Önizleme',
    copyToClipboard: 'Panoya Kopyala',
    goToDownloads: 'İndirmelere Git',
  },
  
  settings: {
    title: 'Ayarlar',
    apiSettings: 'API Ayarları',
    aiProvider: 'Yapay Zeka Sağlayıcı',
    apiKey: 'API Anahtarı',
    language: 'Dil',
    languageDescription: 'Tercih ettiğiniz dili seçin',
    saveSettings: 'Ayarları Kaydet',
    testConnection: 'Bağlantıyı Test Et',
  },
  
  downloads: {
    title: 'Belgelerinizi İndirin',
    professionalCV: 'Profesyonel CV (Formatlı)',
    cvDescription: 'Güzel biçimlendirilmiş CV\'nizi PDF veya resim formatında dışa aktarın',
    downloadPDF: 'PDF İndir',
    downloadPNG: 'PNG İndir',
    print: 'Yazdır',
    resumeMarkdown: 'Özgeçmiş (Markdown)',
    coverLetterMarkdown: 'Ön Yazı (Markdown)',
    downloadTXT: '.txt İndir',
    downloadMD: '.md İndir',
  },
  
  validation: {
    invalidEmail: 'Geçersiz e-posta adresi',
    invalidPhone: 'Geçersiz telefon numarası',
    invalidURL: 'Geçersiz URL',
    invalidLinkedIn: 'Geçersiz LinkedIn kullanıcı adı',
    invalidGitHub: 'Geçersiz GitHub kullanıcı adı',
    required: 'Bu alan zorunludur',
    tooShort: 'Çok kısa',
    tooLong: 'Çok uzun',
  },
  
  messages: {
    profileSaved: 'Profil başarıyla kaydedildi',
    profileDeleted: 'Profil başarıyla silindi',
    linkedinImported: 'LinkedIn profili başarıyla içe aktarıldı',
    coverLetterGenerated: 'Ön yazı başarıyla oluşturuldu',
    resumeGenerated: 'Özgeçmiş başarıyla oluşturuldu',
    noApiKey: 'API anahtarı ayarlanmadı. Yapılandırmak için Ayarlar\'a gidin.',
    generationError: 'Oluşturulamadı. Lütfen tekrar deneyin.',
    confirmDelete: 'Silmek istediğinizden emin misiniz?',
  },
};
