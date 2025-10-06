import React, { useEffect, useState } from 'react';
import { Zap, Target, FileText, Play } from 'lucide-react';
import { getTrackedJobs, getProfile, type TrackedJob } from '../../lib/storage';

export default function HomePage() {
  const [recentJobs, setRecentJobs] = useState<TrackedJob[]>([]);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [jobs, profile] = await Promise.all([
        getTrackedJobs(),
        getProfile(),
      ]);

      setRecentJobs(jobs.slice(-5).reverse());
      setHasProfile(!!profile);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1>Welcome to Job ATS Assistant</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Automate your job applications with AI-powered autofill, ATS scoring, and tracking.
      </p>

      {/* Quick Actions */}
      <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
        <QuickAction
          icon={<Zap size={24} />}
          title="Autofill Form"
          description="Auto-fill current job application"
          action="Ctrl+Shift+A"
          onClick={() => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'START_AUTOFILL' });
              }
            });
          }}
        />
        <QuickAction
          icon={<Target size={24} />}
          title="ATS Score"
          description="Calculate match score"
          action="Ctrl+Shift+M"
          onClick={() => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'CALCULATE_SCORE' });
              }
            });
          }}
        />
        <QuickAction
          icon={<FileText size={24} />}
          title="Cover Letter"
          description="Generate cover letter"
          onClick={() => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'GENERATE_COVER_LETTER' });
              }
            });
          }}
        />
      </div>

      {/* Profile Setup */}
      {!hasProfile && (
        <div className="card" style={{ marginBottom: '2rem', borderColor: 'var(--color-warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: '0.25rem' }}>Complete Your Profile</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                Set up your profile to enable autofill and ATS scoring features.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => window.location.hash = '/profile'}
            >
              <Play size={16} />
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Recent Jobs */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Jobs</h2>
        </div>
        {recentJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
            <p>No tracked jobs yet. Start tracking jobs as you browse!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentJobs.map(job => (
              <div
                key={job.id}
                className="card"
                style={{ padding: '1rem', background: 'var(--color-bg-secondary)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h4 style={{ marginBottom: '0.25rem' }}>{job.title}</h4>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                      {job.company}
                    </p>
                  </div>
                  <span className={`badge badge-${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                {job.atsScore && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      ATS Score: <strong>{job.atsScore}%</strong>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: string;
  onClick: () => void;
}) {
  return (
    <button
      className="card"
      onClick={onClick}
      style={{
        border: '2px solid var(--color-border)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
    >
      <div style={{ color: 'var(--color-primary)', marginBottom: '0.75rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
        {description}
      </p>
      {action && (
        <code style={{
          fontSize: '0.75rem',
          padding: '0.25rem 0.5rem',
          background: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
        }}>
          {action}
        </code>
      )}
    </button>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'applied':
      return 'primary';
    case 'interview':
      return 'warning';
    case 'offered':
      return 'success';
    case 'rejected':
      return 'danger';
    default:
      return 'primary';
  }
}
