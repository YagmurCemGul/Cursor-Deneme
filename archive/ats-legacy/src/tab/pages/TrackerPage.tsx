import { useEffect, useState } from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';
import { getTrackedJobs, updateTrackedJob, deleteTrackedJob, type TrackedJob } from '../../lib/storage';

export default function TrackerPage() {
  const [jobs, setJobs] = useState<TrackedJob[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    setLoading(true);
    try {
      const data = await getTrackedJobs();
      setJobs(data.sort((a, b) => b.savedAt - a.savedAt));
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: TrackedJob['status']) {
    await updateTrackedJob(id, { status });
    await loadJobs();
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this job?')) {
      await deleteTrackedJob(id);
      await loadJobs();
    }
  }

  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(j => j.status === filter);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Job Tracker</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Track your job applications and their status
        </p>
      </div>

      {/* Status Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className={filter === 'all' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          onClick={() => setFilter('all')}
        >
          All ({jobs.length})
        </button>
        <button
          className={filter === 'saved' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          onClick={() => setFilter('saved')}
        >
          Saved ({jobs.filter(j => j.status === 'saved').length})
        </button>
        <button
          className={filter === 'applied' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          onClick={() => setFilter('applied')}
        >
          Applied ({jobs.filter(j => j.status === 'applied').length})
        </button>
        <button
          className={filter === 'interview' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          onClick={() => setFilter('interview')}
        >
          Interview ({jobs.filter(j => j.status === 'interview').length})
        </button>
        <button
          className={filter === 'offered' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          onClick={() => setFilter('offered')}
        >
          Offered ({jobs.filter(j => j.status === 'offered').length})
        </button>
        <button
          className={filter === 'rejected' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({jobs.filter(j => j.status === 'rejected').length})
        </button>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            No jobs tracked yet. Use Ctrl+Shift+L on job pages to track them.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredJobs.map(job => (
            <div key={job.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ marginBottom: 0 }}>{job.title}</h3>
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job.id, e.target.value as TrackedJob['status'])}
                      className="form-select"
                      style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                    >
                      <option value="saved">Saved</option>
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="offered">Offered</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                    {job.company}
                  </p>

                  {job.atsScore && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span className="badge badge-primary">
                        ATS Score: {job.atsScore}%
                      </span>
                    </div>
                  )}

                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                    Saved {new Date(job.savedAt).toLocaleDateString()}
                    {job.appliedAt && ` • Applied ${new Date(job.appliedAt).toLocaleDateString()}`}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(job.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {job.notes && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: '0.875rem', marginBottom: 0 }}>{job.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
