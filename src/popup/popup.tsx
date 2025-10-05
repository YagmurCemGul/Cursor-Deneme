import React, { useEffect, useMemo, useState } from 'react';
import { ResumeProfile, JobPost, AtsOptimization } from '../lib/types';
import { getActiveProfile, loadOptimizations, saveJobPost, saveOptimizations, saveOrUpdateProfile } from '../lib/storage';
import { generateAtsResume, generateCoverLetter } from '../lib/ai';

type TabId = 'cv' | 'job' | 'preview' | 'downloads' | 'cover';

function TabButton({ id, active, setActive, children }: { id: TabId; active: TabId; setActive: (id: TabId) => void; children: React.ReactNode }) {
  return (
    <button className={"tab" + (active === id ? " active" : "")} onClick={() => setActive(id)}>{children}</button>
  );
}

function TextRow({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="col" style={{ minWidth: 220, flex: 1 }}>
      <span className="label">{label}</span>
      <input className="text-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

function SectionHeader({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <h3 style={{ margin: '12px 0 6px' }}>{title}</h3>
      <div className="row">{actions}</div>
    </div>
  );
}

function Pill({ text, onRemove }: { text: string; onRemove?: () => void }) {
  return (
    <span className="pill">
      {text}
      <span className="close" onClick={onRemove}>×</span>
    </span>
  );
}

export function Popup() {
  const [active, setActive] = useState<TabId>('cv');
  const [profile, setProfile] = useState<ResumeProfile | undefined>();
  const [job, setJob] = useState<JobPost>({ id: crypto.randomUUID(), pastedText: '' });
  const [resumeMd, setResumeMd] = useState<string>('');
  const [coverMd, setCoverMd] = useState<string>('');
  const [optimizations, setOptimizations] = useState<AtsOptimization[]>([]);
  const [extraPrompt, setExtraPrompt] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

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
    
    setLoading(true);
    setError('');
    
    try {
      const result = await generateAtsResume(profile, job);
      setResumeMd(result.text);
      setOptimizations(result.optimizations);
      await saveOptimizations(result.optimizations);
      setActive('preview');
    } catch (error: any) {
      console.error('Resume generation error:', error);
      setError(error.message || 'Failed to generate resume. Please check your API settings.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateCoverLetter() {
    if (!profile || !job.pastedText) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await generateCoverLetter(profile, job, extraPrompt);
      setCoverMd(result.text);
      setActive('cover');
    } catch (error: any) {
      console.error('Cover letter generation error:', error);
      setError(error.message || 'Failed to generate cover letter. Please check your API settings.');
    } finally {
      setLoading(false);
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
    return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-\.]/g, '');
  }

  async function saveProfile(updated: ResumeProfile) {
    setProfile(updated);
    await saveOrUpdateProfile(updated);
  }

  return (
    <div className="container">
      <div className="tabbar">
        <TabButton id="cv" active={active} setActive={setActive}>CV</TabButton>
        <TabButton id="job" active={active} setActive={setActive}>Job</TabButton>
        <TabButton id="preview" active={active} setActive={setActive}>Preview</TabButton>
        <TabButton id="cover" active={active} setActive={setActive}>Cover Letter</TabButton>
        <TabButton id="downloads" active={active} setActive={setActive}>Downloads</TabButton>
      </div>

      {error && (
        <div style={{ 
          margin: '10px 0', 
          padding: '10px', 
          background: '#fee2e2', 
          border: '1px solid #fecaca', 
          borderRadius: '6px',
          color: '#991b1b',
          fontSize: '14px'
        }}>
          ⚠️ {error}
          {error.includes('API') && (
            <button 
              style={{ marginLeft: '10px', textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
              onClick={() => chrome.runtime.openOptionsPage()}
            >
              Go to Settings
            </button>
          )}
        </div>
      )}

      {active === 'cv' && (
        <div className="col" style={{ gap: 10 }}>
          <SectionHeader title="Personal" />
          <div className="row">
            <TextRow label="First name" value={profile?.personal.firstName ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, firstName: v } })} />
            <TextRow label="Middle name" value={profile?.personal.middleName ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, middleName: v } })} />
            <TextRow label="Last name" value={profile?.personal.lastName ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, lastName: v } })} />
          </div>
          <div className="row">
            <TextRow label="Email" value={profile?.personal.email ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, email: v } })} placeholder="name@domain.com" />
            <TextRow label="LinkedIn" value={profile?.personal.linkedin ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, linkedin: v.replace('https://www.linkedin.com/in/', '') } })} placeholder="username" />
            <TextRow label="GitHub" value={profile?.personal.github ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, github: v.replace('https://github.com/', '') } })} placeholder="username" />
          </div>
          <div className="row">
            <TextRow label="Portfolio" value={profile?.personal.portfolio ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, portfolio: v } })} placeholder="https://..." />
            <TextRow label="WhatsApp" value={profile?.personal.whatsapp ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, whatsapp: v } })} placeholder="https://wa.me/...." />
            <TextRow label="Phone" value={profile?.personal.phone ?? ''} onChange={(v) => profile && saveProfile({ ...profile, personal: { ...profile.personal, phone: v } })} placeholder="+90 ..." />
          </div>
          <div className="col">
            <span className="label">Summary</span>
            <textarea className="textarea" value={profile?.personal.summary ?? ''} onChange={(e) => profile && saveProfile({ ...profile, personal: { ...profile.personal, summary: e.target.value } })} />
          </div>
          <SectionHeader title="Skills" actions={<button className="btn secondary" onClick={() => profile && saveProfile({ ...profile, skills: [...(profile.skills ?? []), ''] })}>Add</button>} />
          <div className="col">
            {(profile?.skills ?? []).map((s, i) => (
              <div className="row" key={i}>
                <input className="text-input" value={s} onChange={(e) => profile && saveProfile({ ...profile, skills: profile.skills.map((x, idx) => idx === i ? e.target.value : x) })} />
                <button className="btn ghost" onClick={() => profile && saveProfile({ ...profile, skills: profile.skills.filter((_, idx) => idx !== i) })}>Remove</button>
              </div>
            ))}
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 10 }}>
            <button className="btn" onClick={handleGenerateResume} disabled={loading}>
              {loading ? '⏳ Generating...' : 'Generate ATS Resume'}
            </button>
          </div>
          <div className="row" style={{ gap: 12 }}>
            {optimizations.map((o) => (
              <Pill key={o.id} text={`${o.kind} in ${o.section}`} onRemove={() => handleRemoveOptimization(o.id)} />
            ))}
          </div>
        </div>
      )}

      {active === 'job' && (
        <div className="col" style={{ gap: 10 }}>
          <SectionHeader title="Paste Job Description" />
          <textarea className="textarea" value={job.pastedText} onChange={(e) => setJob({ ...job, pastedText: e.target.value })} placeholder="Paste job listing here" />
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <button className="btn" onClick={() => saveJobPost(job)}>Save Job</button>
            <button className="btn" onClick={handleGenerateResume} disabled={loading}>
              {loading ? '⏳ Generating...' : 'Generate ATS Resume'}
            </button>
          </div>
          <SectionHeader title="Cover Letter Extras" />
          <textarea className="textarea" value={extraPrompt} onChange={(e) => setExtraPrompt(e.target.value)} placeholder="Ekstra talimatlar (opsiyonel)" />
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" onClick={handleGenerateCoverLetter} disabled={loading}>
              {loading ? '⏳ Generating...' : 'Generate Cover Letter'}
            </button>
          </div>
        </div>
      )}

      {active === 'preview' && (
        <div className="col">
          <SectionHeader title="Resume Preview" />
          <div className="preview" id="resume-preview">
            <pre style={{ whiteSpace: 'pre-wrap' }}>{resumeMd}</pre>
          </div>
        </div>
      )}

      {active === 'cover' && (
        <div className="col">
          <SectionHeader title="Cover Letter Preview" />
          <div className="preview" id="cover-preview">
            <pre style={{ whiteSpace: 'pre-wrap' }}>{coverMd}</pre>
          </div>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => navigator.clipboard.writeText(coverMd)}>Copy as Text</button>
          </div>
        </div>
      )}

      {active === 'downloads' && (
        <div className="col" style={{ gap: 10 }}>
          <SectionHeader title="Downloads" />
          <div className="row">
            <button className="btn" onClick={() => downloadText(`${sanitizeFileBase()}.md`, 'text/markdown', resumeMd)}>Download Resume as .md</button>
            <button className="btn" onClick={() => downloadText(`${sanitizeFileBase()}_cover.md`, 'text/markdown', coverMd)}>Download Cover as .md</button>
          </div>
          <div className="row">
            <button className="btn secondary" onClick={() => window.print()}>Print to PDF</button>
          </div>
        </div>
      )}

      <div className="row" style={{ marginTop: 14, fontSize: 12, color: '#64748b' }}>
        <span>LinkedIn: {linkedInUrl}</span>
        <span>GitHub: {githubUrl}</span>
      </div>
      
      {/* Settings button */}
      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 10 }}>
        <button 
          className="btn secondary" 
          onClick={() => chrome.runtime.openOptionsPage()}
          title="Configure AI settings"
        >
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
}
