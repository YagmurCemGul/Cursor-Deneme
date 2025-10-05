import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { CVData, ATSOptimization, CVProfile } from './types';
import { CVUpload } from './components/CVUpload';
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { PersonalInfoForm } from './components/PersonalInfoForm';
import { SkillsForm } from './components/SkillsForm';
import { ExperienceForm } from './components/ExperienceForm';
import { EducationForm } from './components/EducationForm';
import { CertificationsForm } from './components/CertificationsForm';
import { ProjectsForm } from './components/ProjectsForm';
import { CustomQuestionsForm } from './components/CustomQuestionsForm';
import { ATSOptimizations } from './components/ATSOptimizations';
import { CVPreview } from './components/CVPreview';
import { CoverLetter } from './components/CoverLetter';
import { ProfileManager } from './components/ProfileManager';
import { AISettings } from './components/AISettings';
import { SetupWizard } from './components/SetupWizard';
import { GoogleDriveSettings } from './components/GoogleDriveSettings';
import { AutoSyncSettings } from './components/AutoSyncSettings';
import { BatchExport } from './components/BatchExport';
import { JobDescriptionLibrary } from './components/JobDescriptionLibrary';
import { EnhancedJobDescriptionEditor } from './components/EnhancedJobDescriptionEditor';
import { InterviewQuestionsGenerator } from './components/InterviewQuestionsGenerator';
import { TalentGapAnalysis } from './components/TalentGapAnalysis';
import { JobApplicationTracker } from './components/JobApplicationTracker';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { EnhancedAnalyticsDashboard } from './components/EnhancedAnalyticsDashboard';
import { ErrorMonitoringDashboard } from './components/ErrorMonitoringDashboard';
import { ProviderHealthDashboard } from './components/ProviderHealthDashboard';
import { EnhancedTemplateManager } from './components/EnhancedTemplateManager';
import { PhotoComparisonView } from './components/PhotoComparisonView';
import { BatchPhotoOperations } from './components/BatchPhotoOperations';
import { CloudPhotoSync } from './components/CloudPhotoSync';
import { ATSScoreCard } from './components/ATSScoreCard';
import { AdvancedCoverLetterSettings } from './components/AdvancedCoverLetterSettings';
import { CoverLetterVersions } from './components/CoverLetterVersions';
import { InteractiveGuide } from './components/InteractiveGuide';
import { VideoTutorial } from './components/VideoTutorial';
import { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp';
import { LinkedInImporter } from './components/LinkedInImporter';
import { ShareDialog } from './components/ShareDialog';
import { ErrorBoundary } from './components/ErrorBoundary';
import { aiService } from './utils/aiService';
import { StorageService } from './utils/storage';
import { AIApiKeys } from './types/storage';
import { AIProvider } from './utils/aiProviders';
import { t } from './i18n';
import './styles.css';

type TabType = 'cv-info' | 'optimize' | 'cover-letter' | 'profiles' | 'settings' | 'analytics' | 'tools' | 'help';
type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'tr';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('cv-info');
  const [jobDescription, setJobDescription] = useState('');
  const [cvData, setCVData] = useState<CVData>({
    personalInfo: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      linkedInUsername: '',
      portfolioUrl: '',
      githubUsername: '',
      whatsappLink: '',
      phoneNumber: '',
      countryCode: '',
      summary: ''
    },
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    projects: [],
    customQuestions: []
  });
  const [optimizations, setOptimizations] = useState<ATSOptimization[]>([]);
  const [coverLetter, setCoverLetter] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('en');
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const [focusedOptimizationId, setFocusedOptimizationId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('classic');
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState<string>('');

  const refreshAIProviderConfig = useCallback(async (
    overrides: {
      provider?: AIProvider;
      apiKeys?: AIApiKeys;
      model?: string | undefined;
      temperature?: number | null | undefined;
      legacyKey?: string | null;
      language?: Language;
    } = {}
  ) => {
    try {
      const provider = overrides.provider ?? (await StorageService.getAIProvider());
      const apiKeys = overrides.apiKeys ?? (await StorageService.getAPIKeys());
      const model = overrides.model ?? (await StorageService.getAIModel());

      const hasTemperatureOverride = Object.prototype.hasOwnProperty.call(overrides, 'temperature');
      let temperature = overrides.temperature;
      if (!hasTemperatureOverride) {
        const settingsWithTemp = await StorageService.getSettings<{ aiTemperature?: number }>();
        temperature = settingsWithTemp?.aiTemperature;
      }

      const hasLegacyKeyOverride = Object.prototype.hasOwnProperty.call(overrides, 'legacyKey');
      const legacyKey = hasLegacyKeyOverride ? overrides.legacyKey ?? null : await StorageService.getAPIKey();

      const providerApiKey = apiKeys?.[provider] ?? null;
      const apiKey = providerApiKey ?? (provider === 'openai' ? legacyKey : null);

      if (!apiKey) {
        aiService.clearConfig();
        return;
      }

      aiService.updateConfig({
        provider,
        apiKey,
        model: model || undefined,
        temperature: typeof temperature === 'number' ? temperature : undefined,
      });
    } catch (error) {
      console.error('Failed to refresh AI provider config:', error);
      const messageLanguage = overrides.language ?? language;
      alert(t(messageLanguage, 'settings.configError'));
      throw error;
    }
  }, [language]);

  const loadInitial = async () => {
    type StoredSettings = {
      theme?: Theme;
      language?: Language;
      templateId?: string;
      hasCompletedSetup?: boolean;
      aiTemperature?: number;
    };

    const [provider, apiKeys, savedModel, settings, legacyKey] = await Promise.all<[
      AIProvider,
      AIApiKeys,
      string | undefined,
      StoredSettings | null,
      string | null
    ]>([
      StorageService.getAIProvider(),
      StorageService.getAPIKeys(),
      StorageService.getAIModel(),
      StorageService.getSettings<StoredSettings>(),
      StorageService.getAPIKey()
    ]);

    const providerApiKey = apiKeys?.[provider] || '';
    const currentApiKey = providerApiKey || (provider === 'openai' ? legacyKey || '' : '');

    if (settings?.theme) setTheme(settings.theme);
    if (settings?.language) setLanguage(settings.language);
    if (settings?.templateId) setSelectedTemplateId(settings.templateId);

    if (!settings?.hasCompletedSetup && !currentApiKey) {
      setShowSetupWizard(true);
      setActiveTab('help');
      setActiveSubSection('wizard');
    }

    const draft = await StorageService.getDraft<{
      activeTab: TabType;
      jobDescription: string;
      cvData: CVData;
      optimizations: ATSOptimization[];
      coverLetter: string;
      profileName: string;
    }>();
    if (draft) {
      setActiveTab(draft.activeTab || 'cv-info');
      setJobDescription(draft.jobDescription || '');
      setCVData(draft.cvData || cvData);
      setOptimizations(draft.optimizations || []);
      setCoverLetter(draft.coverLetter || '');
      setProfileName(draft.profileName || '');
    }

    await refreshAIProviderConfig({
      provider,
      apiKeys,
      model: savedModel,
      temperature: settings?.aiTemperature,
      legacyKey,
      language: settings?.language
    });
  };

  useEffect(() => {
    loadInitial().catch(error => {
      console.error('Failed to load initial data:', error);
    });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const update = (e?: MediaQueryListEvent) => {
      const prefersDark = e ? e.matches : mq.matches;
      setSystemPrefersDark(prefersDark);
    };
    update();
    
    // Use modern addEventListener if available, fallback to addListener
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
    } else if (mq.addListener) {
      mq.addListener(update);
    }
    
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', update);
      } else if (mq.removeListener) {
        mq.removeListener(update);
      }
    };
  }, []);

  // Autosave draft when critical state changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      StorageService.saveDraft({ activeTab, jobDescription, cvData, optimizations, coverLetter, profileName });
    }, 400);
    return () => clearTimeout(timeout);
  }, [activeTab, jobDescription, cvData, optimizations, coverLetter, profileName]);

  // Persist settings
  useEffect(() => {
    const timeout = setTimeout(() => {
      StorageService.saveSettings({ theme, language, templateId: selectedTemplateId });
    }, 200);
    return () => clearTimeout(timeout);
  }, [theme, language, selectedTemplateId]);

  const handleCVParsed = (parsedData: Partial<CVData>) => {
    setCVData(prev => ({
      ...prev,
      ...parsedData,
      personalInfo: {
        ...prev.personalInfo,
        ...parsedData.personalInfo
      }
    }));
  };

  const handleOptimizeCV = async () => {
    if (!jobDescription.trim()) {
      alert(t(language, 'cover.needJobDesc'));
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await aiService.optimizeCV(cvData, jobDescription);
      setCVData(result.optimizedCV);
      setOptimizations(result.optimizations);
      setActiveTab('optimize');
    } catch (error) {
      console.error('Error optimizing CV:', error);
      alert(t(language, 'common.errorOptimizing'));
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGenerateCoverLetter = async (extraPrompt: string) => {
    if (!jobDescription.trim()) {
      alert(t(language, 'cover.needJobDesc'));
      return;
    }

    setIsGeneratingCoverLetter(true);
    try {
      const letter = await aiService.generateCoverLetter(cvData, jobDescription, extraPrompt);
      setCoverLetter(letter);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      alert(t(language, 'cover.errorGenerating'));
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const handleSaveProfile = async (name: string) => {
    const profile: CVProfile = {
      id: Date.now().toString(),
      name,
      data: cvData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await StorageService.saveProfile(profile);
    setProfileName(name);
    alert(t(language, 'profile.saveSuccess'));
  };

  const handleLoadProfile = (profile: CVProfile) => {
    setCVData(profile.data);
    setProfileName(profile.name);
    setActiveTab('cv-info');
    alert(t(language, 'profile.loadSuccess'));
  };

  const appliedTheme: Theme = theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme;

  return (
    <div className={`app-container ${appliedTheme}`} data-lang={language}>
      <div className="header">
        <h1>🤖 {t(language, 'app.title')}</h1>
        <p>{t(language, 'app.subtitle')}</p>
        <div className="settings-bar">
          <select className="form-select" value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
            <option value="en">🌐 English</option>
            <option value="tr">🌐 Türkçe</option>
          </select>
          <select className="form-select" value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
            <option value="light">☀️ Light</option>
            <option value="dark">🌙 Dark</option>
            <option value="system">💻 System</option>
          </select>
        </div>
      </div>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'cv-info' ? 'active' : ''}`}
          onClick={() => setActiveTab('cv-info')}
        >
          📝 {t(language, 'tabs.cvinfo')}
        </button>
        <button 
          className={`tab ${activeTab === 'optimize' ? 'active' : ''}`}
          onClick={() => setActiveTab('optimize')}
        >
          ✨ {t(language, 'tabs.optimize')}
        </button>
        <button 
          className={`tab ${activeTab === 'cover-letter' ? 'active' : ''}`}
          onClick={() => setActiveTab('cover-letter')}
        >
          ✉️ {t(language, 'tabs.cover')}
        </button>
        <button 
          className={`tab ${activeTab === 'profiles' ? 'active' : ''}`}
          onClick={() => setActiveTab('profiles')}
        >
          💾 {t(language, 'tabs.profiles')}
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ {t(language, 'tabs.settings')}
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 {t(language, 'tabs.analytics')}
        </button>
        <button 
          className={`tab ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          🛠️ {t(language, 'tabs.tools')}
        </button>
        <button 
          className={`tab ${activeTab === 'help' ? 'active' : ''}`}
          onClick={() => setActiveTab('help')}
        >
          ❓ {t(language, 'tabs.help')}
        </button>
      </div>
      
      <div className="content">
        {activeTab === 'cv-info' && (
          <>
            <CVUpload onCVParsed={handleCVParsed} language={language} />
            
            <JobDescriptionInput 
              value={jobDescription} 
              onChange={setJobDescription} 
              language={language}
            />
            
            <PersonalInfoForm 
              data={cvData.personalInfo}
              onChange={(personalInfo) => setCVData({ ...cvData, personalInfo })}
              language={language}
            />
            
            <SkillsForm 
              skills={cvData.skills}
              onChange={(skills) => setCVData({ ...cvData, skills })}
              language={language}
            />
            
            <ExperienceForm 
              experiences={cvData.experience}
              onChange={(experience) => setCVData({ ...cvData, experience })}
              language={language}
            />
            
            <EducationForm 
              education={cvData.education}
              onChange={(education) => setCVData({ ...cvData, education })}
              language={language}
            />
            
            <CertificationsForm 
              certifications={cvData.certifications}
              onChange={(certifications) => setCVData({ ...cvData, certifications })}
              language={language}
            />
            
            <ProjectsForm 
              projects={cvData.projects}
              onChange={(projects) => setCVData({ ...cvData, projects })}
              language={language}
            />
            
            <CustomQuestionsForm 
              questions={cvData.customQuestions}
              onChange={(customQuestions) => setCVData({ ...cvData, customQuestions })}
              language={language}
            />
            
            <div className="sticky-footer">
              <button 
                className="btn btn-primary" 
                onClick={handleOptimizeCV}
                disabled={isOptimizing}
                style={{ width: '100%', fontSize: '16px', padding: '15px' }}
              >
                {isOptimizing ? `⏳ ${t(language, 'opt.optimizing')}` : `✨ ${t(language, 'opt.optimizeBtn')}`}
              </button>
            </div>
          </>
        )}
        
        {activeTab === 'optimize' && (
          <>
            <ATSOptimizations 
              optimizations={optimizations}
              onChange={setOptimizations}
              language={language}
              onOptimizationFocus={setFocusedOptimizationId}
              focusedOptimizationId={focusedOptimizationId}
            />
            
            <CVPreview 
              cvData={cvData}
              optimizations={optimizations}
              language={language}
              focusedOptimizationId={focusedOptimizationId}
              templateId={selectedTemplateId}
            />
          </>
        )}
        
        {activeTab === 'cover-letter' && (
          <CoverLetter 
            cvData={cvData}
            jobDescription={jobDescription}
            coverLetter={coverLetter}
            onGenerate={handleGenerateCoverLetter}
            isGenerating={isGeneratingCoverLetter}
            language={language}
          />
        )}
        
        {activeTab === 'profiles' && (
          <ProfileManager 
            onLoadProfile={handleLoadProfile}
            onSaveProfile={handleSaveProfile}
            currentProfileName={profileName}
            onProfileNameChange={setProfileName}
            language={language}
            currentTemplateId={selectedTemplateId}
            onTemplateChange={setSelectedTemplateId}
          />
        )}
        
        {activeTab === 'settings' && (
          <div className="settings-container">
            <div className="section">
              <h2>⚙️ {t(language, 'tabs.settings')}</h2>
              
              <div className="sub-section-buttons">
                <button 
                  className={`sub-section-btn ${activeSubSection === 'ai' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'ai' ? '' : 'ai')}
                >
                  🤖 {t(language, 'subsection.aiSettings')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'drive' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'drive' ? '' : 'drive')}
                >
                  💾 {t(language, 'subsection.googleDrive')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'sync' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'sync' ? '' : 'sync')}
                >
                  🔄 {t(language, 'subsection.autoSync')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'export' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'export' ? '' : 'export')}
                >
                  📤 {t(language, 'subsection.export')}
                </button>
              </div>
              
              {activeSubSection === 'ai' && (
                <AISettings language={language} onConfigChange={refreshAIProviderConfig} />
              )}
              {activeSubSection === 'drive' && <GoogleDriveSettings language={language} />}
              {activeSubSection === 'sync' && <AutoSyncSettings language={language} />}
              {activeSubSection === 'export' && <BatchExport cvData={cvData} language={language} />}
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="analytics-container">
            <div className="section">
              <h2>📊 {t(language, 'tabs.analytics')}</h2>
              
              <div className="sub-section-buttons">
                <button 
                  className={`sub-section-btn ${activeSubSection === 'main' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'main' ? '' : 'main')}
                >
                  📈 {t(language, 'subsection.analytics')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'enhanced' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'enhanced' ? '' : 'enhanced')}
                >
                  📊 Enhanced Analytics
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'errors' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'errors' ? '' : 'errors')}
                >
                  🐛 {t(language, 'subsection.errorMonitoring')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'health' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'health' ? '' : 'health')}
                >
                  💚 {t(language, 'subsection.providerHealth')}
                </button>
              </div>
              
              {activeSubSection === 'main' && <AnalyticsDashboard language={language} />}
              {activeSubSection === 'enhanced' && <EnhancedAnalyticsDashboard language={language} />}
              {activeSubSection === 'errors' && <ErrorMonitoringDashboard language={language} />}
              {activeSubSection === 'health' && <ProviderHealthDashboard language={language} />}
            </div>
          </div>
        )}
        
        {activeTab === 'tools' && (
          <div className="tools-container">
            <div className="section">
              <h2>🛠️ {t(language, 'tabs.tools')}</h2>
              
              <div className="sub-section-buttons">
                <button 
                  className={`sub-section-btn ${activeSubSection === 'jobLibrary' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'jobLibrary' ? '' : 'jobLibrary')}
                >
                  📚 {t(language, 'subsection.jobLibrary')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'jobEditor' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'jobEditor' ? '' : 'jobEditor')}
                >
                  ✏️ {t(language, 'subsection.jobEditor')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'interview' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'interview' ? '' : 'interview')}
                >
                  💬 {t(language, 'subsection.interviewQuestions')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'talentGap' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'talentGap' ? '' : 'talentGap')}
                >
                  🎯 {t(language, 'subsection.talentGap')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'jobTracker' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'jobTracker' ? '' : 'jobTracker')}
                >
                  📋 {t(language, 'subsection.jobTracker')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'templates' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'templates' ? '' : 'templates')}
                >
                  📄 {t(language, 'subsection.templates')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'photoTools' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'photoTools' ? '' : 'photoTools')}
                >
                  📷 {t(language, 'subsection.photoTools')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'atsScore' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'atsScore' ? '' : 'atsScore')}
                >
                  🎯 {t(language, 'subsection.atsScore')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'coverSettings' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'coverSettings' ? '' : 'coverSettings')}
                >
                  ⚙️ {t(language, 'subsection.coverLetterSettings')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'coverVersions' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'coverVersions' ? '' : 'coverVersions')}
                >
                  📝 {t(language, 'subsection.coverLetterVersions')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'linkedinImport' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'linkedinImport' ? '' : 'linkedinImport')}
                >
                  💼 {t(language, 'subsection.linkedinImport')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'share' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'share' ? '' : 'share')}
                >
                  🔗 {t(language, 'subsection.share')}
                </button>
              </div>
              
              {activeSubSection === 'jobLibrary' && <JobDescriptionLibrary language={language} />}
              {activeSubSection === 'jobEditor' && <EnhancedJobDescriptionEditor language={language} />}
              {activeSubSection === 'interview' && <InterviewQuestionsGenerator cvData={cvData} jobDescription={jobDescription} language={language} />}
              {activeSubSection === 'talentGap' && <TalentGapAnalysis cvData={cvData} jobDescription={jobDescription} language={language} />}
              {activeSubSection === 'jobTracker' && <JobApplicationTracker language={language} />}
              {activeSubSection === 'templates' && <EnhancedTemplateManager language={language} />}
              {activeSubSection === 'photoTools' && (
                <div>
                  <PhotoComparisonView language={language} />
                  <BatchPhotoOperations language={language} />
                  <CloudPhotoSync language={language} />
                </div>
              )}
              {activeSubSection === 'atsScore' && <ATSScoreCard cvData={cvData} jobDescription={jobDescription} language={language} />}
              {activeSubSection === 'coverSettings' && <AdvancedCoverLetterSettings language={language} />}
              {activeSubSection === 'coverVersions' && <CoverLetterVersions language={language} />}
              {activeSubSection === 'linkedinImport' && <LinkedInImporter onImport={handleCVParsed} language={language} />}
              {activeSubSection === 'share' && (
                <div>
                  <button className="btn btn-primary" onClick={() => setShowShareDialog(true)}>
                    {t(language, 'subsection.share')}
                  </button>
                  {showShareDialog && <ShareDialog onClose={() => setShowShareDialog(false)} language={language} />}
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'help' && (
          <div className="help-container">
            <div className="section">
              <h2>❓ {t(language, 'tabs.help')}</h2>
              
              <div className="sub-section-buttons">
                <button 
                  className={`sub-section-btn ${activeSubSection === 'wizard' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'wizard' ? '' : 'wizard')}
                >
                  🧙 {t(language, 'subsection.setupWizard')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'guide' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'guide' ? '' : 'guide')}
                >
                  📖 {t(language, 'subsection.guide')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'video' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'video' ? '' : 'video')}
                >
                  🎬 {t(language, 'subsection.videoTutorial')}
                </button>
                <button 
                  className={`sub-section-btn ${activeSubSection === 'shortcuts' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection(activeSubSection === 'shortcuts' ? '' : 'shortcuts')}
                >
                  ⌨️ {t(language, 'subsection.shortcuts')}
                </button>
              </div>
              
              {activeSubSection === 'wizard' && <SetupWizard onComplete={() => setActiveSubSection('')} onCancel={() => setActiveSubSection('')} language={language} />}
              {activeSubSection === 'guide' && <InteractiveGuide language={language} />}
              {activeSubSection === 'video' && <VideoTutorial language={language} />}
              {activeSubSection === 'shortcuts' && <KeyboardShortcutsHelp language={language} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
