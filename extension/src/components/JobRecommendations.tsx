/**
 * Job Recommendations Component
 * Shows AI-matched job recommendations based on CV
 */

import React, { useState, useEffect } from 'react';
import { ResumeProfile } from '../lib/types';
import { JobListing, getRecommendedJobs, checkForNewJobs } from '../lib/jobBoards';
import { Button } from './ui';
import { Language } from '../lib/i18n';

interface JobRecommendationsProps {
  profile: ResumeProfile;
  language: Language;
  onJobSelect?: (job: JobListing) => void;
}

export function JobRecommendations({ profile, language, onJobSelect }: JobRecommendationsProps) {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const t = (key: string) => {
    const translations: Record<string, { en: string; tr: string }> = {
      title: { en: 'Recommended Jobs', tr: 'Önerilen İşler' },
      subtitle: { en: 'AI-matched jobs based on your CV', tr: 'CV\'nize göre yapay zeka eşleşmeli işler' },
      loading: { en: 'Finding perfect jobs for you...', tr: 'Size mükemmel işler bulunuyor...' },
      noJobs: { en: 'No recommendations found', tr: 'Öneri bulunamadı' },
      noJobsDesc: { en: 'Update your CV with more skills to get better matches', tr: 'Daha iyi eşleşmeler için CV\'nize daha fazla beceri ekleyin' },
      matchScore: { en: 'Match Score', tr: 'Eşleşme Skoru' },
      viewDetails: { en: 'View Details', tr: 'Detayları Gör' },
      applyNow: { en: 'Apply Now', tr: 'Şimdi Başvur' },
      addToTracker: { en: 'Add to Tracker', tr: 'Takipçiye Ekle' },
      autoSync: { en: 'Auto-Sync', tr: 'Otomatik Senkronizasyon' },
      enableAutoSync: { en: 'Enable automatic job syncing', tr: 'Otomatik iş senkronizasyonunu etkinleştir' },
      lastSync: { en: 'Last synced', tr: 'Son senkronizasyon' },
      syncNow: { en: 'Sync Now', tr: 'Şimdi Senkronize Et' },
      newJobs: { en: 'new jobs', tr: 'yeni iş' },
      postedOn: { en: 'Posted', tr: 'Yayınlanma' },
      remote: { en: 'Remote', tr: 'Uzaktan' },
      fullTime: { en: 'Full-time', tr: 'Tam zamanlı' },
    };
    return translations[key]?.[language] || translations[key]?.en || key;
  };

  useEffect(() => {
    loadJobs();
    
    // Check auto-sync settings
    chrome.storage.local.get(['autoSyncEnabled', 'lastJobSync'], (result) => {
      setAutoSyncEnabled(result.autoSyncEnabled || false);
      if (result.lastJobSync) {
        setLastSync(new Date(result.lastJobSync));
      }
    });
  }, [profile]);

  async function loadJobs() {
    setIsLoading(true);
    try {
      const recommendations = await getRecommendedJobs(profile, 10);
      setJobs(recommendations);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSync() {
    setIsLoading(true);
    try {
      const result = await checkForNewJobs(profile);
      setJobs(result.newJobs);
      setLastSync(new Date());
      await chrome.storage.local.set({ lastJobSync: Date.now() });
      
      if (result.count > 0) {
        alert(`${result.count} ${t('newJobs')} found!`);
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAutoSyncToggle(enabled: boolean) {
    setAutoSyncEnabled(enabled);
    await chrome.storage.local.set({ autoSyncEnabled: enabled });
    
    if (enabled) {
      handleSync();
    }
  }

  function formatPostedDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 24, color: '#1e293b' }}>
          🎯 {t('title')}
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
          {t('subtitle')}
        </p>
      </div>

      {/* Auto-Sync Controls */}
      <div style={{ 
        padding: 16, 
        background: '#f8fafc', 
        borderRadius: 12, 
        border: '1px solid #e2e8f0',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="checkbox"
            id="autoSync"
            checked={autoSyncEnabled}
            onChange={(e) => handleAutoSyncToggle(e.target.checked)}
          />
          <label htmlFor="autoSync" style={{ fontSize: 14, color: '#1e293b', cursor: 'pointer' }}>
            <strong>{t('autoSync')}</strong> - {t('enableAutoSync')}
          </label>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastSync && (
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {t('lastSync')}: {lastSync.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="secondary"
            onClick={handleSync}
            disabled={isLoading}
            style={{ fontSize: 13 }}
          >
            {isLoading ? '⏳' : '🔄'} {t('syncNow')}
          </Button>
        </div>
      </div>

      {/* Job List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 16 }}>{t('loading')}</div>
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
          <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#1e293b' }}>
            {t('noJobs')}
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
            {t('noJobsDesc')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                padding: 20,
                background: 'white',
                border: '2px solid #e2e8f0',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
            >
              {/* Job Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
                    {job.title}
                  </h3>
                  <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                    {job.company} · {job.location}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {job.salary && (
                      <span style={{ 
                        padding: '4px 8px', 
                        background: '#dcfce7', 
                        color: '#166534', 
                        borderRadius: 6, 
                        fontSize: 12,
                        fontWeight: 500,
                      }}>
                        💰 {job.salary}
                      </span>
                    )}
                    {job.type && (
                      <span style={{ 
                        padding: '4px 8px', 
                        background: '#f0f4ff', 
                        color: '#4338ca', 
                        borderRadius: 6, 
                        fontSize: 12,
                        fontWeight: 500,
                      }}>
                        {job.type}
                      </span>
                    )}
                    <span style={{ 
                      padding: '4px 8px', 
                      background: '#fef3c7', 
                      color: '#92400e', 
                      borderRadius: 6, 
                      fontSize: 12,
                      fontWeight: 500,
                    }}>
                      {formatPostedDate(job.posted)}
                    </span>
                  </div>
                </div>

                {/* Match Score */}
                {job.matchScore !== undefined && (
                  <div style={{ 
                    minWidth: 80, 
                    textAlign: 'center',
                    padding: '12px',
                    background: job.matchScore >= 70 ? '#dcfce7' : job.matchScore >= 50 ? '#fef3c7' : '#fee2e2',
                    borderRadius: 12,
                  }}>
                    <div style={{ 
                      fontSize: 24, 
                      fontWeight: 700,
                      color: job.matchScore >= 70 ? '#166534' : job.matchScore >= 50 ? '#92400e' : '#991b1b',
                    }}>
                      {job.matchScore}%
                    </div>
                    <div style={{ 
                      fontSize: 11, 
                      color: job.matchScore >= 70 ? '#166534' : job.matchScore >= 50 ? '#92400e' : '#991b1b',
                      opacity: 0.8,
                    }}>
                      {t('matchScore')}
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {selectedJob?.id === job.id && (
                <div style={{ 
                  marginTop: 16, 
                  paddingTop: 16, 
                  borderTop: '1px solid #e2e8f0',
                }}>
                  {/* Match Reasons */}
                  {job.matchReasons && job.matchReasons.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                        ✨ Why this matches:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {job.matchReasons.map((reason, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 10px',
                              background: '#f0f4ff',
                              color: '#4338ca',
                              borderRadius: 6,
                              fontSize: 12,
                            }}
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description Preview */}
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 1.6 }}>
                    {job.description.substring(0, 200)}...
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      variant="primary"
                      onClick={() => window.open(job.url, '_blank')}
                      style={{ flex: 1, fontSize: 13 }}
                    >
                      🚀 {t('applyNow')}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => onJobSelect && onJobSelect(job)}
                      style={{ flex: 1, fontSize: 13 }}
                    >
                      📊 {t('addToTracker')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
