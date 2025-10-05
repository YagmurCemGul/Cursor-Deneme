import React, { useEffect, useMemo, useState } from 'react';
import { ResumeProfile, JobPost, AtsOptimization, EmploymentType } from '../lib/types';
import { getActiveProfile, loadOptimizations, saveJobPost, saveOptimizations, saveOrUpdateProfile, loadOptions, loadJobPost, loadGeneratedResume, loadGeneratedCoverLetter, saveGeneratedResume, saveGeneratedCoverLetter } from '../lib/storage';
import { generateAtsResume, generateCoverLetter } from '../lib/ai';
import { TabButton, TextRow, SectionHeader, Pill, Button } from '../components/ui';
import '../styles/global.css';

export function NewTab() {
  const [active, setActive] = useState<'cv' | 'job' | 'preview' | 'downloads' | 'cover' | 'settings'>('cv');
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

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

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

  async function saveProfile(updated: ResumeProfile) {
    setProfile(updated);
    await saveOrUpdateProfile(updated);
  }

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
          <h1 style={{ margin: 0, fontSize: 28, color: '#1e293b', marginBottom: 8 }}>🚀 AI CV & Cover Letter Optimizer</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Create ATS-optimized resumes and cover letters powered by AI</p>
        </div>

        {/* Main Content */}
        <div style={{ background: 'white', borderRadius: 16, padding: 0, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div className="tabbar" style={{ borderRadius: '16px 16px 0 0' }}>
            <TabButton id="cv" active={active} setActive={id => setActive(id as any)}>📝 CV Profile</TabButton>
            <TabButton id="job" active={active} setActive={id => setActive(id as any)}>💼 Job Description</TabButton>
            <TabButton id="preview" active={active} setActive={id => setActive(id as any)}>👁️ Resume Preview</TabButton>
            <TabButton id="cover" active={active} setActive={id => setActive(id as any)}>✉️ Cover Letter</TabButton>
            <TabButton id="downloads" active={active} setActive={id => setActive(id as any)}>⬇️ Downloads</TabButton>
            <TabButton id="settings" active={active} setActive={id => setActive(id as any)}>⚙️ Settings</TabButton>
          </div>

          <div style={{ padding: 32, maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
            {active === 'cv' && (
              <div className="col" style={{ gap: 16 }}>
                <SectionHeader title="Personal Information" />
                <div className="row">
                  <TextRow label="First name" value={profile?.personal.firstName ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, firstName: v } })} />
                  <TextRow label="Middle name" value={profile?.personal.middleName ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, middleName: v } })} />
                  <TextRow label="Last name" value={profile?.personal.lastName ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, lastName: v } })} />
                </div>
                <div className="row">
                  <TextRow label="Email" value={profile?.personal.email ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, email: v } })} placeholder="name@domain.com" />
                  <TextRow label="Phone" value={profile?.personal.phone ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, phone: v } })} placeholder="+90 ..." />
                </div>
                <div className="row">
                  <TextRow label="LinkedIn" value={profile?.personal.linkedin ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, linkedin: v.replace('https://www.linkedin.com/in/', '').replace('https://linkedin.com/in/', '') } })} placeholder="username" />
                  <TextRow label="GitHub" value={profile?.personal.github ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, github: v.replace('https://github.com/', '') } })} placeholder="username" />
                </div>
                <div className="row">
                  <TextRow label="Portfolio" value={profile?.personal.portfolio ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, portfolio: v } })} placeholder="https://..." />
                  <TextRow label="Location" value={profile?.personal.location ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, location: v } })} placeholder="City, Country" />
                </div>
                
                <div className="col" style={{ marginTop: 12 }}>
                  <span className="label">Professional Summary</span>
                  <textarea 
                    className="textarea" 
                    style={{ minHeight: 120 }}
                    value={profile?.personal.summary ?? ''} 
                    onChange={(e) => profile && saveProfile({ ...profile, personal: { ...profile.personal, summary: e.target.value } })} 
                    placeholder="Write a brief professional summary highlighting your key strengths and experience..."
                  />
                </div>

                <div className="divider" />

                <SectionHeader 
                  title="Skills" 
                  actions={
                    <Button variant="secondary" onClick={() => profile && saveProfile({ ...profile, skills: [...(profile.skills ?? []), ''] })}>
                      + Add Skill
                    </Button>
                  } 
                />
                <div className="col" style={{ gap: 8 }}>
                  {(profile?.skills ?? []).length === 0 ? (
                    <div className="empty-state">
                      <p className="empty-state-text">No skills added yet. Click "Add Skill" to get started.</p>
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

                <div className="divider" />

                <SectionHeader 
                  title="Experience" 
                  actions={
                    <Button variant="secondary" onClick={addExperience}>
                      + Add Experience
                    </Button>
                  } 
                />
                {(profile?.experience ?? []).length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">💼</div>
                    <p className="empty-state-title">No work experience added</p>
                    <p className="empty-state-text">Add your professional experience to build a compelling resume</p>
                  </div>
                ) : (
                  (profile?.experience ?? []).map((exp, i) => (
                    <div key={i} className="card">
                      <div className="row" style={{ marginBottom: 12, justifyContent: 'space-between' }}>
                        <h4 style={{ margin: 0, color: '#1e293b' }}>Experience #{i + 1}</h4>
                        <Button variant="danger" onClick={() => removeExperience(i)}>
                          🗑️ Remove
                        </Button>
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
                        <span className="label">Description</span>
                        <textarea 
                          className="textarea" 
                          value={exp.description ?? ''} 
                          onChange={(e) => updateExperience(i, 'description', e.target.value)} 
                          placeholder="Describe your responsibilities and achievements..."
                        />
                      </div>
                    </div>
                  ))
                )}

                <div className="divider" />

                <SectionHeader 
                  title="Education" 
                  actions={
                    <Button variant="secondary" onClick={addEducation}>
                      + Add Education
                    </Button>
                  } 
                />
                {(profile?.education ?? []).length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">🎓</div>
                    <p className="empty-state-title">No education added</p>
                    <p className="empty-state-text">Add your educational background</p>
                  </div>
                ) : (
                  (profile?.education ?? []).map((edu, i) => (
                    <div key={i} className="card">
                      <div className="row" style={{ marginBottom: 12, justifyContent: 'space-between' }}>
                        <h4 style={{ margin: 0, color: '#1e293b' }}>Education #{i + 1}</h4>
                        <Button variant="danger" onClick={() => removeEducation(i)}>
                          🗑️ Remove
                        </Button>
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

                <div className="divider" />

                <SectionHeader 
                  title="Projects" 
                  actions={
                    <Button variant="secondary" onClick={addProject}>
                      + Add Project
                    </Button>
                  } 
                />
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

                <div className="divider" />

                <SectionHeader 
                  title="Licenses & Certifications" 
                  actions={
                    <Button variant="secondary" onClick={addLicense}>
                      + Add Certification
                    </Button>
                  } 
                />
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
                <SectionHeader title="Cover Letter Preview" />
                {coverMd ? (
                  <>
                    <div className="preview" id="cover-preview" style={{ maxWidth: '100%', minHeight: 400 }}>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{coverMd}</pre>
                    </div>
                    <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
                      <Button variant="secondary" onClick={() => navigator.clipboard.writeText(coverMd).then(() => alert('Copied to clipboard!'))}>
                        📋 Copy to Clipboard
                      </Button>
                      <Button variant="primary" onClick={() => setActive('downloads')}>
                        ⬇️ Go to Downloads
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">✉️</div>
                    <p className="empty-state-title">No cover letter generated yet</p>
                    <p className="empty-state-text">Go to the Job tab and click "Generate Cover Letter"</p>
                  </div>
                )}
              </div>
            )}

            {active === 'downloads' && (
              <div className="col" style={{ gap: 20 }}>
                <SectionHeader title="Download Your Documents" />
                <div className="card">
                  <h4 style={{ margin: '0 0 12px', color: '#1e293b' }}>📄 Resume</h4>
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
                </div>

                <div className="card">
                  <h4 style={{ margin: '0 0 12px', color: '#1e293b' }}>✉️ Cover Letter</h4>
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

            {active === 'settings' && (
              <div className="col" style={{ gap: 20 }}>
                <SectionHeader title="API Settings" />
                <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
                  Configure your AI provider and API key to enable resume and cover letter generation.
                </p>

                <div className="card">
                  <label className="col">
                    <span className="label">AI Provider</span>
                    <select value={apiProvider} onChange={(e) => setApiProvider(e.target.value as any)}>
                      <option value="openai">OpenAI (GPT-4)</option>
                      <option value="gemini">Google Gemini</option>
                      <option value="claude">Anthropic Claude</option>
                      <option value="azure">Azure OpenAI</option>
                    </select>
                  </label>

                  <label className="col" style={{ marginTop: 16 }}>
                    <span className="label">API Key</span>
                    <input 
                      type="password" 
                      className="text-input" 
                      value={apiKey} 
                      onChange={(e) => setApiKey(e.target.value)} 
                      placeholder="Enter your API key..."
                    />
                  </label>

                  <label className="col" style={{ marginTop: 16 }}>
                    <span className="label">Default Language</span>
                    <select value={language} onChange={(e) => setLanguage(e.target.value as 'tr' | 'en')}>
                      <option value="en">English</option>
                      <option value="tr">Türkçe</option>
                    </select>
                  </label>

                  <Button variant="primary" onClick={saveSettings} style={{ marginTop: 16 }}>
                    💾 Save Settings
                  </Button>
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
        </div>

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
