import { Lang } from '../i18n';

export interface DegreeOption {
  en: string;
  tr: string;
}

export const degreeOptions: DegreeOption[] = [
  // High School & Associate
  { en: 'High School Diploma', tr: 'Lise Diploması' },
  { en: 'Associate Degree', tr: 'Ön Lisans' },

  // Bachelor's Degrees (Lisans)
  { en: "Bachelor's Degree", tr: 'Lisans Derecesi' },
  { en: 'Bachelor of Arts (BA)', tr: 'Edebiyat Fakültesi (BA)' },
  { en: 'Bachelor of Science (BSc)', tr: 'Fen Fakültesi (BSc)' },
  { en: 'Bachelor of Engineering (BEng)', tr: 'Mühendislik Fakültesi (BEng)' },
  { en: 'Bachelor of Technology (BTech)', tr: 'Teknoloji Fakültesi (BTech)' },
  { en: 'Bachelor of Business Administration (BBA)', tr: 'İşletme Fakültesi (BBA)' },
  { en: 'Bachelor of Commerce (BCom)', tr: 'Ticaret Fakültesi (BCom)' },
  { en: 'Bachelor of Fine Arts (BFA)', tr: 'Güzel Sanatlar Fakültesi (BFA)' },
  { en: 'Bachelor of Education (BEd)', tr: 'Eğitim Fakültesi (BEd)' },
  { en: 'Bachelor of Laws (LLB)', tr: 'Hukuk Fakültesi (LLB)' },
  { en: 'Bachelor of Medicine, Bachelor of Surgery (MBBS)', tr: 'Tıp Fakültesi (MBBS)' },
  { en: 'Bachelor of Architecture (BArch)', tr: 'Mimarlık Fakültesi (BArch)' },
  { en: 'Bachelor of Computer Applications (BCA)', tr: 'Bilgisayar Uygulamaları (BCA)' },
  { en: 'Bachelor of Social Work (BSW)', tr: 'Sosyal Hizmetler (BSW)' },
  { en: 'Bachelor of Pharmacy (BPharm)', tr: 'Eczacılık Fakültesi (BPharm)' },
  { en: 'Bachelor of Nursing (BN)', tr: 'Hemşirelik Fakültesi (BN)' },

  // Master's Degrees (Yüksek Lisans)
  { en: "Master's Degree", tr: 'Yüksek Lisans Derecesi' },
  { en: 'Master of Arts (MA)', tr: 'Yüksek Lisans - Edebiyat (MA)' },
  { en: 'Master of Science (MSc)', tr: 'Yüksek Lisans - Fen (MSc)' },
  { en: 'Master of Engineering (MEng)', tr: 'Yüksek Lisans - Mühendislik (MEng)' },
  { en: 'Master of Business Administration (MBA)', tr: 'İşletme Yüksek Lisansı (MBA)' },
  { en: 'Master of Technology (MTech)', tr: 'Yüksek Lisans - Teknoloji (MTech)' },
  {
    en: 'Master of Computer Applications (MCA)',
    tr: 'Yüksek Lisans - Bilgisayar Uygulamaları (MCA)',
  },
  { en: 'Master of Fine Arts (MFA)', tr: 'Yüksek Lisans - Güzel Sanatlar (MFA)' },
  { en: 'Master of Education (MEd)', tr: 'Yüksek Lisans - Eğitim (MEd)' },
  { en: 'Master of Laws (LLM)', tr: 'Yüksek Lisans - Hukuk (LLM)' },
  { en: 'Master of Public Health (MPH)', tr: 'Yüksek Lisans - Halk Sağlığı (MPH)' },
  { en: 'Master of Social Work (MSW)', tr: 'Yüksek Lisans - Sosyal Hizmetler (MSW)' },
  { en: 'Master of Architecture (MArch)', tr: 'Yüksek Lisans - Mimarlık (MArch)' },

  // Doctoral Degrees (Doktora)
  { en: 'Doctoral Degree', tr: 'Doktora Derecesi' },
  { en: 'Doctor of Philosophy (PhD)', tr: 'Doktora (PhD)' },
  { en: 'Doctor of Medicine (MD)', tr: 'Tıp Doktoru (MD)' },
  { en: 'Doctor of Dental Surgery (DDS)', tr: 'Diş Hekimliği Doktoru (DDS)' },
  { en: 'Doctor of Dental Medicine (DMD)', tr: 'Diş Hekimliği Doktoru (DMD)' },
  { en: 'Juris Doctor (JD)', tr: 'Hukuk Doktoru (JD)' },
  { en: 'Doctor of Education (EdD)', tr: 'Eğitim Doktoru (EdD)' },
  { en: 'Doctor of Business Administration (DBA)', tr: 'İşletme Doktoru (DBA)' },
  { en: 'Doctor of Engineering (EngD)', tr: 'Mühendislik Doktoru (EngD)' },
  { en: 'Doctor of Pharmacy (PharmD)', tr: 'Eczacılık Doktoru (PharmD)' },
  { en: 'Doctor of Veterinary Medicine (DVM)', tr: 'Veteriner Hekimliği Doktoru (DVM)' },

  // Professional & Other Degrees
  { en: 'Professional Degree', tr: 'Profesyonel Derece' },
  { en: 'Certificate', tr: 'Sertifika' },
  { en: 'Diploma', tr: 'Diploma' },
  { en: 'Other', tr: 'Diğer' },
];

export function getDegrees(lang: Lang): string[] {
  return degreeOptions.map((option) => option[lang]);
}

export function getDegreeName(englishName: string, lang: Lang): string {
  const option = degreeOptions.find((opt) => opt.en === englishName);
  return option ? option[lang] : englishName;
}
