import React, { useEffect, useState } from 'react';
import { ResumeProfile, JobPost, AtsOptimization } from '../lib/types';
import { getActiveProfile, loadOptimizations, saveJobPost } from '../lib/storage';
import { generateAtsResume, generateCoverLetter } from '../lib/ai';
import { Button } from '../components/ui';

export function Popup() {
  const [profile, setProfile] = useState<ResumeProfile | undefined>();
  const [job, setJob] = useState<JobPost>({ id: crypto.randomUUID(), pastedText: '' });
  const [optimizations, setOptimizations] = useState<AtsOptimization[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    (async () => {
      const p = await getActiveProfile();
      setProfile(p);
      const opt = await loadOptimizations();
      setOptimizations(opt);
    })();
  }, []);

  async function handleGenerateResume() {
    if (!profile || !job.pastedText) {
      setStatus('⚠️ Please complete your profile and add job description');
      return;
    }
    setIsGenerating(true);
    setStatus('⏳ Generating ATS-optimized resume...');
    try {
      await generateAtsResume(profile, job);
      setStatus('✅ Resume generated! Open new tab to view.');
      setTimeout(() => chrome.tabs.create({ url: chrome.runtime.getURL('src/newtab/index.html') }), 500);
    } catch (error) {
      setStatus('❌ Error generating resume');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleGenerateCoverLetter() {
    if (!profile || !job.pastedText) {
      setStatus('⚠️ Please complete your profile and add job description');
      return;
    }
    setIsGenerating(true);
    setStatus('⏳ Generating cover letter...');
    try {
      await generateCoverLetter(profile, job, '');
      setStatus('✅ Cover letter generated! Open new tab to view.');
      setTimeout(() => chrome.tabs.create({ url: chrome.runtime.getURL('src/newtab/index.html') }), 500);
    } catch (error) {
      setStatus('❌ Error generating cover letter');
    } finally {
      setIsGenerating(false);
    }
  }

  function openFullApp() {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/newtab/index.html') });
  }

  return (
    <div style={{ width: 400, maxHeight: 600, overflow: 'auto' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', color: 'white' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>AI CV Optimizer</h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.9 }}>Quick Actions</p>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Status */}
        {status && (
          <div style={{ 
            padding: '12px', 
            background: status.includes('✅') ? '#f0fdf4' : status.includes('❌') ? '#fef2f2' : '#fffbeb',
            border: '1px solid ' + (status.includes('✅') ? '#86efac' : status.includes('❌') ? '#fca5a5' : '#fde047'),
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
            color: '#1e293b'
          }}>
            {status}
          </div>
        )}

        {/* Profile Status */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, margin: '0 0 8px', color: '#1e293b' }}>Profile Status</h3>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            {profile?.personal.firstName ? (
              <div>✅ Profile: <strong>{profile.personal.firstName} {profile.personal.lastName}</strong></div>
            ) : (
              <div>❌ Profile not set up</div>
            )}
            {profile?.skills && profile.skills.length > 0 ? (
              <div>✅ Skills: {profile.skills.length} added</div>
            ) : (
              <div>❌ No skills added</div>
            )}
            {optimizations.length > 0 && (
              <div>💡 {optimizations.length} optimization{optimizations.length !== 1 ? 's' : ''} applied</div>
            )}
          </div>
        </div>

        {/* Quick Job Input */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, margin: '0 0 8px', color: '#1e293b' }}>Job Description</h3>
          <textarea 
            className="textarea" 
            style={{ minHeight: 120, fontSize: 13 }}
            value={job.pastedText} 
            onChange={(e) => setJob({ ...job, pastedText: e.target.value })} 
            placeholder="Paste job description here..."
          />
          <div style={{ marginTop: 8 }}>
            <Button variant="secondary" onClick={() => saveJobPost(job)} disabled={!job.pastedText}>
              💾 Save Job
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button 
            variant="primary" 
            onClick={handleGenerateResume} 
            disabled={isGenerating || !profile?.personal.firstName || !job.pastedText}
          >
            🚀 Generate Resume
          </Button>
          <Button 
            variant="primary" 
            onClick={handleGenerateCoverLetter} 
            disabled={isGenerating || !profile?.personal.firstName || !job.pastedText}
          >
            ✉️ Generate Cover Letter
          </Button>
          <div style={{ margin: '8px 0', borderTop: '1px solid #e5e7eb' }}></div>
          <Button variant="secondary" onClick={openFullApp}>
            🔧 Open Full Editor
          </Button>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e5e7eb', fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
          <p style={{ margin: 0 }}>💡 Tip: Use the full editor for advanced features</p>
        </div>
      </div>
    </div>
  );
}
