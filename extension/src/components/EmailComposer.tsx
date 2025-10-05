/**
 * Email Composer Component
 * Compose and send job application emails with CV attachment
 */

import React, { useState, useEffect } from 'react';
import { ResumeProfile, JobPost } from '../lib/types';
import { 
  EMAIL_TEMPLATES, 
  EmailTemplate, 
  getRecommendedEmailTemplate,
  getEmailTemplate,
  EmailVariables 
} from '../lib/emailTemplates';
import { Button } from './ui';
import { Language } from '../lib/i18n';
import { sendEmailWithGmail, openEmailClient, isGmailSendAvailable } from '../lib/gmailSender';
import { generatePDFFilename } from '../lib/pdfExport';

interface EmailComposerProps {
  profile: ResumeProfile;
  job: JobPost;
  language: Language;
  onClose: () => void;
  cvElementId: string;
}

export function EmailComposer({ profile, job, language, onClose, cvElementId }: EmailComposerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(
    getRecommendedEmailTemplate(false, false)
  );
  const [to, setTo] = useState('');
  const [hiringManager, setHiringManager] = useState(language === 'tr' ? 'İşe Alım Yöneticisi' : 'Hiring Manager');
  const [referralName, setReferralName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachCV, setAttachCV] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isGmailAvailable, setIsGmailAvailable] = useState(false);
  const [useGmail, setUseGmail] = useState(true);

  useEffect(() => {
    (async () => {
      const available = await isGmailSendAvailable();
      setIsGmailAvailable(available);
      setUseGmail(available);
    })();
  }, []);

  useEffect(() => {
    // Generate email content based on template
    const variables: EmailVariables = {
      jobTitle: job.title || 'the position',
      company: job.company || '[Company Name]',
      firstName: profile.personal.firstName,
      lastName: profile.personal.lastName,
      hiringManager,
      referralName,
      language,
    };

    setSubject(selectedTemplate.subject(variables));
    setBody(selectedTemplate.body(variables));
  }, [selectedTemplate, job, profile, hiringManager, referralName, language]);

  async function handleSend() {
    if (!to.trim()) {
      alert(language === 'tr' ? 'Lütfen alıcı email adresini girin.' : 'Please enter recipient email address.');
      return;
    }

    setIsSending(true);

    try {
      if (useGmail && isGmailAvailable) {
        // Send using Gmail API with attachment
        const filename = generatePDFFilename(
          profile.personal.firstName,
          profile.personal.lastName,
          job.title
        );

        const result = await sendEmailWithGmail(
          to,
          subject,
          body,
          attachCV ? cvElementId : undefined,
          attachCV ? filename : undefined
        );

        if (result.success) {
          alert(language === 'tr' 
            ? '✅ Email başarıyla gönderildi!' 
            : '✅ Email sent successfully!');
          onClose();
        } else {
          throw new Error(result.error);
        }
      } else {
        // Open default email client
        openEmailClient(to, subject, body);
        
        if (attachCV) {
          alert(language === 'tr'
            ? '📧 Email istemciniz açıldı. Lütfen CV\'yi manuel olarak ekleyin.'
            : '📧 Email client opened. Please attach your CV manually.');
        }
        
        onClose();
      }
    } catch (error: any) {
      console.error('Send error:', error);
      alert(language === 'tr'
        ? `❌ Email gönderilemedi: ${error.message}`
        : `❌ Failed to send email: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  }

  const t = (key: string) => {
    const translations: Record<string, { en: string; tr: string }> = {
      title: { en: 'Compose Email', tr: 'Email Oluştur' },
      templateSelection: { en: 'Select Template', tr: 'Şablon Seç' },
      emailDetails: { en: 'Email Details', tr: 'Email Detayları' },
      to: { en: 'To (Email Address)', tr: 'Alıcı (Email Adresi)' },
      hiringManager: { en: 'Hiring Manager Name', tr: 'İşe Alım Yöneticisi' },
      referralName: { en: 'Referral Name (if applicable)', tr: 'Referans Kişi (varsa)' },
      subject: { en: 'Subject', tr: 'Konu' },
      body: { en: 'Message Body', tr: 'Mesaj İçeriği' },
      attachCV: { en: 'Attach CV as PDF', tr: 'CV\'yi PDF olarak ekle' },
      sendMethod: { en: 'Send Method', tr: 'Gönderim Yöntemi' },
      useGmailAPI: { en: 'Send via Gmail (with auto-attach)', tr: 'Gmail ile gönder (otomatik ekleme)' },
      useEmailClient: { en: 'Open email client (manual attach)', tr: 'Email istemcisini aç (manuel ekleme)' },
      sendEmail: { en: 'Send Email', tr: 'Email Gönder' },
      sending: { en: 'Sending...', tr: 'Gönderiliyor...' },
      cancel: { en: 'Cancel', tr: 'İptal' },
      preview: { en: 'Preview', tr: 'Önizleme' },
      gmailNotConnected: { en: 'Gmail not connected - Go to Settings', tr: 'Gmail bağlı değil - Ayarlara git' },
    };
    return translations[key]?.[language] || translations[key]?.en || key;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          maxWidth: 900,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 32px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 24, color: '#1e293b' }}>
              📧 {t('title')}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
              {job.company || '[Company]'} - {job.title || '[Position]'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#64748b',
              padding: 8,
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
          {/* Template Selection */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#1e293b' }}>
              {t('templateSelection')}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {EMAIL_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  style={{
                    padding: 16,
                    background: selectedTemplate.id === template.id ? '#f0f4ff' : 'white',
                    border: `2px solid ${selectedTemplate.id === template.id ? '#667eea' : '#e2e8f0'}`,
                    borderRadius: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{template.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                    {template.nameLocal[language]}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {template.descriptionLocal[language]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Email Details */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#1e293b' }}>
              {t('emailDetails')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* To */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                  {t('to')} *
                </label>
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="hiring@company.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
              </div>

              {/* Hiring Manager */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                  {t('hiringManager')}
                </label>
                <input
                  type="text"
                  value={hiringManager}
                  onChange={(e) => setHiringManager(e.target.value)}
                  placeholder={language === 'tr' ? 'örn., Ahmet Yılmaz' : 'e.g., John Smith'}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
              </div>

              {/* Referral (conditional) */}
              {selectedTemplate.id === 'referral-introduction' && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                    {t('referralName')}
                  </label>
                  <input
                    type="text"
                    value={referralName}
                    onChange={(e) => setReferralName(e.target.value)}
                    placeholder={language === 'tr' ? 'örn., Ayşe Demir' : 'e.g., Jane Doe'}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                </div>
              )}

              {/* Subject */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                  {t('subject')} *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
              </div>

              {/* Body */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
                  {t('body')} *
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Attachment Option */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                <input
                  type="checkbox"
                  id="attachCV"
                  checked={attachCV}
                  onChange={(e) => setAttachCV(e.target.checked)}
                />
                <label htmlFor="attachCV" style={{ fontSize: 14, color: '#1e293b', cursor: 'pointer' }}>
                  {t('attachCV')}
                </label>
              </div>

              {/* Send Method */}
              {isGmailAvailable && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748b', marginBottom: 8 }}>
                    {t('sendMethod')}
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div
                      onClick={() => setUseGmail(true)}
                      style={{
                        padding: 12,
                        background: useGmail ? '#f0f4ff' : 'white',
                        border: `2px solid ${useGmail ? '#667eea' : '#e2e8f0'}`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <input type="radio" checked={useGmail} readOnly />
                      <span style={{ fontSize: 14, color: '#1e293b' }}>
                        📧 {t('useGmailAPI')}
                      </span>
                    </div>
                    <div
                      onClick={() => setUseGmail(false)}
                      style={{
                        padding: 12,
                        background: !useGmail ? '#f0f4ff' : 'white',
                        border: `2px solid ${!useGmail ? '#667eea' : '#e2e8f0'}`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <input type="radio" checked={!useGmail} readOnly />
                      <span style={{ fontSize: 14, color: '#1e293b' }}>
                        📬 {t('useEmailClient')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!isGmailAvailable && (
                <div style={{ padding: 12, background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 8 }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#92400e' }}>
                    ⚠️ {t('gmailNotConnected')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 32px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={isSending || !to.trim()}
          >
            {isSending ? t('sending') : t('sendEmail')}
          </Button>
        </div>
      </div>
    </div>
  );
}
