import React, { useEffect, useMemo, useState } from 'react';
import { ResumeProfile, JobPost, AtsOptimization } from '../lib/types';
import { getActiveProfile, loadOptimizations, saveJobPost, saveOptimizations, saveOrUpdateProfile } from '../lib/storage';
import { generateAtsResume, generateCoverLetter } from '../lib/ai';
import { TabButton, TextRow, SectionHeader, Pill, Button } from '../components/ui';

export function NewTab() {
  const [active, setActive] = useState<'cv' | 'job' | 'preview' | 'downloads' | 'cover'>('cv');
  const [profile, setProfile] = useState<ResumeProfile | undefined>();
  const [job, setJob] = useState<JobPost>({ id: crypto.randomUUID(), pastedText: '' });
  const [resumeMd, setResumeMd] = useState<string>('');
  const [coverMd, setCoverMd] = useState<string>('');
  const [optimizations, setOptimizations] = useState<AtsOptimization[]>([]);
  const [extraPrompt, setExtraPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await getActiveProfile();
      setProfile(p);
      const opt = await loadOptimizations();
      setOptimizations(opt);
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ background: 'white', borderRadius: 16, padding: '24px 32px', marginBottom: 24, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
          <h1 style={{ margin: 0, fontSize: 28, color: '#1e293b', marginBottom: 8 }}>AI CV & Cover Letter Optimizer</h1>
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
          </div>

          <div style={{ padding: 32 }}>
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
                  <TextRow label="LinkedIn" value={profile?.personal.linkedin ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, linkedin: v.replace('https://www.linkedin.com/in/', '') } })} placeholder="username" />
                  <TextRow label="GitHub" value={profile?.personal.github ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, github: v.replace('https://github.com/', '') } })} placeholder="username" />
                </div>
                <div className="row">
                  <TextRow label="Portfolio" value={profile?.personal.portfolio ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, portfolio: v } })} placeholder="https://..." />
                  <TextRow label="WhatsApp" value={profile?.personal.whatsapp ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, whatsapp: v } })} placeholder="https://wa.me/...." />
                </div>
                
                <div className="col" style={{ marginTop: 12 }}>
                  <span className="label">Professional Summary</span>
                  <textarea 
                    className="textarea" 
                    style={{ minHeight: 150 }}
                    value={profile?.personal.summary ?? ''} 
                    onChange={(e) => profile && saveProfile({ ...profile, personal: { ...profile.personal, summary: e.target.value } })} 
                    placeholder="Write a brief professional summary..."
                  />
                </div>

                <SectionHeader 
                  title="Skills" 
                  actions={
                    <Button variant="secondary" onClick={() => profile && saveProfile({ ...profile, skills: [...(profile.skills ?? []), ''] })}>
                      + Add Skill
                    </Button>
                  } 
                />
                <div className="col" style={{ gap: 8 }}>
                  {(profile?.skills ?? []).map((s, i) => (
                    <div className="row" key={i} style={{ alignItems: 'center' }}>
                      <input 
                        className="text-input" 
                        value={s} 
                        onChange={(e) => profile && saveProfile({ ...profile, skills: profile.skills.map((x, idx) => idx === i ? e.target.value : x) })} 
                        placeholder="Enter skill..."
                      />
                      <Button variant="ghost" onClick={() => profile && saveProfile({ ...profile, skills: profile.skills.filter((_, idx) => idx !== i) })}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                {optimizations.length > 0 && (
                  <>
                    <SectionHeader title="Applied Optimizations" />
                    <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
                      {optimizations.map((o) => (
                        <Pill key={o.id} text={`${o.kind} in ${o.section}`} onRemove={() => handleRemoveOptimization(o.id)} />
                      ))}
                    </div>
                  </>
                )}

                <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
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
                  Paste the full job description here. The AI will analyze it to optimize your resume.
                </p>
                <textarea 
                  className="textarea" 
                  style={{ minHeight: 300 }}
                  value={job.pastedText} 
                  onChange={(e) => setJob({ ...job, pastedText: e.target.value })} 
                  placeholder="Paste the complete job listing here..."
                />
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
                    placeholder="Example: Emphasize my remote work experience and leadership skills..."
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
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{resumeMd}</pre>
                    </div>
                    <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
                      <Button variant="secondary" onClick={() => navigator.clipboard.writeText(resumeMd)}>
                        📋 Copy to Clipboard
                      </Button>
                      <Button variant="primary" onClick={() => setActive('downloads')}>
                        ⬇️ Go to Downloads
                      </Button>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                    <p style={{ fontSize: 18, margin: 0 }}>No resume generated yet.</p>
                    <p style={{ fontSize: 14, margin: '8px 0 0' }}>Fill in your profile and job description, then click "Generate ATS Resume"</p>
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
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{coverMd}</pre>
                    </div>
                    <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
                      <Button variant="secondary" onClick={() => navigator.clipboard.writeText(coverMd)}>
                        📋 Copy to Clipboard
                      </Button>
                      <Button variant="primary" onClick={() => setActive('downloads')}>
                        ⬇️ Go to Downloads
                      </Button>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                    <p style={{ fontSize: 18, margin: 0 }}>No cover letter generated yet.</p>
                    <p style={{ fontSize: 14, margin: '8px 0 0' }}>Go to the Job tab and click "Generate Cover Letter"</p>
                  </div>
                )}
              </div>
            )}

            {active === 'downloads' && (
              <div className="col" style={{ gap: 20 }}>
                <SectionHeader title="Download Your Documents" />
                <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                  <h4 style={{ margin: '0 0 12px', color: '#1e293b' }}>Resume</h4>
                  <div className="row" style={{ gap: 12 }}>
                    <Button variant="primary" onClick={() => downloadText(`${sanitizeFileBase()}.md`, 'text/markdown', resumeMd)} disabled={!resumeMd}>
                      📄 Download as Markdown
                    </Button>
                    <Button variant="secondary" onClick={() => navigator.clipboard.writeText(resumeMd)} disabled={!resumeMd}>
                      📋 Copy Text
                    </Button>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                  <h4 style={{ margin: '0 0 12px', color: '#1e293b' }}>Cover Letter</h4>
                  <div className="row" style={{ gap: 12 }}>
                    <Button variant="primary" onClick={() => downloadText(`${sanitizeFileBase()}_cover.md`, 'text/markdown', coverMd)} disabled={!coverMd}>
                      📄 Download as Markdown
                    </Button>
                    <Button variant="secondary" onClick={() => navigator.clipboard.writeText(coverMd)} disabled={!coverMd}>
                      📋 Copy Text
                    </Button>
                  </div>
                </div>

                <div style={{ background: '#eef2ff', padding: 24, borderRadius: 12, border: '1px solid #c7d2fe' }}>
                  <h4 style={{ margin: '0 0 8px', color: '#1e293b' }}>💡 Pro Tip</h4>
                  <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>
                    Use <span className="kbd">Ctrl+P</span> (or <span className="kbd">Cmd+P</span> on Mac) to print your resume as a PDF directly from the browser.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 24, padding: '16px 0', textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
          {linkedInUrl && <span style={{ marginRight: 16 }}>LinkedIn: {linkedInUrl}</span>}
          {githubUrl && <span>GitHub: {githubUrl}</span>}
        </div>
      </div>
    </div>
  );
}
