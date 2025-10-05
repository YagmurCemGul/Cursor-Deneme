import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ResumeProfile, JobPost, AtsOptimization, EmploymentType } from '../lib/types';
import { getActiveProfile, loadOptimizations, saveJobPost, saveOptimizations, saveOrUpdateProfile, loadOptions, loadJobPost, loadGeneratedResume, loadGeneratedCoverLetter, saveGeneratedResume, saveGeneratedCoverLetter } from '../lib/storage';
import { generateAtsResume, generateCoverLetter } from '../lib/ai';
import { TabButton, TextRow, SectionHeader, Pill, Button } from '../components/ui';
import { validateEmail, validatePhone, validateURL, validateLinkedIn, validateGitHub, formatPhoneNumber, calculateDateDuration, formatDate, calculateProfileCompletion, getSkillSuggestions, skillSuggestions } from '../lib/validation';
import { CVPreview } from '../components/CVPreview';
import { TemplateGallery } from '../components/TemplateGallery';
import { ATSScoreCard } from '../components/ATSScoreCard';
import { LinkedInImport } from '../components/LinkedInImport';
import { JobTracker } from '../components/JobTracker';
import { ProfileManager } from '../components/ProfileManager';
import { DescriptionEnhancer } from '../components/DescriptionEnhancer';
import { CoverLetterBuilder } from '../components/CoverLetterBuilder';
import { EmailComposer } from '../components/EmailComposer';
import { TemplateType, TemplateColors, TemplateFonts } from '../lib/templates';
import { exportToPDF, exportToImage, printCV, generatePDFFilename } from '../lib/pdfExport';
import { calculateATSScore, ATSScore } from '../lib/atsScoring';
import { convertLinkedInToProfile, LinkedInProfile } from '../lib/linkedinImport';
import { initLanguage, setLanguage, getCurrentLanguage, t, Language } from '../lib/i18n';
import { exportToGoogleDocs, isGoogleDocsAvailable } from '../lib/googleDocsExport';
import '../styles/global.css';

export function NewTab() {
  const [active, setActive] = useState<'cv' | 'job' | 'preview' | 'downloads' | 'cover' | 'settings' | 'tracker'>('cv');
  const [profile, setProfile] = useState<ResumeProfile | undefined>();
  const [job, setJob] = useState<JobPost>({ id: crypto.randomUUID(), pastedText: '' });
  const [resumeMd, setResumeMd] = useState<string>('');
  const [coverMd, setCoverMd] = useState<string>('');
  const [optimizations, setOptimizations] = useState<AtsOptimization[]>([]);
  const [extraPrompt, setExtraPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [apiProvider, setApiProvider] = useState<'openai' | 'azure' | 'gemini' | 'claude'>('openai');
  const [language, setLanguage] = useState<'tr' | 'en'>('en');
  
  // New states for improvements
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [cvTemplate, setCvTemplate] = useState<TemplateType>('professional');
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [customColors, setCustomColors] = useState<Partial<TemplateColors>>({});
  const [customFonts, setCustomFonts] = useState<Partial<TemplateFonts>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
  const [showATSScore, setShowATSScore] = useState(false);
  const [showLinkedInImport, setShowLinkedInImport] = useState(false);
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [allProfiles, setAllProfiles] = useState<ResumeProfile[]>([]);
  const [enhancerState, setEnhancerState] = useState<{
    show: boolean;
    description: string;
    context: any;
    onApply: (enhanced: string) => void;
  } | null>(null);
  const [showCoverLetterBuilder, setShowCoverLetterBuilder] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [cvLanguage, setCvLanguage] = useState<Language>('en');
  const [isGoogleDocsConnected, setIsGoogleDocsConnected] = useState(false);
  const [isExportingToDocs, setIsExportingToDocs] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);

  useEffect(() => {
    (async () => {
      // Initialize language
      const lang = await initLanguage();
      setCurrentLang(lang);
      
      // Check Google Docs availability
      const googleAvailable = await isGoogleDocsAvailable();
      setIsGoogleDocsConnected(googleAvailable);
      
      // Load all profiles
      const profiles = await storage.get<ResumeProfile[]>(storage.keys.PROFILES) || [];
      setAllProfiles(profiles);
      
      let p = await getActiveProfile();
      if (!p) {
        // Create default profile
        p = {
          id: crypto.randomUUID(),
          profileName: 'My Profile',
          personal: {
            firstName: '',
            lastName: '',
            email: '',
          },
          skills: [],
          experience: [],
          education: [],
          licenses: [],
          projects: [],
          extraQuestions: [],
          templates: [],
        };
        await saveOrUpdateProfile(p);
      }
      setProfile(p);
      const opt = await loadOptimizations();
      setOptimizations(opt);
      
      const opts = await loadOptions();
      if (opts) {
        setApiKey(opts.apiKey ?? '');
        setApiProvider(opts.apiProvider ?? 'openai');
        setLanguage(opts.language ?? 'en');
      }

      // Load saved job post, resume, and cover letter
      const savedJob = await loadJobPost();
      if (savedJob) {
        setJob(savedJob);
      }

      const savedResume = await loadGeneratedResume();
      if (savedResume) {
        setResumeMd(savedResume);
      }

      const savedCoverLetter = await loadGeneratedCoverLetter();
      if (savedCoverLetter) {
        setCoverMd(savedCoverLetter);
      }

      // Load saved template preferences
      const savedTemplate = await chrome.storage.local.get(['cvTemplate', 'customColors', 'customFonts']);
      if (savedTemplate.cvTemplate) {
        setCvTemplate(savedTemplate.cvTemplate);
      }
      if (savedTemplate.customColors) {
        setCustomColors(savedTemplate.customColors);
      }
      if (savedTemplate.customFonts) {
        setCustomFonts(savedTemplate.customFonts);
      }
    })();
  }, []);

  // Save template preferences
  async function saveTemplatePreferences(template: TemplateType, colors?: Partial<TemplateColors>, fonts?: Partial<TemplateFonts>) {
    await chrome.storage.local.set({
      cvTemplate: template,
      customColors: colors || customColors,
      customFonts: fonts || customFonts,
    });
  }

  // PDF Export handlers
  async function handleExportToPDF() {
    if (!profile) return;
    
    setIsExporting(true);
    try {
      const filename = generatePDFFilename(
        profile.personal.firstName,
        profile.personal.lastName,
        job.title
      );
      
      await exportToPDF('cv-preview-content', {
        filename,
        format: 'a4',
        orientation: 'portrait',
        quality: 0.95,
      });
      
      alert('✅ PDF exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }

  async function handleExportToImage(format: 'png' | 'jpeg') {
    if (!profile) return;
    
    setIsExporting(true);
    try {
      const filename = generatePDFFilename(
        profile.personal.firstName,
        profile.personal.lastName,
        job.title
      ).replace('.pdf', `.${format}`);
      
      await exportToImage('cv-preview-content', filename, format);
      
      alert(`✅ Image exported successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }

  async function handleExportToGoogleDocs() {
    if (!profile) return;
    
    if (!isGoogleDocsConnected) {
      const shouldOpenSettings = confirm(
        '📄 Google Docs is not connected.\n\nWould you like to open Settings to connect your Google account?'
      );
      if (shouldOpenSettings) {
        chrome.runtime.openOptionsPage();
      }
      return;
    }
    
    setIsExportingToDocs(true);
    try {
      const result = await exportToGoogleDocs(profile, cvLanguage);
      
      const shouldOpen = confirm(
        `✅ CV exported to Google Docs successfully!\n\nWould you like to open it now?`
      );
      
      if (shouldOpen) {
        window.open(result.documentUrl, '_blank');
      }
    } catch (error: any) {
      console.error('Google Docs export error:', error);
      alert(`❌ Failed to export to Google Docs.\n\n${error.message || 'Please try again.'}`);
    } finally {
      setIsExportingToDocs(false);
    }
  }

  function handlePrint() {
    printCV('cv-preview-content');
  }

  // Calculate ATS Score
  function calculateAndShowATSScore() {
    if (!profile) {
      alert('Please complete your profile first!');
      return;
    }
    
    if (!job.pastedText) {
      alert('Please paste a job description in the Job tab first!');
      return;
    }
    
    const score = calculateATSScore(profile, job);
    setAtsScore(score);
    setShowATSScore(true);
  }

  // Auto-calculate ATS score when profile or job changes
  useEffect(() => {
    if (profile && job.pastedText && showATSScore) {
      const score = calculateATSScore(profile, job);
      setAtsScore(score);
    }
  }, [profile, job.pastedText, showATSScore]);

  // Handle LinkedIn import
  async function handleLinkedInImport(linkedinProfile: Partial<LinkedInProfile>) {
    if (!profile) return;
    
    const updatedProfile = convertLinkedInToProfile(linkedinProfile, profile);
    await saveProfile(updatedProfile);
    
    alert('✅ LinkedIn profile imported successfully!');
    setShowLinkedInImport(false);
  }

  const linkedInUrl = useMemo(() => profile?.personal.linkedin ? `https://www.linkedin.com/in/${profile.personal.linkedin}` : '', [profile]);
  const githubUrl = useMemo(() => profile?.personal.github ? `https://github.com/${profile.personal.github}` : '', [profile]);

  async function handleGenerateResume() {
    if (!profile || !job.pastedText) return;
    setIsGenerating(true);
    try {
      const result = await generateAtsResume(profile, job);
      setResumeMd(result.text);
      setOptimizations(result.optimizations);
      await saveOptimizations(result.optimizations);
      await saveGeneratedResume(result.text);
      await saveJobPost(job);
      setActive('preview');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleGenerateCoverLetter() {
    if (!profile || !job.pastedText) return;
    setIsGenerating(true);
    try {
      const result = await generateCoverLetter(profile, job, extraPrompt);
      setCoverMd(result.text);
      await saveGeneratedCoverLetter(result.text);
      await saveJobPost(job);
      setActive('cover');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRemoveOptimization(id: string) {
    const updated = optimizations.filter(o => o.id !== id);
    setOptimizations(updated);
    await saveOptimizations(updated);
  }

  function downloadText(filename: string, mime: string, content: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({ url, filename });
  }

  function sanitizeFileBase(): string {
    const name = `${profile?.personal.firstName ?? 'Name'}_${profile?.personal.lastName ?? 'Surname'}_${job.title ?? 'Resume'}`;
    return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-.]/g, '');
  }

  // Auto-save profile with indicator
  async function saveProfile(updated: ResumeProfile) {
    setProfile(updated);
    setIsSaving(true);
    try {
      await saveOrUpdateProfile(updated);
      setLastSaved(new Date());
      
      // Update profiles list
      const profiles = await storage.get<ResumeProfile[]>(storage.keys.PROFILES) || [];
      setAllProfiles(profiles);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  }

  async function handleProfileSwitch(newProfile: ResumeProfile) {
    setProfile(newProfile);
    
    // Update profiles list
    const profiles = await storage.get<ResumeProfile[]>(storage.keys.PROFILES) || [];
    setAllProfiles(profiles);
  }

  // Validate field with real-time feedback
  function validateField(field: string, value: string) {
    let result;
    switch (field) {
      case 'email':
        result = validateEmail(value);
        break;
      case 'phone':
        result = validatePhone(value);
        break;
      case 'portfolio':
        result = validateURL(value);
        break;
      case 'linkedin':
        result = validateLinkedIn(value);
        break;
      case 'github':
        result = validateGitHub(value);
        break;
      default:
        result = { isValid: true };
    }
    
    if (!result.isValid && result.error) {
      setValidationErrors(prev => ({ ...prev, [field]: result.error! }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  // Calculate profile completion
  const profileCompletion = useMemo(() => {
    if (!profile) return { percentage: 0, missingFields: [] };
    return calculateProfileCompletion(profile);
  }, [profile]);

  // Toggle section collapse
  function toggleSection(section: string) {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  // Duplicate experience
  function duplicateExperience(index: number) {
    if (!profile) return;
    const exp = { ...profile.experience[index] };
    saveProfile({
      ...profile,
      experience: [...profile.experience.slice(0, index + 1), exp, ...profile.experience.slice(index + 1)]
    });
  }

  // Duplicate education
  function duplicateEducation(index: number) {
    if (!profile) return;
    const edu = { ...profile.education[index] };
    saveProfile({
      ...profile,
      education: [...profile.education.slice(0, index + 1), edu, ...profile.education.slice(index + 1)]
    });
  }

  // AI generate summary
  async function generateAISummary() {
    if (!profile || !apiKey) {
      alert('Please set up your API key in Settings first!');
      return;
    }
    
    setIsGeneratingSummary(true);
    try {
      // Create a simple prompt based on profile data
      const experienceText = profile.experience.map(exp => 
        `${exp.title} at ${exp.company}`
      ).join(', ');
      
      const skillsText = profile.skills.join(', ');
      
      const prompt = `Write a professional summary (2-3 sentences, max 150 words) for a resume based on this information:
      
Name: ${profile.personal.firstName} ${profile.personal.lastName}
Experience: ${experienceText || 'Entry level'}
Skills: ${skillsText || 'Various skills'}
      
Make it compelling, highlight key strengths, and use action-oriented language.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 200
        })
      });

      if (!response.ok) throw new Error('Failed to generate summary');
      
      const data = await response.json();
      const summary = data.choices[0].message.content.trim();
      
      saveProfile({
        ...profile,
        personal: { ...profile.personal, summary }
      });
    } catch (error) {
      alert('Failed to generate summary. Please check your API key and try again.');
    } finally {
      setIsGeneratingSummary(false);
    }
  }

  // Add skill from suggestions
  function addSkillFromSuggestion(skill: string) {
    if (!profile) return;
    saveProfile({
      ...profile,
      skills: [...profile.skills, skill]
    });
    setSkillSearchQuery('');
  }

  // Get filtered skill suggestions
  const filteredSkillSuggestions = useMemo(() => {
    if (!profile) return [];
    const suggestions = getSkillSuggestions(profile.skills);
    if (!skillSearchQuery) return suggestions.slice(0, 20);
    return suggestions.filter(s => 
      s.toLowerCase().includes(skillSearchQuery.toLowerCase())
    ).slice(0, 20);
  }, [profile?.skills, skillSearchQuery]);

  function addExperience() {
    if (!profile) return;
    saveProfile({
      ...profile,
      experience: [
        ...profile.experience,
        {
          title: '',
          company: '',
          startDate: '',
          employmentType: 'Full-time',
        },
      ],
    });
  }

  function removeExperience(index: number) {
    if (!profile) return;
    saveProfile({
      ...profile,
      experience: profile.experience.filter((_, i) => i !== index),
    });
  }

  function updateExperience(index: number, field: string, value: any) {
    if (!profile) return;
    const updated = [...profile.experience];
    updated[index] = { ...updated[index], [field]: value };
    saveProfile({ ...profile, experience: updated });
  }

  function addEducation() {
    if (!profile) return;
    saveProfile({
      ...profile,
      education: [
        ...profile.education,
        {
          school: '',
          degree: '',
          fieldOfStudy: '',
        },
      ],
    });
  }

  function removeEducation(index: number) {
    if (!profile) return;
    saveProfile({
      ...profile,
      education: profile.education.filter((_, i) => i !== index),
    });
  }

  function updateEducation(index: number, field: string, value: any) {
    if (!profile) return;
    const updated = [...profile.education];
    updated[index] = { ...updated[index], [field]: value };
    saveProfile({ ...profile, education: updated });
  }

  function addProject() {
    if (!profile) return;
    saveProfile({
      ...profile,
      projects: [
        ...profile.projects,
        {
          name: '',
          description: '',
        },
      ],
    });
  }

  function removeProject(index: number) {
    if (!profile) return;
    saveProfile({
      ...profile,
      projects: profile.projects.filter((_, i) => i !== index),
    });
  }

  function updateProject(index: number, field: string, value: any) {
    if (!profile) return;
    const updated = [...profile.projects];
    updated[index] = { ...updated[index], [field]: value };
    saveProfile({ ...profile, projects: updated });
  }

  function addLicense() {
    if (!profile) return;
    saveProfile({
      ...profile,
      licenses: [
        ...profile.licenses,
        {
          name: '',
          organization: '',
        },
      ],
    });
  }

  function removeLicense(index: number) {
    if (!profile) return;
    saveProfile({
      ...profile,
      licenses: profile.licenses.filter((_, i) => i !== index),
    });
  }

  function updateLicense(index: number, field: string, value: any) {
    if (!profile) return;
    const updated = [...profile.licenses];
    updated[index] = { ...updated[index], [field]: value };
    saveProfile({ ...profile, licenses: updated });
  }

  async function saveSettings() {
    const opts = {
      apiKey,
      apiProvider,
      language,
    };
    await chrome.storage.local.set({ options: opts });
    alert('Settings saved successfully!');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ background: 'white', borderRadius: 16, padding: '24px 32px', marginBottom: 24, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, color: '#1e293b', marginBottom: 8 }}>
                🚀 {t('header.title', currentLang)}
              </h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
                {t('header.subtitle', currentLang)}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Profile Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setShowProfileManager(true)}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>👤</span>
                  <span>{profile?.profileName || 'My Profile'}</span>
                  {allProfiles.length > 1 && (
                    <span style={{
                      marginLeft: 4,
                      padding: '2px 6px',
                      background: 'rgba(255,255,255,0.3)',
                      borderRadius: 4,
                      fontSize: 11,
                    }}>
                      {allProfiles.length}
                    </span>
                  )}
                </button>
              </div>
              
              {/* Language & Auto-save indicators */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Language indicator */}
                <div style={{
                  padding: '6px 12px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <span>{currentLang === 'tr' ? '🇹🇷' : '🇬🇧'}</span>
                  <span>{currentLang.toUpperCase()}</span>
                </div>
                
                {/* Auto-save indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: isSaving ? '#fef3c7' : '#f0fdf4', borderRadius: 8, border: '1px solid ' + (isSaving ? '#fbbf24' : '#86efac') }}>
                  {isSaving ? (
                    <>
                      <div style={{ width: 12, height: 12, border: '2px solid #f59e0b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>{t('header.saving', currentLang)}</span>
                    </>
                  ) : lastSaved ? (
                    <>
                      <span style={{ fontSize: 16 }}>✓</span>
                      <span style={{ fontSize: 13, color: '#166534', fontWeight: 500 }}>{t('header.saved', currentLang)}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Completion Progress */}
          {active === 'cv' && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Profile Completion</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: profileCompletion.percentage === 100 ? '#16a34a' : '#667eea' }}>
                  {profileCompletion.percentage}%
                </span>
              </div>
              <div style={{ width: '100%', height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ 
                  width: `${profileCompletion.percentage}%`, 
                  height: '100%', 
                  background: profileCompletion.percentage === 100 ? '#16a34a' : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              {profileCompletion.missingFields.length > 0 && profileCompletion.percentage < 100 && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
                  💡 Missing: {profileCompletion.missingFields.slice(0, 3).join(', ')}
                  {profileCompletion.missingFields.length > 3 && ` and ${profileCompletion.missingFields.length - 3} more`}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Add keyframe animation for spinner */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>

        {/* Main Content */}
        <div style={{ background: 'white', borderRadius: 16, padding: 0, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div className="tabbar" style={{ borderRadius: '16px 16px 0 0' }}>
            <TabButton id="cv" active={active} setActive={id => setActive(id as any)}>📝 CV Profile</TabButton>
            <TabButton id="job" active={active} setActive={id => setActive(id as any)}>💼 Job Description</TabButton>
            <TabButton id="preview" active={active} setActive={id => setActive(id as any)}>👁️ Resume Preview</TabButton>
            <TabButton id="cover" active={active} setActive={id => setActive(id as any)}>✉️ Cover Letter</TabButton>
            <TabButton id="tracker" active={active} setActive={id => setActive(id as any)}>📚 Job Tracker</TabButton>
            <TabButton id="downloads" active={active} setActive={id => setActive(id as any)}>⬇️ Downloads</TabButton>
            <TabButton id="settings" active={active} setActive={id => setActive(id as any)}>⚙️ Settings</TabButton>
          </div>

          {/* CV Tab with Split-Screen Preview */}
          {active === 'cv' ? (
            <div style={{ display: 'flex', height: 'calc(100vh - 300px)' }}>
              {/* Left Side - Form */}
              <div style={{ 
                flex: showPreview ? '0 0 50%' : '1', 
                padding: 32, 
                overflowY: 'auto',
                borderRight: showPreview ? '1px solid #e5e7eb' : 'none',
                transition: 'flex 0.3s ease'
              }}>
                {/* Preview Toggle Button */}
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button 
                      variant={showPreview ? 'primary' : 'secondary'}
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? '👁️ Hide Preview' : '👁️ Show Live Preview'}
                    </Button>
                    {showPreview && (
                      <Button 
                        variant="secondary"
                        onClick={() => setShowTemplateGallery(true)}
                      >
                        🎨 Change Template
                      </Button>
                    )}
                    <Button 
                      variant={showATSScore ? 'primary' : 'secondary'}
                      onClick={() => {
                        if (!showATSScore) {
                          calculateAndShowATSScore();
                        } else {
                          setShowATSScore(false);
                        }
                      }}
                      disabled={!profile?.personal.firstName || !job.pastedText}
                    >
                      {showATSScore ? '📊 Hide ATS Score' : '📊 Check ATS Score'}
                    </Button>
                  </div>
                  {showPreview && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        Current: <strong>{cvTemplate}</strong>
                      </span>
                    </div>
                  )}
                  {showATSScore && atsScore && (
                    <div style={{ 
                      padding: '6px 12px', 
                      background: atsScore.overallScore >= 70 ? '#10b98115' : '#f59e0b15',
                      border: `1px solid ${atsScore.overallScore >= 70 ? '#10b98140' : '#f59e0b40'}`,
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      color: atsScore.overallScore >= 70 ? '#10b981' : '#f59e0b',
                    }}>
                      ATS Score: {atsScore.overallScore}/100
                    </div>
                  )}
                </div>

                {/* ATS Score Card */}
                {showATSScore && atsScore && (
                  <div style={{ marginBottom: 24 }}>
                    <ATSScoreCard 
                      score={atsScore}
                      onRefresh={calculateAndShowATSScore}
                    />
                  </div>
                )}

            {active === 'cv' && (
              <div className="col" style={{ gap: 16 }}>
                {/* LinkedIn Import Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                  padding: '16px 20px',
                  borderRadius: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 32 }}>💼</span>
                    <div>
                      <div style={{ color: 'white', fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
                        Import from LinkedIn
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
                        Save time by importing your LinkedIn profile data
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="secondary"
                    onClick={() => setShowLinkedInImport(true)}
                    style={{ background: 'white', color: '#0077b5', border: 'none', fontWeight: 600 }}
                  >
                    Import Now
                  </Button>
                </div>

                <SectionHeader 
                  title="Personal Information" 
                  actions={
                    <Button variant="ghost" onClick={() => toggleSection('personal')}>
                      {collapsedSections.personal ? '📂 Expand' : '📁 Collapse'}
                    </Button>
                  }
                />
                {!collapsedSections.personal && (
                  <>
                    <div className="row">
                      <label className="col" style={{ minWidth: 220, flex: 1 }}>
                        <span className="label">First name <span style={{ color: '#ef4444' }}>*</span></span>
                        <input 
                          className="text-input" 
                          value={profile?.personal.firstName ?? ''} 
                          onChange={(e) => profile && saveProfile({ ...profile, personal: { ...profile.personal, firstName: e.target.value } })} 
                          placeholder="John"
                          style={{ borderColor: !profile?.personal.firstName ? '#fca5a5' : undefined }}
                        />
                      </label>
                      <TextRow label="Middle name" value={profile?.personal.middleName ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, middleName: v } })} />
                      <label className="col" style={{ minWidth: 220, flex: 1 }}>
                        <span className="label">Last name <span style={{ color: '#ef4444' }}>*</span></span>
                        <input 
                          className="text-input" 
                          value={profile?.personal.lastName ?? ''} 
                          onChange={(e) => profile && saveProfile({ ...profile, personal: { ...profile.personal, lastName: e.target.value } })} 
                          placeholder="Doe"
                          style={{ borderColor: !profile?.personal.lastName ? '#fca5a5' : undefined }}
                        />
                      </label>
                    </div>
                    <div className="row">
                      <label className="col" style={{ minWidth: 220, flex: 1 }}>
                        <span className="label">Email <span style={{ color: '#ef4444' }}>*</span></span>
                        <input 
                          className="text-input" 
                          type="email"
                          value={profile?.personal.email ?? ''} 
                          onChange={(e) => {
                            const value = e.target.value;
                            profile && saveProfile({ ...profile, personal: { ...profile.personal, email: value } });
                            validateField('email', value);
                          }}
                          onBlur={(e) => validateField('email', e.target.value)}
                          placeholder="john.doe@example.com"
                          style={{ borderColor: validationErrors.email ? '#ef4444' : (!profile?.personal.email ? '#fca5a5' : undefined) }}
                        />
                        {validationErrors.email && <span style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>⚠️ {validationErrors.email}</span>}
                      </label>
                      <label className="col" style={{ minWidth: 220, flex: 1 }}>
                        <span className="label">Phone</span>
                        <input 
                          className="text-input" 
                          type="tel"
                          value={profile?.personal.phone ?? ''} 
                          onChange={(e) => {
                            const value = e.target.value;
                            profile && saveProfile({ ...profile, personal: { ...profile.personal, phone: value } });
                            validateField('phone', value);
                          }}
                          onBlur={(e) => validateField('phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          style={{ borderColor: validationErrors.phone ? '#ef4444' : undefined }}
                        />
                        {validationErrors.phone && <span style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>⚠️ {validationErrors.phone}</span>}
                      </label>
                    </div>
                    <div className="row">
                      <label className="col" style={{ minWidth: 220, flex: 1 }}>
                        <span className="label">LinkedIn</span>
                        <input 
                          className="text-input" 
                          value={profile?.personal.linkedin ?? ''} 
                          onChange={(e) => {
                            const value = e.target.value.replace('https://www.linkedin.com/in/', '').replace('https://linkedin.com/in/', '');
                            profile && saveProfile({ ...profile, personal: { ...profile.personal, linkedin: value } });
                            validateField('linkedin', value);
                          }}
                          placeholder="username or linkedin.com/in/username"
                          style={{ borderColor: validationErrors.linkedin ? '#ef4444' : undefined }}
                        />
                        {validationErrors.linkedin && <span style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>⚠️ {validationErrors.linkedin}</span>}
                      </label>
                      <label className="col" style={{ minWidth: 220, flex: 1 }}>
                        <span className="label">GitHub</span>
                        <input 
                          className="text-input" 
                          value={profile?.personal.github ?? ''} 
                          onChange={(e) => {
                            const value = e.target.value.replace('https://github.com/', '');
                            profile && saveProfile({ ...profile, personal: { ...profile.personal, github: value } });
                            validateField('github', value);
                          }}
                          placeholder="username or github.com/username"
                          style={{ borderColor: validationErrors.github ? '#ef4444' : undefined }}
                        />
                        {validationErrors.github && <span style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>⚠️ {validationErrors.github}</span>}
                      </label>
                    </div>
                    <div className="row">
                      <label className="col" style={{ minWidth: 220, flex: 1 }}>
                        <span className="label">Portfolio Website</span>
                        <input 
                          className="text-input" 
                          value={profile?.personal.portfolio ?? ''} 
                          onChange={(e) => {
                            const value = e.target.value;
                            profile && saveProfile({ ...profile, personal: { ...profile.personal, portfolio: value } });
                            validateField('portfolio', value);
                          }}
                          placeholder="https://yourwebsite.com"
                          style={{ borderColor: validationErrors.portfolio ? '#ef4444' : undefined }}
                        />
                        {validationErrors.portfolio && <span style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>⚠️ {validationErrors.portfolio}</span>}
                      </label>
                      <TextRow label="Location" value={profile?.personal.location ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, location: v } })} placeholder="San Francisco, CA" />
                    </div>
                    
                    <div className="col" style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span className="label">Professional Summary</span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: '#64748b' }}>
                            {(profile?.personal.summary ?? '').length}/500 characters
                          </span>
                          <Button 
                            variant="secondary" 
                            onClick={generateAISummary}
                            disabled={isGeneratingSummary || !apiKey}
                            style={{ fontSize: 12, padding: '6px 12px' }}
                          >
                            {isGeneratingSummary ? '⏳ Generating...' : '✨ AI Generate'}
                          </Button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <textarea 
                          className="textarea" 
                          style={{ minHeight: 120, flex: 1 }}
                          value={profile?.personal.summary ?? ''} 
                          onChange={(e) => {
                            const value = e.target.value.slice(0, 500);
                            profile && saveProfile({ ...profile, personal: { ...profile.personal, summary: value } });
                          }}
                          placeholder="Write a brief professional summary highlighting your key strengths and experience... (Max 500 characters)"
                          maxLength={500}
                        />
                        {profile?.personal.summary && (
                          <Button
                            variant="secondary"
                            onClick={() => setEnhancerState({
                              show: true,
                              description: profile.personal.summary || '',
                              context: {
                                type: 'summary',
                                role: profile.experience[0]?.title,
                              },
                              onApply: (enhanced) => {
                                if (profile) {
                                  saveProfile({ ...profile, personal: { ...profile.personal, summary: enhanced.slice(0, 500) } });
                                }
                              },
                            })}
                            style={{ fontSize: 12, padding: '8px 12px', whiteSpace: 'nowrap' }}
                          >
                            ✨ Enhance
                          </Button>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        💡 Tip: Keep it concise (2-3 sentences) and highlight your unique value proposition
                      </div>
                    </div>
                  </>
                )}

                <div className="divider" />

                <SectionHeader 
                  title="Skills" 
                  actions={
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="ghost" onClick={() => setShowSkillSuggestions(!showSkillSuggestions)}>
                        {showSkillSuggestions ? '🔍 Hide Suggestions' : '💡 Show Suggestions'}
                      </Button>
                      <Button variant="secondary" onClick={() => profile && saveProfile({ ...profile, skills: [...(profile.skills ?? []), ''] })}>
                        + Add Skill
                      </Button>
                      <Button variant="ghost" onClick={() => toggleSection('skills')}>
                        {collapsedSections.skills ? '📂 Expand' : '📁 Collapse'}
                      </Button>
                    </div>
                  } 
                />
                
                {/* Skill Suggestions */}
                {!collapsedSections.skills && showSkillSuggestions && (
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ marginBottom: 12 }}>
                      <input 
                        className="text-input" 
                        value={skillSearchQuery}
                        onChange={(e) => setSkillSearchQuery(e.target.value)}
                        placeholder="Search skills... (e.g., React, Python, Leadership)"
                        style={{ marginBottom: 8 }}
                      />
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                        💡 Popular skills - Click to add:
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {filteredSkillSuggestions.slice(0, 30).map((skill, idx) => (
                        <button 
                          key={idx}
                          onClick={() => addSkillFromSuggestion(skill)}
                          style={{
                            padding: '6px 12px',
                            background: 'white',
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            fontSize: 13,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#667eea';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.borderColor = '#667eea';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = 'inherit';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                          }}
                        >
                          + {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {!collapsedSections.skills && (
                  <div className="col" style={{ gap: 8 }}>
                    {(profile?.skills ?? []).length === 0 ? (
                      <div className="empty-state">
                        <p className="empty-state-text">No skills added yet. Click "Add Skill" or "Show Suggestions" to get started.</p>
                      </div>
                    ) : (
                      (profile?.skills ?? []).map((s, i) => (
                        <div className="row" key={i} style={{ alignItems: 'center' }}>
                          <input 
                            className="text-input" 
                            value={s} 
                            onChange={(e) => profile && saveProfile({ ...profile, skills: profile.skills.map((x, idx) => idx === i ? e.target.value : x) })} 
                            placeholder="Enter skill (e.g., React, Python, Project Management)..."
                          />
                          <Button variant="ghost" onClick={() => profile && saveProfile({ ...profile, skills: profile.skills.filter((_, idx) => idx !== i) })}>
                            🗑️ Remove
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div className="divider" />

                <SectionHeader 
                  title="Experience" 
                  actions={
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="secondary" onClick={addExperience}>
                        + Add Experience
                      </Button>
                      <Button variant="ghost" onClick={() => toggleSection('experience')}>
                        {collapsedSections.experience ? '📂 Expand' : '📁 Collapse'}
                      </Button>
                    </div>
                  } 
                />
                {!collapsedSections.experience && (
                  <>
                    {(profile?.experience ?? []).length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">💼</div>
                        <p className="empty-state-title">No work experience added</p>
                        <p className="empty-state-text">Add your professional experience to build a compelling resume</p>
                      </div>
                    ) : (
                      (profile?.experience ?? []).map((exp, i) => (
                        <div key={i} className="card">
                          <div className="row" style={{ marginBottom: 12, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <h4 style={{ margin: 0, color: '#1e293b' }}>
                                {exp.title || `Experience #${i + 1}`}
                                {exp.company && ` @ ${exp.company}`}
                              </h4>
                              {exp.startDate && (
                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                                  📅 {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : (exp.endDate ? formatDate(exp.endDate) : 'Present')}
                                  {exp.startDate && (
                                    <span style={{ marginLeft: 8, fontWeight: 500 }}>
                                      ({calculateDateDuration(exp.startDate, exp.endDate, exp.isCurrent)})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Button variant="secondary" onClick={() => duplicateExperience(i)} style={{ fontSize: 12, padding: '6px 12px' }}>
                                📋 Duplicate
                              </Button>
                              <Button variant="danger" onClick={() => removeExperience(i)}>
                                🗑️ Remove
                              </Button>
                            </div>
                          </div>
                      <div className="row">
                        <TextRow 
                          label="Job Title" 
                          value={exp.title} 
                          onChange={(v) => updateExperience(i, 'title', v)} 
                          placeholder="e.g., Senior Software Engineer"
                        />
                        <TextRow 
                          label="Company" 
                          value={exp.company} 
                          onChange={(v) => updateExperience(i, 'company', v)} 
                          placeholder="e.g., Google"
                        />
                      </div>
                      <div className="row">
                        <label className="col" style={{ flex: 1 }}>
                          <span className="label">Employment Type</span>
                          <select 
                            value={exp.employmentType ?? 'Full-time'} 
                            onChange={(e) => updateExperience(i, 'employmentType', e.target.value as EmploymentType)}
                          >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                            <option value="Freelance">Freelance</option>
                          </select>
                        </label>
                        <label className="col" style={{ flex: 1 }}>
                          <span className="label">Location Type</span>
                          <select 
                            value={exp.locationType ?? 'On-site'} 
                            onChange={(e) => updateExperience(i, 'locationType', e.target.value)}
                          >
                            <option value="On-site">On-site</option>
                            <option value="Remote">Remote</option>
                            <option value="Hybrid">Hybrid</option>
                          </select>
                        </label>
                      </div>
                      <div className="row">
                        <label className="col" style={{ flex: 1 }}>
                          <span className="label">Start Date</span>
                          <input 
                            type="month" 
                            className="date-input" 
                            value={exp.startDate ?? ''} 
                            onChange={(e) => updateExperience(i, 'startDate', e.target.value)} 
                          />
                        </label>
                        <label className="col" style={{ flex: 1 }}>
                          <span className="label">End Date</span>
                          <input 
                            type="month" 
                            className="date-input" 
                            value={exp.endDate ?? ''} 
                            onChange={(e) => updateExperience(i, 'endDate', e.target.value)} 
                            disabled={exp.isCurrent}
                          />
                        </label>
                        <label className="row" style={{ alignItems: 'center', gap: 8 }}>
                          <input 
                            type="checkbox" 
                            className="checkbox"
                            checked={exp.isCurrent ?? false} 
                            onChange={(e) => updateExperience(i, 'isCurrent', e.target.checked)} 
                          />
                          <span className="label" style={{ margin: 0 }}>Currently working here</span>
                        </label>
                      </div>
                      <div className="col">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span className="label">Description</span>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: '#64748b' }}>
                              {(exp.description ?? '').length} characters
                            </span>
                            {exp.description && (
                              <Button
                                variant="secondary"
                                onClick={() => setEnhancerState({
                                  show: true,
                                  description: exp.description || '',
                                  context: {
                                    type: 'experience',
                                    title: exp.title,
                                    company: exp.company,
                                  },
                                  onApply: (enhanced) => updateExperience(i, 'description', enhanced),
                                })}
                                style={{ fontSize: 11, padding: '4px 10px' }}
                              >
                                ✨ Enhance
                              </Button>
                            )}
                          </div>
                        </div>
                        <textarea 
                          className="textarea" 
                          value={exp.description ?? ''} 
                          onChange={(e) => updateExperience(i, 'description', e.target.value)} 
                          placeholder="Describe your responsibilities and achievements... Use bullet points starting with strong action verbs."
                          style={{ minHeight: 100 }}
                        />
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                          💡 Tip: Use action verbs (Led, Developed, Managed) and quantify achievements (increased by 40%, reduced by 30%)
                        </div>
                      </div>
                    </div>
                  ))
                )}
                  </>
                )}

                <div className="divider" />

                <SectionHeader 
                  title="Education" 
                  actions={
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="secondary" onClick={addEducation}>
                        + Add Education
                      </Button>
                      <Button variant="ghost" onClick={() => toggleSection('education')}>
                        {collapsedSections.education ? '📂 Expand' : '📁 Collapse'}
                      </Button>
                    </div>
                  } 
                />
                {!collapsedSections.education && (
                  <>
                    {(profile?.education ?? []).length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">🎓</div>
                        <p className="empty-state-title">No education added</p>
                        <p className="empty-state-text">Add your educational background</p>
                      </div>
                    ) : (
                      (profile?.education ?? []).map((edu, i) => (
                        <div key={i} className="card">
                          <div className="row" style={{ marginBottom: 12, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <h4 style={{ margin: 0, color: '#1e293b' }}>
                                {edu.degree || `Education #${i + 1}`}
                                {edu.school && ` - ${edu.school}`}
                              </h4>
                              {edu.startDate && edu.endDate && (
                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                                  📅 {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Button variant="secondary" onClick={() => duplicateEducation(i)} style={{ fontSize: 12, padding: '6px 12px' }}>
                                📋 Duplicate
                              </Button>
                              <Button variant="danger" onClick={() => removeEducation(i)}>
                                🗑️ Remove
                              </Button>
                            </div>
                          </div>
                      <div className="row">
                        <TextRow 
                          label="School/University" 
                          value={edu.school} 
                          onChange={(v) => updateEducation(i, 'school', v)} 
                          placeholder="e.g., MIT"
                        />
                        <TextRow 
                          label="Degree" 
                          value={edu.degree ?? ''} 
                          onChange={(v) => updateEducation(i, 'degree', v)} 
                          placeholder="e.g., Bachelor's, Master's"
                        />
                      </div>
                      <div className="row">
                        <TextRow 
                          label="Field of Study" 
                          value={edu.fieldOfStudy ?? ''} 
                          onChange={(v) => updateEducation(i, 'fieldOfStudy', v)} 
                          placeholder="e.g., Computer Science"
                        />
                        <TextRow 
                          label="Grade/GPA" 
                          value={edu.grade ?? ''} 
                          onChange={(v) => updateEducation(i, 'grade', v)} 
                          placeholder="e.g., 3.8/4.0"
                        />
                      </div>
                      <div className="row">
                        <label className="col" style={{ flex: 1 }}>
                          <span className="label">Start Date</span>
                          <input 
                            type="month" 
                            className="date-input" 
                            value={edu.startDate ?? ''} 
                            onChange={(e) => updateEducation(i, 'startDate', e.target.value)} 
                          />
                        </label>
                        <label className="col" style={{ flex: 1 }}>
                          <span className="label">End Date (or Expected)</span>
                          <input 
                            type="month" 
                            className="date-input" 
                            value={edu.endDate ?? ''} 
                            onChange={(e) => updateEducation(i, 'endDate', e.target.value)} 
                          />
                        </label>
                      </div>
                    </div>
                  ))
                )}
                  </>
                )}

                <div className="divider" />

                <SectionHeader 
                  title="Projects" 
                  actions={
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="secondary" onClick={addProject}>
                        + Add Project
                      </Button>
                      <Button variant="ghost" onClick={() => toggleSection('projects')}>
                        {collapsedSections.projects ? '📂 Expand' : '📁 Collapse'}
                      </Button>
                    </div>
                  } 
                />
                {!collapsedSections.projects && (
                  <>
                {(profile?.projects ?? []).length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">🔨</div>
                    <p className="empty-state-title">No projects added</p>
                    <p className="empty-state-text">Showcase your work and side projects</p>
                  </div>
                ) : (
                  (profile?.projects ?? []).map((proj, i) => (
                    <div key={i} className="card">
                      <div className="row" style={{ marginBottom: 12, justifyContent: 'space-between' }}>
                        <h4 style={{ margin: 0, color: '#1e293b' }}>Project #{i + 1}</h4>
                        <Button variant="danger" onClick={() => removeProject(i)}>
                          🗑️ Remove
                        </Button>
                      </div>
                      <TextRow 
                        label="Project Name" 
                        value={proj.name} 
                        onChange={(v) => updateProject(i, 'name', v)} 
                        placeholder="e.g., E-commerce Platform"
                      />
                      <div className="col">
                        <span className="label">Description</span>
                        <textarea 
                          className="textarea" 
                          value={proj.description ?? ''} 
                          onChange={(e) => updateProject(i, 'description', e.target.value)} 
                          placeholder="Describe the project, your role, and key achievements..."
                        />
                      </div>
                    </div>
                  ))
                )}
                  </>
                )}

                <div className="divider" />

                <SectionHeader 
                  title="Licenses & Certifications" 
                  actions={
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="secondary" onClick={addLicense}>
                        + Add Certification
                      </Button>
                      <Button variant="ghost" onClick={() => toggleSection('certifications')}>
                        {collapsedSections.certifications ? '📂 Expand' : '📁 Collapse'}
                      </Button>
                    </div>
                  } 
                />
                {!collapsedSections.certifications && (
                  <>
                {(profile?.licenses ?? []).length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📜</div>
                    <p className="empty-state-title">No certifications added</p>
                    <p className="empty-state-text">Add professional certifications and licenses</p>
                  </div>
                ) : (
                  (profile?.licenses ?? []).map((lic, i) => (
                    <div key={i} className="card">
                      <div className="row" style={{ marginBottom: 12, justifyContent: 'space-between' }}>
                        <h4 style={{ margin: 0, color: '#1e293b' }}>Certification #{i + 1}</h4>
                        <Button variant="danger" onClick={() => removeLicense(i)}>
                          🗑️ Remove
                        </Button>
                      </div>
                      <div className="row">
                        <TextRow 
                          label="Name" 
                          value={lic.name} 
                          onChange={(v) => updateLicense(i, 'name', v)} 
                          placeholder="e.g., AWS Certified Solutions Architect"
                        />
                        <TextRow 
                          label="Issuing Organization" 
                          value={lic.organization ?? ''} 
                          onChange={(v) => updateLicense(i, 'organization', v)} 
                          placeholder="e.g., Amazon Web Services"
                        />
                      </div>
                      <div className="row">
                        <TextRow 
                          label="Credential ID" 
                          value={lic.credentialId ?? ''} 
                          onChange={(v) => updateLicense(i, 'credentialId', v)} 
                          placeholder="Optional"
                        />
                        <TextRow 
                          label="Credential URL" 
                          value={lic.credentialUrl ?? ''} 
                          onChange={(v) => updateLicense(i, 'credentialUrl', v)} 
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  ))
                )}
                  </>
                )}

                {optimizations.length > 0 && (
                  <>
                    <div className="divider" />
                    <SectionHeader title="Applied Optimizations" />
                    <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
                      {optimizations.map((o) => (
                        <Pill key={o.id} text={`${o.kind} in ${o.section}`} onRemove={() => handleRemoveOptimization(o.id)} />
                      ))}
                    </div>
                  </>
                )}

                <div className="row" style={{ justifyContent: 'flex-end', marginTop: 24, gap: 12 }}>
                  <Button variant="primary" onClick={handleGenerateResume} disabled={isGenerating || !profile || !job.pastedText}>
                    {isGenerating ? '⏳ Generating...' : '🚀 Generate ATS Resume'}
                  </Button>
                </div>
              </div>
            )}
              </div>
              
              {/* Right Side - Live CV Preview */}
              {showPreview && profile && (
                <div style={{ 
                  flex: '0 0 50%', 
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#f8fafc'
                }}>
                  {/* Export Toolbar */}
                  <div style={{
                    padding: '16px',
                    background: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    {/* CV Language Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>CV Language:</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => setCvLanguage('en')}
                          style={{
                            padding: '6px 12px',
                            background: cvLanguage === 'en' ? '#667eea' : 'white',
                            color: cvLanguage === 'en' ? 'white' : '#64748b',
                            border: `1px solid ${cvLanguage === 'en' ? '#667eea' : '#cbd5e1'}`,
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <span>🇬🇧</span>
                          <span>EN</span>
                        </button>
                        <button
                          onClick={() => setCvLanguage('tr')}
                          style={{
                            padding: '6px 12px',
                            background: cvLanguage === 'tr' ? '#667eea' : 'white',
                            color: cvLanguage === 'tr' ? 'white' : '#64748b',
                            border: `1px solid ${cvLanguage === 'tr' ? '#667eea' : '#cbd5e1'}`,
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <span>🇹🇷</span>
                          <span>TR</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Export Buttons */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Button 
                        variant="primary" 
                        onClick={handleExportToPDF}
                        disabled={isExporting}
                        style={{ fontSize: 13 }}
                      >
                        {isExporting ? '⏳ Exporting...' : '📄 Export as PDF'}
                      </Button>
                      <Button 
                        variant={isGoogleDocsConnected ? "primary" : "secondary"} 
                        onClick={handleExportToGoogleDocs}
                        disabled={isExportingToDocs}
                        style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        {isExportingToDocs ? '⏳ Exporting...' : (
                          <>
                            <span>📄</span>
                            <span>Export to Google Docs</span>
                            {!isGoogleDocsConnected && <span style={{ fontSize: 10, opacity: 0.8 }}>🔒</span>}
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => setShowEmailComposer(true)}
                        style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <span>📧</span>
                        <span>Send via Email</span>
                      </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleExportToImage('png')}
                      disabled={isExporting}
                      style={{ fontSize: 13 }}
                    >
                      🖼️ Export as PNG
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={handlePrint}
                      style={{ fontSize: 13 }}
                    >
                      🖨️ Print
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowTemplateGallery(true)}
                      style={{ fontSize: 13 }}
                    >
                      🎨 Change Template
                    </Button>
                  </div>
                  </div>

                  {/* Preview */}
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    <CVPreview 
                      profile={profile} 
                      template={cvTemplate}
                      customColors={customColors}
                      customFonts={customFonts}
                      language={cvLanguage}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: 32, maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
            {active === 'job' && (
              <div className="col" style={{ gap: 16 }}>
                <SectionHeader title="Job Description" />
                <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
                  Paste the full job description here. The AI will analyze it to optimize your resume and match keywords.
                </p>
                <textarea 
                  className="textarea" 
                  style={{ minHeight: 300 }}
                  value={job.pastedText} 
                  onChange={(e) => setJob({ ...job, pastedText: e.target.value })} 
                  placeholder="Paste the complete job listing here... Include the job title, requirements, responsibilities, and company information."
                />
                <div className="row">
                  <TextRow 
                    label="Job Title (Optional)" 
                    value={job.title ?? ''} 
                    onChange={(v) => setJob({ ...job, title: v })} 
                    placeholder="e.g., Senior Software Engineer"
                  />
                  <TextRow 
                    label="Company (Optional)" 
                    value={job.company ?? ''} 
                    onChange={(v) => setJob({ ...job, company: v })} 
                    placeholder="e.g., Google"
                  />
                </div>
                <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
                  <Button variant="secondary" onClick={() => saveJobPost(job)}>
                    💾 Save Job
                  </Button>
                  <Button variant="primary" onClick={handleGenerateResume} disabled={isGenerating || !profile || !job.pastedText}>
                    {isGenerating ? '⏳ Generating...' : '🚀 Generate ATS Resume'}
                  </Button>
                </div>

                <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #e5e7eb' }}>
                  <SectionHeader title="Cover Letter Extra Instructions" />
                  <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: 14 }}>
                    Add any specific points you'd like to emphasize in your cover letter (optional).
                  </p>
                  <textarea 
                    className="textarea" 
                    style={{ minHeight: 150 }}
                    value={extraPrompt} 
                    onChange={(e) => setExtraPrompt(e.target.value)} 
                    placeholder="Example: Emphasize my remote work experience and leadership skills. Mention my passion for sustainable technology..."
                  />
                  <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
                    <Button variant="primary" onClick={handleGenerateCoverLetter} disabled={isGenerating || !profile || !job.pastedText}>
                      {isGenerating ? '⏳ Generating...' : '✉️ Generate Cover Letter'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {active === 'preview' && (
              <div className="col">
                <SectionHeader title="Resume Preview" />
                {resumeMd ? (
                  <>
                    <div className="preview" id="resume-preview" style={{ maxWidth: '100%', minHeight: 400 }}>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{resumeMd}</pre>
                    </div>
                    <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
                      <Button variant="secondary" onClick={() => navigator.clipboard.writeText(resumeMd).then(() => alert('Copied to clipboard!'))}>
                        📋 Copy to Clipboard
                      </Button>
                      <Button variant="primary" onClick={() => setActive('downloads')}>
                        ⬇️ Go to Downloads
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">📄</div>
                    <p className="empty-state-title">No resume generated yet</p>
                    <p className="empty-state-text">Fill in your profile and job description, then click "Generate ATS Resume"</p>
                  </div>
                )}
              </div>
            )}

            {active === 'cover' && (
              <div className="col">
                <SectionHeader 
                  title="Cover Letter" 
                  actions={
                    <div style={{ display: 'flex', gap: 8 }}>
                      {profile && job.pastedText && (
                        <Button 
                          variant="primary" 
                          onClick={() => setShowCoverLetterBuilder(true)}
                          style={{ fontSize: 13 }}
                        >
                          ✨ Use Template
                        </Button>
                      )}
                    </div>
                  }
                />

                {/* Template Builder Banner */}
                {profile && job.pastedText && !coverMd && (
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '24px 28px',
                    borderRadius: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontSize: 48 }}>✉️</span>
                      <div>
                        <div style={{ color: 'white', fontWeight: 600, fontSize: 18, marginBottom: 4 }}>
                          Create Your Perfect Cover Letter
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                          Choose from 8 professional templates tailored to your role
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="secondary"
                      onClick={() => setShowCoverLetterBuilder(true)}
                      style={{ background: 'white', color: '#667eea', border: 'none', fontWeight: 600, fontSize: 14, padding: '12px 24px' }}
                    >
                      Get Started →
                    </Button>
                  </div>
                )}

                {coverMd ? (
                  <>
                    <div className="preview" id="cover-preview" style={{ maxWidth: '100%', minHeight: 400 }}>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Georgia, serif', margin: 0, lineHeight: 1.8 }}>{coverMd}</pre>
                    </div>
                    <div className="row" style={{ justifyContent: 'space-between', marginTop: 16, gap: 12 }}>
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowCoverLetterBuilder(true)}
                        style={{ fontSize: 13 }}
                      >
                        🔄 Change Template
                      </Button>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <Button variant="secondary" onClick={() => navigator.clipboard.writeText(coverMd).then(() => alert('Copied to clipboard!'))}>
                          📋 Copy to Clipboard
                        </Button>
                        <Button variant="primary" onClick={() => setActive('downloads')}>
                          ⬇️ Go to Downloads
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">✉️</div>
                    <p className="empty-state-title">No cover letter generated yet</p>
                    <p className="empty-state-text">
                      {!profile || !job.pastedText 
                        ? 'Complete your CV profile and add a job description first'
                        : 'Click "Use Template" to create your cover letter'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {active === 'downloads' && (
              <div className="col" style={{ gap: 20 }}>
                <SectionHeader title="Download Your Documents" />
                
                {/* Professional CV Export */}
                <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none' }}>
                  <h4 style={{ margin: '0 0 8px', color: 'white' }}>🎨 Professional CV (Formatted)</h4>
                  <p style={{ margin: '0 0 16px', fontSize: 13, opacity: 0.9 }}>
                    Export your beautifully formatted CV in PDF or image format
                  </p>
                  <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
                    <Button 
                      variant="primary" 
                      onClick={handleExportToPDF}
                      disabled={isExporting || !profile}
                      style={{ background: 'white', color: '#667eea', border: 'none' }}
                    >
                      {isExporting ? '⏳ Exporting...' : '📄 Export as PDF'}
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleExportToImage('png')}
                      disabled={isExporting || !profile}
                      style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
                    >
                      🖼️ Export as PNG
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={handlePrint}
                      disabled={isExporting || !profile}
                      style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
                    >
                      🖨️ Print
                    </Button>
                  </div>
                  {!profile?.personal.firstName && (
                    <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
                      ℹ️ Complete your profile first to export formatted CV
                    </div>
                  )}
                </div>

                <div className="card">
                  <h4 style={{ margin: '0 0 12px', color: '#1e293b' }}>📄 ATS-Optimized Resume (Text)</h4>
                  <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>
                    Plain text format optimized for Applicant Tracking Systems
                  </p>
                  <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
                    <Button variant="primary" onClick={() => downloadText(`${sanitizeFileBase()}.md`, 'text/markdown', resumeMd)} disabled={!resumeMd}>
                      📄 Download as Markdown
                    </Button>
                    <Button variant="secondary" onClick={() => downloadText(`${sanitizeFileBase()}.txt`, 'text/plain', resumeMd)} disabled={!resumeMd}>
                      📝 Download as Text
                    </Button>
                    <Button variant="secondary" onClick={() => navigator.clipboard.writeText(resumeMd).then(() => alert('Copied!'))} disabled={!resumeMd}>
                      📋 Copy Text
                    </Button>
                  </div>
                  {!resumeMd && (
                    <div style={{ marginTop: 12, fontSize: 12, color: '#64748b' }}>
                      ℹ️ Generate ATS resume first from the Job tab
                    </div>
                  )}
                </div>

                <div className="card">
                  <h4 style={{ margin: '0 0 12px', color: '#1e293b' }}>✉️ Cover Letter</h4>
                  <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>
                    Your personalized cover letter
                  </p>
                  <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
                    <Button variant="primary" onClick={() => downloadText(`${sanitizeFileBase()}_cover.md`, 'text/markdown', coverMd)} disabled={!coverMd}>
                      📄 Download as Markdown
                    </Button>
                    <Button variant="secondary" onClick={() => downloadText(`${sanitizeFileBase()}_cover.txt`, 'text/plain', coverMd)} disabled={!coverMd}>
                      📝 Download as Text
                    </Button>
                    <Button variant="secondary" onClick={() => navigator.clipboard.writeText(coverMd).then(() => alert('Copied!'))} disabled={!coverMd}>
                      📋 Copy Text
                    </Button>
                  </div>
                  {!coverMd && (
                    <div style={{ marginTop: 12, fontSize: 12, color: '#64748b' }}>
                      ℹ️ Generate cover letter first from the Job tab
                    </div>
                  )}
                </div>

                <div style={{ background: '#eef2ff', padding: 24, borderRadius: 12, border: '1px solid #c7d2fe' }}>
                  <h4 style={{ margin: '0 0 8px', color: '#1e293b' }}>💡 Pro Tips</h4>
                  <ul style={{ margin: '8px 0', paddingLeft: 20, color: '#475569', fontSize: 14 }}>
                    <li>Use <span className="kbd">Ctrl+P</span> (or <span className="kbd">Cmd+P</span> on Mac) to print as PDF</li>
                    <li>Open the markdown file in Google Docs or Microsoft Word for formatting</li>
                    <li>Always proofread before submitting - AI can make mistakes!</li>
                  </ul>
                </div>
              </div>
            )}

            {active === 'tracker' && (
              <JobTracker />
            )}

            {active === 'settings' && (
              <div className="col" style={{ gap: 20 }}>
                {/* Language Settings */}
                <div>
                  <SectionHeader title={t('settings.language', currentLang) + ' / Language'} />
                  <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: 14 }}>
                    {t('settings.languageDescription', currentLang)}
                  </p>
                  
                  <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                      <span style={{ fontSize: 40 }}>🌍</span>
                      <div>
                        <div style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
                          Interface Language / Arayüz Dili
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
                          Choose your preferred language / Tercih ettiğiniz dili seçin
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <button
                        onClick={async () => {
                          await setLanguage('en');
                          setCurrentLang('en');
                          window.location.reload();
                        }}
                        style={{
                          padding: 20,
                          background: currentLang === 'en' ? 'white' : 'rgba(255,255,255,0.2)',
                          color: currentLang === 'en' ? '#667eea' : 'white',
                          border: '2px solid ' + (currentLang === 'en' ? 'white' : 'rgba(255,255,255,0.3)'),
                          borderRadius: 12,
                          cursor: 'pointer',
                          fontSize: 16,
                          fontWeight: 600,
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontSize: 32, marginBottom: 8 }}>🇬🇧</div>
                        <div>English</div>
                        {currentLang === 'en' && <div style={{ fontSize: 12, marginTop: 4 }}>✓ Active</div>}
                      </button>
                      
                      <button
                        onClick={async () => {
                          await setLanguage('tr');
                          setCurrentLang('tr');
                          window.location.reload();
                        }}
                        style={{
                          padding: 20,
                          background: currentLang === 'tr' ? 'white' : 'rgba(255,255,255,0.2)',
                          color: currentLang === 'tr' ? '#667eea' : 'white',
                          border: '2px solid ' + (currentLang === 'tr' ? 'white' : 'rgba(255,255,255,0.3)'),
                          borderRadius: 12,
                          cursor: 'pointer',
                          fontSize: 16,
                          fontWeight: 600,
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontSize: 32, marginBottom: 8 }}>🇹🇷</div>
                        <div>Türkçe</div>
                        {currentLang === 'tr' && <div style={{ fontSize: 12, marginTop: 4 }}>✓ Aktif</div>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* API Settings */}
                <div style={{ marginTop: 32 }}>
                  <SectionHeader title={t('settings.apiSettings', currentLang)} />
                  <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: 14 }}>
                    Configure your AI provider and API key to enable resume and cover letter generation.
                  </p>

                  <div className="card">
                    <label className="col">
                      <span className="label">{t('settings.aiProvider', currentLang)}</span>
                      <select value={apiProvider} onChange={(e) => setApiProvider(e.target.value as any)}>
                        <option value="openai">OpenAI (GPT-4)</option>
                        <option value="gemini">Google Gemini</option>
                        <option value="claude">Anthropic Claude</option>
                        <option value="azure">Azure OpenAI</option>
                      </select>
                    </label>

                    <label className="col" style={{ marginTop: 16 }}>
                      <span className="label">{t('settings.apiKey', currentLang)}</span>
                      <input 
                        type="password" 
                        className="text-input" 
                        value={apiKey} 
                        onChange={(e) => setApiKey(e.target.value)} 
                        placeholder="Enter your API key..."
                      />
                    </label>

                    <label className="col" style={{ marginTop: 16 }}>
                      <span className="label">Default Language (for AI generation)</span>
                      <select value={language} onChange={(e) => setLanguage(e.target.value as 'tr' | 'en')}>
                        <option value="en">English</option>
                        <option value="tr">Türkçe</option>
                      </select>
                    </label>

                    <Button variant="primary" onClick={saveSettings} style={{ marginTop: 16 }}>
                      💾 {t('settings.saveSettings', currentLang)}
                    </Button>
                  </div>
                </div>

                <div style={{ background: '#fef3c7', padding: 20, borderRadius: 12, border: '1px solid #fbbf24' }}>
                  <h4 style={{ margin: '0 0 8px', color: '#92400e' }}>⚠️ Important</h4>
                  <p style={{ margin: 0, color: '#92400e', fontSize: 14 }}>
                    Your API key is stored locally in your browser and never sent anywhere except directly to your chosen AI provider. 
                    Get API keys from:
                  </p>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 20, color: '#92400e', fontSize: 14 }}>
                    <li>OpenAI: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com</a></li>
                    <li>Google Gemini: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">makersuite.google.com</a></li>
                    <li>Anthropic Claude: <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">console.anthropic.com</a></li>
                  </ul>
                </div>
              </div>
            )}
            </div>
          )}
        </div>
        
        {/* Template Gallery Modal */}
        {showTemplateGallery && (
          <TemplateGallery
            currentTemplate={cvTemplate}
            onSelectTemplate={(template) => {
              setCvTemplate(template);
              saveTemplatePreferences(template);
            }}
            onCustomize={(colors, fonts) => {
              setCustomColors(colors);
              setCustomFonts(fonts);
              saveTemplatePreferences(cvTemplate, colors, fonts);
            }}
            onClose={() => setShowTemplateGallery(false)}
          />
        )}

        {/* LinkedIn Import Modal */}
        {showLinkedInImport && (
          <LinkedInImport
            onImport={handleLinkedInImport}
            onClose={() => setShowLinkedInImport(false)}
          />
        )}

        {/* Profile Manager Modal */}
        {showProfileManager && profile && (
          <ProfileManager
            currentProfile={profile}
            onSelectProfile={handleProfileSwitch}
            onClose={() => setShowProfileManager(false)}
          />
        )}

        {/* Description Enhancer Modal */}
        {enhancerState?.show && (
          <DescriptionEnhancer
            description={enhancerState.description}
            context={enhancerState.context}
            onApply={(enhanced) => {
              enhancerState.onApply(enhanced);
              setEnhancerState(null);
            }}
            onClose={() => setEnhancerState(null)}
          />
        )}

        {/* Cover Letter Builder Modal */}
        {showCoverLetterBuilder && profile && (
          <CoverLetterBuilder
            profile={profile}
            job={job}
            language={currentLang}
            onGenerate={(coverLetter) => {
              setCoverMd(coverLetter);
              saveGeneratedCoverLetter(coverLetter);
            }}
            onClose={() => setShowCoverLetterBuilder(false)}
          />
        )}

        {/* Email Composer Modal */}
        {showEmailComposer && profile && (
          <EmailComposer
            profile={profile}
            job={job}
            language={currentLang}
            cvElementId="cv-preview-content"
            onClose={() => setShowEmailComposer(false)}
          />
        )}

        {/* Footer */}
        <div style={{ marginTop: 24, padding: '16px 0', textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
          {profile?.personal.firstName && (
            <div style={{ marginBottom: 8 }}>
              <strong>{profile.personal.firstName} {profile.personal.lastName}</strong>
            </div>
          )}
          <div className="row" style={{ justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            {profile?.personal.email && <span>📧 {profile.personal.email}</span>}
            {linkedInUrl && <span>💼 LinkedIn</span>}
            {githubUrl && <span>💻 GitHub</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
