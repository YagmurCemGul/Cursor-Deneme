import { useEffect, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { jobCache } from '../../lib/idb';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    setLoading(true);
    try {
      const data = await jobCache.getAll();
      setJobs(data.sort((a, b) => b.extractedAt - a.extractedAt));
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1>Saved Jobs</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
            Jobs automatically saved while browsing
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadJobs}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            No saved jobs yet. Browse job postings and they will be cached here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {jobs.map(job => (
            <div key={job.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>{job.title}</h3>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                    {job.company} • {job.location}
                  </p>
                </div>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  <ExternalLink size={14} />
                  View
                </a>
              </div>

              {job.requirements.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Requirements:</h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                    {job.requirements.slice(0, 3).map((req: string, idx: number) => (
                      <li key={idx} style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                Saved {new Date(job.extractedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
