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
import AIService from './utils/aiService';
import { StorageService } from './utils/storage';
import './styles.css';

type TabType = 'cv-info' | 'optimize' | 'cover-letter' | 'profiles';

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
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    loadAPIKey();
  }, []);

  const loadAPIKey = async () => {
    const key = await StorageService.getAPIKey();
    if (key) {
      setApiKey(key);
    }
  };

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
      alert('Please enter a job description first!');
      return;
    }

    setIsOptimizing(true);
    try {
      const aiService = new AIService(apiKey || 'demo-key');
      const result = await aiService.optimizeCV(cvData, jobDescription);
      setCVData(result.optimizedCV);
      setOptimizations(result.optimizations);
      setActiveTab('optimize');
    } catch (error) {
      console.error('Error optimizing CV:', error);
      alert('Error optimizing CV. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGenerateCoverLetter = async (extraPrompt: string) => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description first!');
      return;
    }

    setIsGeneratingCoverLetter(true);
    try {
      const aiService = new AIService(apiKey || 'demo-key');
      const letter = await aiService.generateCoverLetter(cvData, jobDescription, extraPrompt);
      setCoverLetter(letter);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      alert('Error generating cover letter. Please try again.');
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
    alert('Profile saved successfully!');
  };

  const handleLoadProfile = (profile: CVProfile) => {
    setCVData(profile.data);
    setProfileName(profile.name);
    setActiveTab('cv-info');
    alert('Profile loaded successfully!');
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>🤖 AI CV & Cover Letter Optimizer</h1>
        <p>ATS-Optimized Resumes & Cover Letters Powered by AI</p>
      </div>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'cv-info' ? 'active' : ''}`}
          onClick={() => setActiveTab('cv-info')}
        >
          📝 CV Information
        </button>
        <button 
          className={`tab ${activeTab === 'optimize' ? 'active' : ''}`}
          onClick={() => setActiveTab('optimize')}
        >
          ✨ Optimize & Preview
        </button>
        <button 
          className={`tab ${activeTab === 'cover-letter' ? 'active' : ''}`}
          onClick={() => setActiveTab('cover-letter')}
        >
          ✉️ Cover Letter
        </button>
        <button 
          className={`tab ${activeTab === 'profiles' ? 'active' : ''}`}
          onClick={() => setActiveTab('profiles')}
        >
          💾 Profiles
        </button>
      </div>
      
      <div className="content">
        {activeTab === 'cv-info' && (
          <>
            <CVUpload onCVParsed={handleCVParsed} />
            
            <JobDescriptionInput 
              value={jobDescription} 
              onChange={setJobDescription} 
            />
            
            <PersonalInfoForm 
              data={cvData.personalInfo}
              onChange={(personalInfo) => setCVData({ ...cvData, personalInfo })}
            />
            
            <SkillsForm 
              skills={cvData.skills}
              onChange={(skills) => setCVData({ ...cvData, skills })}
            />
            
            <ExperienceForm 
              experiences={cvData.experience}
              onChange={(experience) => setCVData({ ...cvData, experience })}
            />
            
            <EducationForm 
              education={cvData.education}
              onChange={(education) => setCVData({ ...cvData, education })}
            />
            
            <CertificationsForm 
              certifications={cvData.certifications}
              onChange={(certifications) => setCVData({ ...cvData, certifications })}
            />
            
            <ProjectsForm 
              projects={cvData.projects}
              onChange={(projects) => setCVData({ ...cvData, projects })}
            />
            
            <CustomQuestionsForm 
              questions={cvData.customQuestions}
              onChange={(customQuestions) => setCVData({ ...cvData, customQuestions })}
            />
            
            <div style={{ position: 'sticky', bottom: 0, background: 'white', padding: '20px', borderTop: '2px solid #e2e8f0' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleOptimizeCV}
                disabled={isOptimizing}
                style={{ width: '100%', fontSize: '16px', padding: '15px' }}
              >
                {isOptimizing ? '⏳ Optimizing...' : '✨ Optimize CV with AI'}
              </button>
            </div>
          </>
        )}
        
        {activeTab === 'optimize' && (
          <>
            <ATSOptimizations 
              optimizations={optimizations}
              onChange={setOptimizations}
            />
            
            <CVPreview 
              cvData={cvData}
              optimizations={optimizations}
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
          />
        )}
        
        {activeTab === 'profiles' && (
          <ProfileManager 
            onLoadProfile={handleLoadProfile}
            onSaveProfile={handleSaveProfile}
            currentProfileName={profileName}
            onProfileNameChange={setProfileName}
          />
        )}
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
