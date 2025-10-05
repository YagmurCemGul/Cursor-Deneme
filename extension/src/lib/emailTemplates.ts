/**
 * Email Templates for Job Applications
 * Professional templates for different scenarios
 */

import { Language } from './i18n';

export interface EmailTemplate {
  id: string;
  name: string;
  nameLocal: { en: string; tr: string };
  description: string;
  descriptionLocal: { en: string; tr: string };
  icon: string;
  category: 'application' | 'followup' | 'networking' | 'referral';
  subject: (variables: EmailVariables) => string;
  body: (variables: EmailVariables) => string;
}

export interface EmailVariables {
  jobTitle: string;
  company: string;
  firstName: string;
  lastName: string;
  hiringManager?: string;
  referralName?: string;
  language: Language;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'job-application',
    name: 'Job Application',
    nameLocal: { en: 'Job Application', tr: 'İş Başvurusu' },
    description: 'Professional application email with CV attachment',
    descriptionLocal: { 
      en: 'Professional application email with CV attachment', 
      tr: 'CV eki ile profesyonel başvuru e-postası' 
    },
    icon: '📤',
    category: 'application',
    subject: (v) => v.language === 'tr' 
      ? `${v.jobTitle} Pozisyonu Başvurusu - ${v.firstName} ${v.lastName}`
      : `Application for ${v.jobTitle} Position - ${v.firstName} ${v.lastName}`,
    body: (v) => v.language === 'tr'
      ? `Sayın ${v.hiringManager || 'İşe Alım Yöneticisi'},

${v.company} bünyesindeki ${v.jobTitle} pozisyonuna başvurmak istiyorum. İlan edilen pozisyonun gereksinimlerini dikkatlice inceledim ve becerilerimin bu role mükemmel bir şekilde uyduğuna inanıyorum.

Ekli CV'mde göreceğiniz üzere, bu pozisyonda başarılı olmak için gerekli deneyim ve becerilere sahibim. ${v.company} ile birlikte çalışma ve ekibinize katkıda bulunma fırsatını değerlendirmeyi çok isterim.

Başvurumu değerlendirdiğiniz ve benimle görüşme fırsatı tanıdığınız için şimdiden teşekkür ederim. Kendimi daha detaylı tanıtma fırsatı bulabileceğim bir görüşmeyi dört gözle bekliyorum.

Saygılarımla,
${v.firstName} ${v.lastName}`
      : `Dear ${v.hiringManager || 'Hiring Manager'},

I am writing to express my strong interest in the ${v.jobTitle} position at ${v.company}. After carefully reviewing the job requirements, I am confident that my skills and experience make me an excellent fit for this role.

As detailed in my attached CV, I have the necessary background and qualifications to excel in this position. I am excited about the opportunity to contribute to ${v.company}'s team and would welcome the chance to discuss how my experience aligns with your needs.

Thank you for considering my application. I look forward to the opportunity to discuss my qualifications in more detail.

Best regards,
${v.firstName} ${v.lastName}`,
  },
  {
    id: 'follow-up',
    name: 'Follow-Up Email',
    nameLocal: { en: 'Follow-Up Email', tr: 'Takip E-postası' },
    description: 'Polite follow-up after submitting application',
    descriptionLocal: { 
      en: 'Polite follow-up after submitting application', 
      tr: 'Başvuru sonrası nazik takip e-postası' 
    },
    icon: '🔔',
    category: 'followup',
    subject: (v) => v.language === 'tr'
      ? `${v.jobTitle} Başvurusu Takibi - ${v.firstName} ${v.lastName}`
      : `Following Up: ${v.jobTitle} Application - ${v.firstName} ${v.lastName}`,
    body: (v) => v.language === 'tr'
      ? `Sayın ${v.hiringManager || 'İşe Alım Yöneticisi'},

Geçtiğimiz günlerde ${v.company} bünyesindeki ${v.jobTitle} pozisyonuna yaptığım başvuru ile ilgili iletişime geçiyorum. Bu pozisyona olan ilgim devam ediyor ve başvurumun durumunu öğrenmek istiyorum.

${v.company}'nin [belirli bir proje veya değer] konusundaki çalışmalarını takip ediyorum ve bu ekibin bir parçası olma fırsatına heyecanlıyım. Becerilerimin ve deneyimimin bu role nasıl değer katacağını görüşmek isterim.

Zaman ayırdığınız için teşekkür ederim. Yanıtınızı sabırsızlıkla bekliyorum.

Saygılarımla,
${v.firstName} ${v.lastName}`
      : `Dear ${v.hiringManager || 'Hiring Manager'},

I hope this email finds you well. I am writing to follow up on my application for the ${v.jobTitle} position at ${v.company}, which I submitted recently. I remain very interested in this opportunity and would like to inquire about the status of my application.

I am particularly excited about ${v.company}'s work in [specific area or value], and I believe my skills and experience would be a valuable addition to your team. I would welcome the opportunity to discuss how I can contribute to your organization.

Thank you for your time and consideration. I look forward to hearing from you.

Best regards,
${v.firstName} ${v.lastName}`,
  },
  {
    id: 'referral-introduction',
    name: 'Referral Introduction',
    nameLocal: { en: 'Referral Introduction', tr: 'Referans Tanıtımı' },
    description: 'Introduction email with referral mention',
    descriptionLocal: { 
      en: 'Introduction email with referral mention', 
      tr: 'Referans içeren tanıtım e-postası' 
    },
    icon: '👥',
    category: 'referral',
    subject: (v) => v.language === 'tr'
      ? `${v.referralName} Referansı - ${v.jobTitle} Başvurusu`
      : `${v.referralName} Referred Me - ${v.jobTitle} Application`,
    body: (v) => v.language === 'tr'
      ? `Sayın ${v.hiringManager || 'İşe Alım Yöneticisi'},

${v.referralName || '[Referans İsmi]'} aracılığıyla ${v.company} bünyesindeki ${v.jobTitle} pozisyonundan haberdar oldum. ${v.referralName}, bu fırsatın ilgi alanlarım ve becerilerimle mükemmel bir eşleşme olduğunu düşündü ve sizinle iletişime geçmemi önerdi.

Ekli CV'mde göreceğiniz üzere, bu pozisyonda başarılı olmak için gerekli nitelikli deneyime sahibim. ${v.company}'nin [belirli bir alan] alanındaki çalışmalarını uzun süredir takip ediyorum ve ekibinize katkıda bulunma fırsatını çok heyecanla bekliyorum.

Bu pozisyon hakkında daha fazla bilgi alabilmek ve becerilerimi nasıl katkıda bulunabileceğimi konuşabilmek için bir görüşme fırsatı bulabilirsek çok mutlu olurum.

Saygılarımla,
${v.firstName} ${v.lastName}`
      : `Dear ${v.hiringManager || 'Hiring Manager'},

I was referred to you by ${v.referralName || '[Referral Name]'} regarding the ${v.jobTitle} position at ${v.company}. ${v.referralName} thought my background and skills would be an excellent match for this opportunity and encouraged me to reach out to you directly.

As you will see in my attached CV, I have relevant experience that aligns well with the requirements of this role. I have been following ${v.company}'s work in [specific area] and am excited about the possibility of contributing to your team.

I would appreciate the opportunity to discuss this position further and explore how my skills and experience could benefit ${v.company}.

Thank you for your consideration.

Best regards,
${v.firstName} ${v.lastName}`,
  },
  {
    id: 'networking',
    name: 'Networking Email',
    nameLocal: { en: 'Networking Email', tr: 'Ağ Kurma E-postası' },
    description: 'Professional networking and introduction',
    descriptionLocal: { 
      en: 'Professional networking and introduction', 
      tr: 'Profesyonel ağ kurma ve tanıtım' 
    },
    icon: '🤝',
    category: 'networking',
    subject: (v) => v.language === 'tr'
      ? `${v.company} - Profesyonel Tanışma İsteği`
      : `Professional Introduction - ${v.company} Opportunities`,
    body: (v) => v.language === 'tr'
      ? `Sayın ${v.hiringManager || 'İletişim Kişisi'},

${v.company}'nin [belirli bir alan] alanındaki etkileyici çalışmalarını takip ediyorum. Sizinle bağlantı kurmak ve ${v.company}'deki potansiyel fırsatlar hakkında konuşmak istiyorum.

${v.jobTitle} alanında deneyimli bir profesyonelim ve [belirli beceriler veya başarılar] konusunda uzmanlığım var. ${v.company}'nin vizyonuna ve misyonuna büyük saygı duyuyorum ve bu harika ekibe nasıl katkıda bulunabileceğimi keşfetmek istiyorum.

Uygun olduğunuz bir zamanda kısa bir görüşme yapabilir miyiz? Sizi tanıma ve ${v.company}'deki mevcut veya gelecekteki fırsatlar hakkında bilgi alma fırsatını çok isterim.

Referans olması için CV'mi ekte bulabilirsiniz. Zaman ayırdığınız için teşekkür ederim.

Saygılarımla,
${v.firstName} ${v.lastName}`
      : `Dear ${v.hiringManager || 'Contact Person'},

I have been following ${v.company}'s impressive work in [specific area] and would like to connect with you regarding potential opportunities at your organization.

I am an experienced professional in ${v.jobTitle} with expertise in [specific skills or achievements]. I have great respect for ${v.company}'s vision and mission, and I am interested in exploring how I might contribute to your excellent team.

Would you be available for a brief conversation at your convenience? I would greatly appreciate the opportunity to learn more about ${v.company} and discuss any current or future openings that might align with my background.

I have attached my CV for your reference. Thank you for your time and consideration.

Best regards,
${v.firstName} ${v.lastName}`,
  },
  {
    id: 'thank-you',
    name: 'Thank You Email',
    nameLocal: { en: 'Thank You Email', tr: 'Teşekkür E-postası' },
    description: 'Post-interview thank you message',
    descriptionLocal: { 
      en: 'Post-interview thank you message', 
      tr: 'Mülakat sonrası teşekkür mesajı' 
    },
    icon: '🙏',
    category: 'followup',
    subject: (v) => v.language === 'tr'
      ? `${v.jobTitle} Görüşmesi İçin Teşekkürler`
      : `Thank You - ${v.jobTitle} Interview`,
    body: (v) => v.language === 'tr'
      ? `Sayın ${v.hiringManager || 'İşe Alım Yöneticisi'},

Bugün ${v.jobTitle} pozisyonu için benimle görüşme fırsatı bulduğunuz için teşekkür ederim. ${v.company} ve ekibiniz hakkında daha fazla bilgi edinmek harika bir deneyimdi.

Görüşmemiz sonrasında, bu pozisyonun tam olarak aradığım fırsat olduğundan daha da emin oldum. [Görüşmede bahsedilen belirli bir konu] hakkında konuştuğumuzda, becerilerimin ve deneyimimin bu role nasıl değer katabileceğini net bir şekilde görebildim.

Bu fırsatı değerlendirmeye devam ettiğinizde, ekibinize katkıda bulunmak ve ${v.company}'nin hedeflerine ulaşmasına yardımcı olmak için sabırsızlanıyorum.

Zaman ayırdığınız için bir kez daha teşekkür ederim. Sizden haber almayı dört gözle bekliyorum.

Saygılarımla,
${v.firstName} ${v.lastName}`
      : `Dear ${v.hiringManager || 'Hiring Manager'},

Thank you for taking the time to meet with me today to discuss the ${v.jobTitle} position. It was a pleasure learning more about ${v.company} and your team.

After our conversation, I am even more excited about this opportunity. When we discussed [specific topic from interview], I could clearly see how my skills and experience would add value to this role.

I am very enthusiastic about the possibility of joining your team and contributing to ${v.company}'s continued success. Please don't hesitate to reach out if you need any additional information from me.

Thank you again for your time and consideration. I look forward to hearing from you.

Best regards,
${v.firstName} ${v.lastName}`,
  },
  {
    id: 'cold-outreach',
    name: 'Cold Outreach',
    nameLocal: { en: 'Cold Outreach', tr: 'Soğuk Çağrı' },
    description: 'Direct outreach to hiring managers',
    descriptionLocal: { 
      en: 'Direct outreach to hiring managers', 
      tr: 'İşe alım yöneticilerine doğrudan ulaşma' 
    },
    icon: '💼',
    category: 'networking',
    subject: (v) => v.language === 'tr'
      ? `${v.jobTitle} - ${v.company} İçin Başvuru`
      : `${v.jobTitle} Opportunity at ${v.company}`,
    body: (v) => v.language === 'tr'
      ? `Sayın ${v.hiringManager || 'İşe Alım Yöneticisi'},

${v.company}'nin ${v.jobTitle} pozisyonu için ideal bir adayım. [X] yıllık deneyimimle, [belirli beceriler veya başarılar] konusunda kanıtlanmış bir geçmişe sahibim.

Özellikle şu konularda güçlüyüm:
• [Temel Beceri 1]
• [Temel Beceri 2]
• [Temel Beceri 3]

${v.company}'nin [belirli bir proje veya başarı] konusundaki çalışmalarını takip ediyorum ve ekibinize anlamlı katkılarda bulunabileceğime inanıyorum.

Ekli CV'mi incelemenizi ve uygun bir zamanda kısa bir görüşme yapabilmemizi umuyorum.

Saygılarımla,
${v.firstName} ${v.lastName}`
      : `Dear ${v.hiringManager || 'Hiring Manager'},

I am reaching out to express my interest in ${v.jobTitle} opportunities at ${v.company}. With [X] years of experience in [relevant field], I have a proven track record in [specific skills or achievements].

I am particularly strong in:
• [Key Skill 1]
• [Key Skill 2]
• [Key Skill 3]

I have been following ${v.company}'s work on [specific project or achievement] and believe I could bring meaningful value to your team.

I would appreciate the opportunity to discuss how my background aligns with your needs. My CV is attached for your review.

Thank you for your consideration.

Best regards,
${v.firstName} ${v.lastName}`,
  },
];

/**
 * Get recommended email template based on context
 */
export function getRecommendedEmailTemplate(
  hasReferral: boolean,
  isFollowUp: boolean
): EmailTemplate {
  if (hasReferral) {
    return EMAIL_TEMPLATES.find(t => t.id === 'referral-introduction') || EMAIL_TEMPLATES[0];
  }
  if (isFollowUp) {
    return EMAIL_TEMPLATES.find(t => t.id === 'follow-up') || EMAIL_TEMPLATES[0];
  }
  return EMAIL_TEMPLATES[0]; // Default to job application
}

/**
 * Get template by ID
 */
export function getEmailTemplate(id: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find(t => t.id === id);
}
