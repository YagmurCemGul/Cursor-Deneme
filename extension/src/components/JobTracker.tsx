import React, { useState, useEffect } from 'react';
import { JobApplication, ApplicationStatus } from '../lib/types';
import { loadJobApplications, saveJobApplication, deleteJobApplication, updateApplicationStatus } from '../lib/storage';
import { Button } from './ui';

interface JobTrackerProps {
  onClose?: () => void;
}

export function JobTracker({ onClose }: JobTrackerProps) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [view, setView] = useState<'kanban' | 'list' | 'timeline'>('kanban');
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'priority'>('date');

  useEffect(() => {
    loadApps();
  }, []);

  async function loadApps() {
    const apps = await loadJobApplications();
    setApplications(apps);
  }

  async function handleAddApplication(app: JobApplication) {
    await saveJobApplication(app);
    await loadApps();
    setShowAddModal(false);
  }

  async function handleUpdateStatus(id: string, status: ApplicationStatus) {
    await updateApplicationStatus(id, status);
    await loadApps();
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this application?')) {
      await deleteJobApplication(id);
      await loadApps();
      setSelectedApp(null);
    }
  }

  const filteredApps = applications
    .filter(app => filterStatus === 'all' || app.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'company') {
        return a.company.localeCompare(b.company);
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority || 'low'] || 2) - (priorityOrder[b.priority || 'low'] || 2);
      }
      return 0;
    });

  const stats = {
    total: applications.length,
    wishlist: applications.filter(a => a.status === 'wishlist').length,
    applied: applications.filter(a => a.status === 'applied').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer: applications.filter(a => a.status === 'offer').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 12 }}>
              📚 Job Application Tracker
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
              Track and manage all your job applications in one place
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            ➕ Add Application
          </Button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
          <StatCard label="Total" value={stats.total} color="#667eea" icon="📊" />
          <StatCard label="Wishlist" value={stats.wishlist} color="#64748b" icon="⭐" />
          <StatCard label="Applied" value={stats.applied} color="#3b82f6" icon="📤" />
          <StatCard label="Interview" value={stats.interview} color="#f59e0b" icon="🎤" />
          <StatCard label="Offers" value={stats.offer} color="#10b981" icon="🎉" />
          <StatCard label="Rejected" value={stats.rejected} color="#ef4444" icon="❌" />
        </div>
      </div>

      {/* Toolbar */}
      <div style={{
        background: '#f8fafc',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        border: '1px solid #e2e8f0',
      }}>
        {/* View Switcher */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setView('kanban')}
            style={{
              padding: '8px 16px',
              background: view === 'kanban' ? '#667eea' : 'white',
              color: view === 'kanban' ? 'white' : '#64748b',
              border: `1px solid ${view === 'kanban' ? '#667eea' : '#cbd5e1'}`,
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            📋 Kanban
          </button>
          <button
            onClick={() => setView('list')}
            style={{
              padding: '8px 16px',
              background: view === 'list' ? '#667eea' : 'white',
              color: view === 'list' ? 'white' : '#64748b',
              border: `1px solid ${view === 'list' ? '#667eea' : '#cbd5e1'}`,
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            📝 List
          </button>
          <button
            onClick={() => setView('timeline')}
            style={{
              padding: '8px 16px',
              background: view === 'timeline' ? '#667eea' : 'white',
              color: view === 'timeline' ? 'white' : '#64748b',
              border: `1px solid ${view === 'timeline' ? '#667eea' : '#cbd5e1'}`,
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            📅 Timeline
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ApplicationStatus | 'all')}
            style={{
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              fontSize: 13,
              color: '#64748b',
            }}
          >
            <option value="all">All Status</option>
            <option value="wishlist">⭐ Wishlist</option>
            <option value="applied">📤 Applied</option>
            <option value="screening">📞 Screening</option>
            <option value="interview">🎤 Interview</option>
            <option value="offer">🎉 Offer</option>
            <option value="accepted">✅ Accepted</option>
            <option value="rejected">❌ Rejected</option>
            <option value="withdrawn">🚫 Withdrawn</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'company' | 'priority')}
            style={{
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              fontSize: 13,
              color: '#64748b',
            }}
          >
            <option value="date">Sort by Date</option>
            <option value="company">Sort by Company</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>
      </div>

      {/* Views */}
      {view === 'kanban' && (
        <KanbanView
          applications={filteredApps}
          onUpdateStatus={handleUpdateStatus}
          onSelect={setSelectedApp}
        />
      )}

      {view === 'list' && (
        <ListView
          applications={filteredApps}
          onSelect={setSelectedApp}
          onDelete={handleDelete}
        />
      )}

      {view === 'timeline' && (
        <TimelineView applications={filteredApps} onSelect={setSelectedApp} />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddApplicationModal
          onAdd={handleAddApplication}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Detail Modal */}
      {selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          onUpdate={async (updated) => {
            await saveJobApplication(updated);
            await loadApps();
            setSelectedApp(updated);
          }}
          onDelete={() => handleDelete(selectedApp.id)}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div style={{
      background: 'white',
      padding: 16,
      borderRadius: 12,
      border: `2px solid ${color}20`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
        </div>
        <div style={{ fontSize: 32, opacity: 0.5 }}>{icon}</div>
      </div>
    </div>
  );
}

function KanbanView({
  applications,
  onUpdateStatus,
  onSelect,
}: {
  applications: JobApplication[];
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onSelect: (app: JobApplication) => void;
}) {
  const columns: { status: ApplicationStatus; title: string; color: string; icon: string }[] = [
    { status: 'wishlist', title: 'Wishlist', color: '#64748b', icon: '⭐' },
    { status: 'applied', title: 'Applied', color: '#3b82f6', icon: '📤' },
    { status: 'screening', title: 'Screening', color: '#8b5cf6', icon: '📞' },
    { status: 'interview', title: 'Interview', color: '#f59e0b', icon: '🎤' },
    { status: 'offer', title: 'Offer', color: '#10b981', icon: '🎉' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 16,
      alignItems: 'start',
    }}>
      {columns.map(column => {
        const columnApps = applications.filter(app => app.status === column.status);
        
        return (
          <div
            key={column.status}
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 16,
              minHeight: 200,
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: `2px solid ${column.color}20`,
            }}>
              <span style={{ fontSize: 20 }}>{column.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: column.color }}>
                {column.title}
              </span>
              <span style={{
                marginLeft: 'auto',
                background: `${column.color}20`,
                color: column.color,
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
              }}>
                {columnApps.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {columnApps.map(app => (
                <div
                  key={app.id}
                  onClick={() => onSelect(app)}
                  style={{
                    background: '#f8fafc',
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', marginBottom: 4 }}>
                    {app.jobTitle}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                    {app.company}
                  </div>
                  {app.priority && (
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 600,
                      background: app.priority === 'high' ? '#fecaca' : app.priority === 'medium' ? '#fed7aa' : '#e0e7ff',
                      color: app.priority === 'high' ? '#dc2626' : app.priority === 'medium' ? '#ea580c' : '#4f46e5',
                    }}>
                      {app.priority === 'high' ? '🔴' : app.priority === 'medium' ? '🟡' : '🟢'} {app.priority.toUpperCase()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({
  applications,
  onSelect,
  onDelete,
}: {
  applications: JobApplication[];
  onSelect: (app: JobApplication) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Job Title</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Company</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Status</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Priority</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Date</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr
              key={app.id}
              onClick={() => onSelect(app)}
              style={{
                borderBottom: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <td style={{ padding: 16, fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{app.jobTitle}</td>
              <td style={{ padding: 16, fontSize: 14, color: '#64748b' }}>{app.company}</td>
              <td style={{ padding: 16 }}>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  background: getStatusColor(app.status) + '20',
                  color: getStatusColor(app.status),
                }}>
                  {getStatusIcon(app.status)} {app.status}
                </span>
              </td>
              <td style={{ padding: 16 }}>
                {app.priority && (
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {app.priority === 'high' ? '🔴' : app.priority === 'medium' ? '🟡' : '🟢'}
                  </span>
                )}
              </td>
              <td style={{ padding: 16, fontSize: 13, color: '#64748b' }}>
                {new Date(app.createdAt).toLocaleDateString()}
              </td>
              <td style={{ padding: 16 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(app.id);
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#fee',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  🗑️ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TimelineView({
  applications,
  onSelect,
}: {
  applications: JobApplication[];
  onSelect: (app: JobApplication) => void;
}) {
  const sortedApps = [...applications].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {sortedApps.map((app, idx) => (
        <div key={app.id} style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
          {/* Timeline Line */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: getStatusColor(app.status),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}>
              {getStatusIcon(app.status)}
            </div>
            {idx < sortedApps.length - 1 && (
              <div style={{
                width: 2,
                flex: 1,
                background: '#e2e8f0',
                minHeight: 40,
              }} />
            )}
          </div>

          {/* Content */}
          <div
            onClick={() => onSelect(app)}
            style={{
              flex: 1,
              background: 'white',
              padding: 20,
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                  {app.jobTitle}
                </div>
                <div style={{ fontSize: 14, color: '#64748b' }}>
                  {app.company}
                </div>
              </div>
              <span style={{
                padding: '4px 12px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
                background: getStatusColor(app.status) + '20',
                color: getStatusColor(app.status),
              }}>
                {app.status}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              {new Date(app.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AddApplicationModal({
  onAdd,
  onClose,
}: {
  onAdd: (app: JobApplication) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Partial<JobApplication>>({
    jobTitle: '',
    company: '',
    status: 'wishlist',
    priority: 'medium',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const app: JobApplication = {
      id: crypto.randomUUID(),
      jobTitle: formData.jobTitle || '',
      company: formData.company || '',
      location: formData.location,
      salary: formData.salary,
      jobType: formData.jobType,
      jobDescription: formData.jobDescription,
      jobUrl: formData.jobUrl,
      status: formData.status || 'wishlist',
      priority: formData.priority,
      notes: formData.notes,
      timeline: [],
      interviews: [],
      documents: [],
      reminders: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAdd(app);
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20,
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        maxWidth: 600,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: 24, color: '#1e293b' }}>
            ➕ Add Job Application
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 8,
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1e293b', marginBottom: 8 }}>
                Job Title *
              </label>
              <input
                type="text"
                value={formData.jobTitle || ''}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1e293b', marginBottom: 8 }}>
                Company *
              </label>
              <input
                type="text"
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1e293b', marginBottom: 8 }}>
                  Status
                </label>
                <select
                  value={formData.status || 'wishlist'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                >
                  <option value="wishlist">⭐ Wishlist</option>
                  <option value="applied">📤 Applied</option>
                  <option value="screening">📞 Screening</option>
                  <option value="interview">🎤 Interview</option>
                  <option value="offer">🎉 Offer</option>
                  <option value="accepted">✅ Accepted</option>
                  <option value="rejected">❌ Rejected</option>
                  <option value="withdrawn">🚫 Withdrawn</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1e293b', marginBottom: 8 }}>
                  Priority
                </label>
                <select
                  value={formData.priority || 'medium'}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1e293b', marginBottom: 8 }}>
                Job URL
              </label>
              <input
                type="url"
                value={formData.jobUrl || ''}
                onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1e293b', marginBottom: 8 }}>
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
              <Button variant="ghost" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add Application
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApplicationDetailModal({
  application,
  onUpdate,
  onDelete,
  onClose,
}: {
  application: JobApplication;
  onUpdate: (app: JobApplication) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(application);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20,
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        maxWidth: 700,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, color: '#1e293b' }}>
              {application.jobTitle}
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
              {application.company}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 8,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 32 }}>
          {!editMode ? (
            <>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Status</div>
                <span style={{
                  padding: '6px 16px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  background: getStatusColor(application.status) + '20',
                  color: getStatusColor(application.status),
                }}>
                  {getStatusIcon(application.status)} {application.status}
                </span>
              </div>

              {application.jobUrl && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Job URL</div>
                  <a href={application.jobUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
                    {application.jobUrl}
                  </a>
                </div>
              )}

              {application.notes && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Notes</div>
                  <div style={{ fontSize: 14, color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                    {application.notes}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <Button variant="primary" onClick={() => setEditMode(true)}>
                  ✏️ Edit
                </Button>
                <Button variant="ghost" onClick={onDelete} style={{ color: '#dc2626' }}>
                  🗑️ Delete
                </Button>
              </div>
            </>
          ) : (
            <form onSubmit={(e) => {
              e.preventDefault();
              onUpdate(formData);
              setEditMode(false);
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1e293b', marginBottom: 8 }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  >
                    <option value="wishlist">⭐ Wishlist</option>
                    <option value="applied">📤 Applied</option>
                    <option value="screening">📞 Screening</option>
                    <option value="interview">🎤 Interview</option>
                    <option value="offer">🎉 Offer</option>
                    <option value="accepted">✅ Accepted</option>
                    <option value="rejected">❌ Rejected</option>
                    <option value="withdrawn">🚫 Withdrawn</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1e293b', marginBottom: 8 }}>
                    Notes
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={6}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      fontSize: 14,
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <Button variant="ghost" onClick={() => setEditMode(false)} type="button">
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: ApplicationStatus): string {
  const colors: Record<ApplicationStatus, string> = {
    wishlist: '#64748b',
    applied: '#3b82f6',
    screening: '#8b5cf6',
    interview: '#f59e0b',
    offer: '#10b981',
    accepted: '#059669',
    rejected: '#ef4444',
    withdrawn: '#6b7280',
  };
  return colors[status] || '#64748b';
}

function getStatusIcon(status: ApplicationStatus): string {
  const icons: Record<ApplicationStatus, string> = {
    wishlist: '⭐',
    applied: '📤',
    screening: '📞',
    interview: '🎤',
    offer: '🎉',
    accepted: '✅',
    rejected: '❌',
    withdrawn: '🚫',
  };
  return icons[status] || '📋';
}
