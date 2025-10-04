import React, { useState, useEffect } from 'react';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';
import { JobApplication, TemplateSuccessMetrics } from '../types';

interface JobApplicationTrackerProps {
  templateId?: string;
  language: Lang;
  onClose: () => void;
}

export const JobApplicationTracker: React.FC<JobApplicationTrackerProps> = ({
  templateId,
  language,
  onClose,
}) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [successMetrics, setSuccessMetrics] = useState<TemplateSuccessMetrics | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    industry: '',
    appliedDate: new Date().toISOString().split('T')[0],
    status: 'applied' as JobApplication['status'],
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [templateId]);

  const loadData = async () => {
    const apps = await StorageService.getJobApplications(templateId);
    setApplications(apps);

    if (templateId) {
      const metrics = await StorageService.getTemplateSuccessMetrics(templateId);
      setSuccessMetrics(metrics);
    }
  };

  const resetForm = () => {
    setFormData({
      jobTitle: '',
      company: '',
      industry: '',
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'applied',
      notes: ''
    });
    setEditingApp(null);
  };

  const handleSubmit = async () => {
    if (!formData.jobTitle || !formData.company || !formData.industry) {
      alert(t(language, 'jobTracker.fillRequired'));
      return;
    }

    const application: JobApplication = {
      id: editingApp?.id || Date.now().toString(),
      templateId: templateId || 'general',
      jobTitle: formData.jobTitle,
      company: formData.company,
      industry: formData.industry,
      appliedDate: formData.appliedDate,
      status: formData.status,
      statusDate: new Date().toISOString(),
      notes: formData.notes
    };

    await StorageService.saveJobApplication(application);
    
    resetForm();
    setShowAddForm(false);
    await loadData();
  };

  const handleUpdateStatus = async (appId: string, newStatus: JobApplication['status']) => {
    await StorageService.updateJobApplicationStatus(appId, newStatus);
    await loadData();
  };

  const handleEdit = (app: JobApplication) => {
    setEditingApp(app);
    setFormData({
      jobTitle: app.jobTitle,
      company: app.company,
      industry: app.industry,
      appliedDate: app.appliedDate,
      status: app.status,
      notes: app.notes || ''
    });
    setShowAddForm(true);
  };

  const getStatusColor = (status: JobApplication['status']): string => {
    const colors: Record<JobApplication['status'], string> = {
      'applied': '#3b82f6',
      'screening': '#8b5cf6',
      'interview': '#f59e0b',
      'offer': '#10b981',
      'accepted': '#059669',
      'rejected': '#ef4444',
      'withdrawn': '#6b7280'
    };
    return colors[status];
  };

  const getStatusIcon = (status: JobApplication['status']): string => {
    const icons: Record<JobApplication['status'], string> = {
      'applied': '📝',
      'screening': '🔍',
      'interview': '🗣️',
      'offer': '🎉',
      'accepted': '✅',
      'rejected': '❌',
      'withdrawn': '↩️'
    };
    return icons[status];
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content job-tracker-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>💼 {t(language, 'jobTracker.title')}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Success Metrics */}
          {successMetrics && (
            <div className="success-metrics">
              <h4>{t(language, 'jobTracker.successMetrics')}</h4>
              <div className="metrics-grid">
                <div className="metric-card">
                  <span className="metric-label">{t(language, 'jobTracker.totalApplications')}</span>
                  <span className="metric-value">{successMetrics.totalApplications}</span>
                </div>
                <div className="metric-card">
                  <span className="metric-label">{t(language, 'jobTracker.interviewRate')}</span>
                  <span className="metric-value">{successMetrics.interviewRate.toFixed(1)}%</span>
                </div>
                <div className="metric-card">
                  <span className="metric-label">{t(language, 'jobTracker.offerRate')}</span>
                  <span className="metric-value">{successMetrics.offerRate.toFixed(1)}%</span>
                </div>
                <div className="metric-card">
                  <span className="metric-label">{t(language, 'jobTracker.acceptanceRate')}</span>
                  <span className="metric-value">{successMetrics.acceptanceRate.toFixed(1)}%</span>
                </div>
              </div>

              {successMetrics.topIndustries.length > 0 && (
                <div className="top-industries">
                  <strong>{t(language, 'jobTracker.topIndustries')}:</strong>{' '}
                  {successMetrics.topIndustries.join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Add Application Button */}
          <div className="tracker-header">
            <h4>{t(language, 'jobTracker.applications')} ({applications.length})</h4>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                resetForm();
                setShowAddForm(!showAddForm);
              }}
            >
              {showAddForm ? t(language, 'common.cancel') : t(language, 'jobTracker.addApplication')}
            </button>
          </div>

          {/* Add/Edit Application Form */}
          {showAddForm && (
            <div className="add-application-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="job-title">{t(language, 'jobTracker.jobTitle')}*</label>
                  <input
                    id="job-title"
                    type="text"
                    className="form-control"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder={t(language, 'jobTracker.jobTitlePlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="company">{t(language, 'jobTracker.company')}*</label>
                  <input
                    id="company"
                    type="text"
                    className="form-control"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder={t(language, 'jobTracker.companyPlaceholder')}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="industry">{t(language, 'jobTracker.industry')}*</label>
                  <input
                    id="industry"
                    type="text"
                    className="form-control"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder={t(language, 'jobTracker.industryPlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="applied-date">{t(language, 'jobTracker.appliedDate')}</label>
                  <input
                    id="applied-date"
                    type="date"
                    className="form-control"
                    value={formData.appliedDate}
                    onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">{t(language, 'jobTracker.status')}</label>
                  <select
                    id="status"
                    className="form-control"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as JobApplication['status'] })}
                  >
                    <option value="applied">{t(language, 'jobTracker.statusApplied')}</option>
                    <option value="screening">{t(language, 'jobTracker.statusScreening')}</option>
                    <option value="interview">{t(language, 'jobTracker.statusInterview')}</option>
                    <option value="offer">{t(language, 'jobTracker.statusOffer')}</option>
                    <option value="accepted">{t(language, 'jobTracker.statusAccepted')}</option>
                    <option value="rejected">{t(language, 'jobTracker.statusRejected')}</option>
                    <option value="withdrawn">{t(language, 'jobTracker.statusWithdrawn')}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">{t(language, 'jobTracker.notes')}</label>
                <textarea
                  id="notes"
                  className="form-control"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t(language, 'jobTracker.notesPlaceholder')}
                />
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleSubmit}>
                  {editingApp ? t(language, 'common.save') : t(language, 'jobTracker.addApplication')}
                </button>
                <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                  {t(language, 'common.cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Applications List */}
          <div className="applications-list">
            {applications.length === 0 ? (
              <div className="no-applications">
                <p>{t(language, 'jobTracker.noApplications')}</p>
                <p>{t(language, 'jobTracker.startTracking')}</p>
              </div>
            ) : (
              applications.map(app => (
                <div key={app.id} className="application-card">
                  <div className="application-header">
                    <div className="application-title">
                      <h5>{app.jobTitle}</h5>
                      <p className="company-name">{app.company}</p>
                    </div>
                    <div className="application-status" style={{ backgroundColor: getStatusColor(app.status) }}>
                      {getStatusIcon(app.status)} {t(language, `jobTracker.status${app.status.charAt(0).toUpperCase() + app.status.slice(1)}`)}
                    </div>
                  </div>

                  <div className="application-details">
                    <span className="detail-item">
                      <strong>{t(language, 'jobTracker.industry')}:</strong> {app.industry}
                    </span>
                    <span className="detail-item">
                      <strong>{t(language, 'jobTracker.applied')}:</strong> {new Date(app.appliedDate).toLocaleDateString()}
                    </span>
                  </div>

                  {app.notes && (
                    <div className="application-notes">
                      <strong>{t(language, 'jobTracker.notes')}:</strong>
                      <p>{app.notes}</p>
                    </div>
                  )}

                  <div className="application-actions">
                    <select
                      className="status-select"
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app.id, e.target.value as JobApplication['status'])}
                    >
                      <option value="applied">{t(language, 'jobTracker.statusApplied')}</option>
                      <option value="screening">{t(language, 'jobTracker.statusScreening')}</option>
                      <option value="interview">{t(language, 'jobTracker.statusInterview')}</option>
                      <option value="offer">{t(language, 'jobTracker.statusOffer')}</option>
                      <option value="accepted">{t(language, 'jobTracker.statusAccepted')}</option>
                      <option value="rejected">{t(language, 'jobTracker.statusRejected')}</option>
                      <option value="withdrawn">{t(language, 'jobTracker.statusWithdrawn')}</option>
                    </select>
                    <button className="btn-link" onClick={() => handleEdit(app)}>
                      ✏️ {t(language, 'common.edit')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {t(language, 'common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
