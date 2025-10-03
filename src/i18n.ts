export type Lang = 'en' | 'tr';

const dict: Record<string, Record<Lang, string>> = {
  'app.title': { en: 'AI CV & Cover Letter Optimizer', tr: 'YZ CV ve Niyet Mektubu Optimizasyonu' },
  'app.subtitle': { en: 'ATS-Optimized Resumes & Cover Letters Powered by AI', tr: 'ATS Uyumlu Özgeçmiş ve Niyet Mektupları (YZ Gücüyle)' },

  'tabs.cvinfo': { en: 'CV Information', tr: 'CV Bilgileri' },
  'tabs.optimize': { en: 'Optimize & Preview', tr: 'Optimize Et & Önizleme' },
  'tabs.cover': { en: 'Cover Letter', tr: 'Niyet Mektubu' },
  'tabs.profiles': { en: 'Profiles', tr: 'Profiller' },

  'common.add': { en: 'Add', tr: 'Ekle' },
  'common.remove': { en: 'Remove', tr: 'Kaldır' },
  'common.cancel': { en: 'Cancel', tr: 'İptal' },
  'common.save': { en: 'Save', tr: 'Kaydet' },
  'common.currently': { en: 'Currently', tr: 'Halen' },

  'personal.section': { en: 'Personal Information', tr: 'Kişisel Bilgiler' },
  'personal.firstName': { en: 'First Name', tr: 'İsim' },
  'personal.middleName': { en: 'Middle Name', tr: 'İkinci İsim' },
  'personal.lastName': { en: 'Last Name', tr: 'Soy İsim' },
  'personal.email': { en: 'Email', tr: 'E-posta' },
  'personal.phoneNumber': { en: 'Phone Number', tr: 'Telefon Numarası' },
  'personal.countryCode': { en: 'Country Code', tr: 'Ülke Kodu' },
  'personal.linkedin': { en: 'LinkedIn Profile', tr: 'LinkedIn Profili' },
  'personal.github': { en: 'GitHub Profile', tr: 'GitHub Profili' },
  'personal.portfolio': { en: 'Portfolio Website', tr: 'Portfolyo Sitesi' },
  'personal.whatsapp': { en: 'WhatsApp Link', tr: 'WhatsApp Bağlantısı' },
  'personal.summary': { en: 'Professional Summary', tr: 'Özet' },
  'personal.photo': { en: 'Profile Photo', tr: 'Profil Fotoğrafı' },
  'personal.invalidEmail': { en: 'Invalid email address', tr: 'Geçersiz e-posta adresi' },

  'skills.section': { en: 'Skills', tr: 'Yetenekler' },
  'skills.placeholder': { en: 'Add a skill (e.g., JavaScript, SQL)', tr: 'Yetenek ekle (örn. JavaScript, SQL)' },

  'upload.section': { en: 'Upload Your CV', tr: 'CV Yükle' },
  'upload.drag': { en: 'Drag and drop your CV here or click to browse', tr: 'CV’nizi buraya sürükleyin veya tıklayın' },
  'upload.supported': { en: 'Supported formats: PDF, DOCX, DOC', tr: 'Desteklenen formatlar: PDF, DOCX, DOC' },

  'job.section': { en: 'Job Description', tr: 'İş İlanı' },
  'job.tip': { en: 'Tip: AI will analyze this to optimize your CV.', tr: 'İpucu: YZ CV’nizi optimize etmek için bunu analiz eder.' },

  'experience.section': { en: 'Experience', tr: 'Deneyim' },
  'experience.add': { en: 'Add Experience', tr: 'Deneyim Ekle' },
  'experience.jobTitle': { en: 'Job Title', tr: 'Pozisyon' },
  'experience.employmentType': { en: 'Employment Type', tr: 'Çalışma Türü' },
  'experience.company': { en: 'Company or Organization', tr: 'Şirket veya Organizasyon' },
  'experience.start': { en: 'Start Date', tr: 'Başlangıç Tarihi' },
  'experience.end': { en: 'End Date', tr: 'Bitiş Tarihi' },
  'experience.locationType': { en: 'Location Type', tr: 'Lokasyon Türü' },
  'experience.country': { en: 'Country', tr: 'Ülke' },
  'experience.city': { en: 'City', tr: 'Şehir' },
  'experience.description': { en: 'Description', tr: 'Açıklama' },
  'experience.skills': { en: 'Skills', tr: 'Yetenekler' },
  'experience.addBullet': { en: 'Add Bullet', tr: 'Madde Ekle' },

  'education.section': { en: 'Education', tr: 'Eğitim' },
  'education.add': { en: 'Add Education', tr: 'Eğitim Ekle' },
  'education.school': { en: 'School', tr: 'Okul' },
  'education.degree': { en: 'Degree', tr: 'Derece' },
  'education.field': { en: 'Field of Study', tr: 'Bölüm' },
  'education.start': { en: 'Start Date', tr: 'Başlangıç Tarihi' },
  'education.end': { en: 'End Date (or expected)', tr: 'Bitiş Tarihi (veya beklenen)' },
  'education.currently': { en: 'I am currently studying', tr: 'Hâla devam ediyorum' },
  'education.description': { en: 'Description', tr: 'Açıklama' },
  'education.skills': { en: 'Skills', tr: 'Yetenekler' },

  'certs.section': { en: 'Licenses & Certifications', tr: 'Lisanslar ve Sertifikalar' },
  'certs.add': { en: 'Add Certification', tr: 'Sertifika Ekle' },
  'certs.name': { en: 'Name', tr: 'Ad' },
  'certs.org': { en: 'Issuing Organization', tr: 'Veren Kuruluş' },
  'certs.issue': { en: 'Issue Date', tr: 'Veriliş Tarihi' },
  'certs.expiration': { en: 'Expiration Date', tr: 'Bitiş Tarihi' },
  'certs.noExpiration': { en: "Doesn't expire / Ongoing", tr: 'Süresiz / Hâla devam ediyor' },
  'certs.credId': { en: 'Credential ID', tr: 'Kimlik No' },
  'certs.credUrl': { en: 'Credential URL', tr: 'Kimlik URL' },
  'certs.description': { en: 'Description', tr: 'Açıklama' },
  'certs.skills': { en: 'Skills', tr: 'Yetenekler' },

  'projects.section': { en: 'Projects', tr: 'Projeler' },
  'projects.add': { en: 'Add Project', tr: 'Proje Ekle' },
  'projects.name': { en: 'Project Name', tr: 'Proje Adı' },
  'projects.description': { en: 'Description', tr: 'Açıklama' },
  'projects.start': { en: 'Start Date', tr: 'Başlangıç Tarihi' },
  'projects.end': { en: 'End Date', tr: 'Bitiş Tarihi' },
  'projects.currently': { en: 'I am currently working on this project', tr: 'Hâla bu projede çalışıyorum' },
  'projects.associated': { en: 'Associated With', tr: 'İlişkili Olduğu' },
  'projects.skills': { en: 'Skills', tr: 'Yetenekler' },

  'opt.section': { en: 'ATS Optimization Details', tr: 'ATS Optimizasyon Detayları' },
  'opt.preview': { en: 'CV Preview', tr: 'CV Önizleme' },
  'opt.optimizeBtn': { en: 'Optimize CV with AI', tr: 'CV’yi YZ ile Optimize Et' }
};

// Translatable notifications and messages
Object.assign(dict, {
  'msg.enterJobDescription': { en: 'Please enter a job description first!', tr: 'Lütfen önce bir iş ilanı girin!' },
  'msg.optimizeError': { en: 'Error optimizing CV. Please try again.', tr: 'CV optimize edilirken hata oluştu. Lütfen tekrar deneyin.' },
  'msg.coverLetterError': { en: 'Error generating cover letter. Please try again.', tr: 'Niyet mektubu oluşturulurken hata oluştu. Lütfen tekrar deneyin.' },
  'msg.profileSaved': { en: 'Profile saved successfully!', tr: 'Profil başarıyla kaydedildi!' },
  'msg.profileLoaded': { en: 'Profile loaded successfully!', tr: 'Profil başarıyla yüklendi!' },
  'msg.docGenError': { en: 'Error generating document. Please try again.', tr: 'Belge oluşturulurken hata oluştu. Lütfen tekrar deneyin.' },
  'msg.docGoogleInfo': { en: 'Google Docs export requires Google Docs API. You can upload the DOCX to Drive and open with Google Docs.', tr: 'Google Docs dışa aktarma, Google Docs API gerektirir. DOCX dosyasını Drive’a yükleyip Google Docs ile açabilirsiniz.' },
  'msg.cvParsingError': { en: "Error parsing file. Please make sure it's a valid PDF or DOCX file.", tr: 'Dosya ayrıştırılırken hata oluştu. Lütfen geçerli bir PDF veya DOCX dosyası olduğundan emin olun.' },
  'msg.copied': { en: 'Copied to clipboard!', tr: 'Panoya kopyalandı!' }
});

export function t(lang: Lang, key: string): string {
  return dict[key]?.[lang] ?? dict[key]?.en ?? key;
}
