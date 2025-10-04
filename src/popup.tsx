import React, { useState, useEffect } from 'react';
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
import { GoogleDriveSettings } from './components/GoogleDriveSettings';
import { aiService } from './utils/aiService';
import { AIConfig } from './utils/aiProviders';
import { StorageService } from './utils/storage';
import { applyCVOptimizations } from './utils/cvOptimizer';
import { t } from './i18n';
import './styles.css';

type TabType = 'cv-info' | 'optimize' | 'cover-letter' | 'profiles' | 'settings';
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
  // Store the original CV data before optimizations are applied
  const [originalCVData, setOriginalCVData] = useState<CVData | null>(null);
  const [optimizations, setOptimizations] = useState<ATSOptimization[]>([]);
  const [coverLetter, setCoverLetter] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [, setApiKey] = useState('');
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('en');
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const [focusedOptimizationId, setFocusedOptimizationId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('classic');
  const [currentAIProvider, setCurrentAIProvider] = useState<'openai' | 'gemini' | 'claude'>('openai');

  useEffect(() => {
    loadInitial();
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

  const loadInitial = async () => {
    const key = await StorageService.getAPIKey();
    if (key) setApiKey(key);
    
    // Initialize AI service with saved configuration
    await initializeAIService();
    // Restore settings
    const settings = await StorageService.getSettings<{ theme?: Theme; language?: Language; templateId?: string }>();
    if (settings?.theme) setTheme(settings.theme);
    if (settings?.language) setLanguage(settings.language);
    if (settings?.templateId) setSelectedTemplateId(settings.templateId);
    // Restore draft
    const draft = await StorageService.getDraft<{
      activeTab: TabType;
      jobDescription: string;
      cvData: CVData;
      originalCVData?: CVData;
      optimizations: ATSOptimization[];
      coverLetter: string;
      profileName: string;
    }>();
    if (draft) {
      setActiveTab(draft.activeTab || 'cv-info');
      setJobDescription(draft.jobDescription || '');
      setCVData(draft.cvData || cvData);
      setOriginalCVData(draft.originalCVData || null);
      setOptimizations(draft.optimizations || []);
      setCoverLetter(draft.coverLetter || '');
      setProfileName(draft.profileName || '');
    }
  };

  // Autosave draft when critical state changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      StorageService.saveDraft({ activeTab, jobDescription, cvData, originalCVData, optimizations, coverLetter, profileName });
    }, 400);
    return () => clearTimeout(timeout);
  }, [activeTab, jobDescription, cvData, originalCVData, optimizations, coverLetter, profileName]);

  // Re-verify AI service configuration when switching to tabs that use AI
  useEffect(() => {
    if (activeTab === 'optimize' || activeTab === 'cover-letter') {
      // Ensure AI service is properly configured before use
      initializeAIService();
    }
  }, [activeTab]);

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
    // Clear optimizations when CV is re-uploaded
    setOptimizations([]);
    setOriginalCVData(null);
  };

  // Handler to update CV data and clear optimizations (when manually editing)
  const handleCVDataChange = (newCVData: CVData) => {
    setCVData(newCVData);
    // If there are optimizations active and user manually edits, clear them
    if (optimizations.length > 0) {
      setOptimizations([]);
      setOriginalCVData(null);
    }
  };

  const handleOptimizeCV = async () => {
    if (!jobDescription.trim()) {
      alert(t(language, 'cover.needJobDesc'));
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await aiService.optimizeCV(cvData, jobDescription);
      // Store the original CV data before any optimizations
      setOriginalCVData(JSON.parse(JSON.stringify(cvData)));
      // Set optimizations (all initially unapplied)
      setOptimizations(result.optimizations);
      setActiveTab('optimize');
    } catch (error: any) {
      console.error('Error optimizing CV:', error);
      
      // Show specific error message if available
      const errorMessage = error?.message || t(language, 'common.errorOptimizing');
      
      // Check if error is about missing API key
      if (errorMessage.toLowerCase().includes('api key')) {
        alert(
          t(language, 'common.errorOptimizing') + '\n\n' +
          t(language, 'cover.errorGoToSettings')
        );
      } else {
        alert(
          t(language, 'common.errorOptimizing') + '\n\n' +
          errorMessage
        );
      }
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handle optimization changes - apply optimizations to original CV data
  const handleOptimizationsChange = (newOptimizations: ATSOptimization[]) => {
    setOptimizations(newOptimizations);
    
    // Apply optimizations to the original CV data
    if (originalCVData) {
      const optimizedCV = applyCVOptimizations(originalCVData, newOptimizations);
      setCVData(optimizedCV);
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
    } catch (error: any) {
      console.error('Error generating cover letter:', error);
      
      // Show specific error message if available, otherwise show generic message
      const errorMessage = error?.message || t(language, 'cover.errorGenerating');
      
      // Check if error is about missing API key
      if (errorMessage.toLowerCase().includes('api key') || errorMessage.toLowerCase().includes('mock mode')) {
        alert(
          t(language, 'cover.errorNoApiKey') + '\n\n' +
          t(language, 'cover.errorGoToSettings')
        );
      } else if (errorMessage.toLowerCase().includes('rate limit')) {
        alert(t(language, 'cover.errorRateLimit'));
      } else if (errorMessage.toLowerCase().includes('network')) {
        alert(t(language, 'cover.errorNetwork'));
      } else {
        // Show the specific error message from the API
        alert(
          t(language, 'cover.errorGenerating') + '\n\n' +
          t(language, 'cover.errorDetails') + ': ' + errorMessage
        );
      }
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const initializeAIService = async () => {
    try {
      const [provider, apiKeys, model, settings] = await Promise.all([
        StorageService.getAIProvider(),
        StorageService.getAPIKeys(),
        StorageService.getAIModel(),
        StorageService.getSettings()
      ]);

      // Update current provider state for UI display
      setCurrentAIProvider(provider);

      const apiKey = apiKeys[provider];
      if (apiKey) {
        const config: AIConfig = {
          provider,
          apiKey,
          temperature: (settings as any)?.aiTemperature || 0.3
        };
        if (model) {
          config.model = model;
        }
        aiService.updateConfig(config);
      }
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
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
    // Clear optimizations when loading a new profile
    setOptimizations([]);
    setOriginalCVData(null);
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
          <div style={{ 
            fontSize: '12px', 
            padding: '6px 12px', 
            borderRadius: '6px', 
            backgroundColor: appliedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap'
          }}>
            🤖 {currentAIProvider === 'openai' ? 'ChatGPT' : currentAIProvider === 'gemini' ? 'Gemini' : 'Claude'}
          </div>
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
              onChange={(personalInfo) => handleCVDataChange({ ...cvData, personalInfo })}
              language={language}
            />
            
            <SkillsForm 
              skills={cvData.skills}
              onChange={(skills) => handleCVDataChange({ ...cvData, skills })}
              language={language}
            />
            
            <ExperienceForm 
              experiences={cvData.experience}
              onChange={(experience) => handleCVDataChange({ ...cvData, experience })}
              language={language}
            />
            
            <EducationForm 
              education={cvData.education}
              onChange={(education) => handleCVDataChange({ ...cvData, education })}
              language={language}
            />
            
            <CertificationsForm 
              certifications={cvData.certifications}
              onChange={(certifications) => handleCVDataChange({ ...cvData, certifications })}
              language={language}
            />
            
            <ProjectsForm 
              projects={cvData.projects}
              onChange={(projects) => handleCVDataChange({ ...cvData, projects })}
              language={language}
            />
            
            <CustomQuestionsForm 
              questions={cvData.customQuestions}
              onChange={(customQuestions) => handleCVDataChange({ ...cvData, customQuestions })}
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
              onChange={handleOptimizationsChange}
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
          <>
            <AISettings 
              language={language}
              onConfigChange={initializeAIService}
            />
            
            <GoogleDriveSettings 
              language={language}
            />
          </>
        )}
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
