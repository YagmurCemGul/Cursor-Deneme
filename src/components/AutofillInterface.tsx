import React, { useState, useEffect } from 'react';
import { ResumeProfile } from '../lib/types';

interface FieldItem {
  id: string;
  label: string;
  value: string | undefined;
  visible: boolean;
}

interface AutofillInterfaceProps {
  profile: ResumeProfile | undefined;
  onAutofill: (fields: FieldItem[]) => void;
}

export function AutofillInterface({ profile, onAutofill }: AutofillInterfaceProps) {
  const [fields, setFields] = useState<FieldItem[]>([]);

  useEffect(() => {
    setFields([
      { id: 'firstName', label: 'First Name', value: profile?.personal.firstName, visible: true },
      { id: 'lastName', label: 'Last Name', value: profile?.personal.lastName, visible: true },
      { id: 'email', label: 'Email', value: profile?.personal.email, visible: true },
      { id: 'phone', label: 'Phone Number', value: profile?.personal.phone, visible: true },
      { id: 'location', label: 'Location', value: profile?.personal.location, visible: true },
      { id: 'linkedin', label: 'LinkedIn Profile', value: profile?.personal.linkedin ? `https://www.linkedin.com/in/${profile.personal.linkedin}` : undefined, visible: true },
      { id: 'github', label: 'GitHub Profile', value: profile?.personal.github ? `https://github.com/${profile.personal.github}` : undefined, visible: true },
      { id: 'portfolio', label: 'Personal Website', value: profile?.personal.portfolio, visible: true },
    ]);
  }, [profile]);

  const toggleVisibility = (id: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, visible: !f.visible } : f));
  };

  const handleAutofill = () => {
    onAutofill(fields.filter(f => f.visible && f.value));
  };

  return (
    <div className="autofill-container">
      {/* Header */}
      <div className="autofill-header">
        <div className="autofill-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" fill="#4FC3F7"/>
            <circle cx="12" cy="13" r="3" fill="white"/>
            <circle cx="20" cy="13" r="3" fill="white"/>
            <circle cx="12" cy="13" r="1.5" fill="#333"/>
            <circle cx="20" cy="13" r="1.5" fill="#333"/>
            <path d="M10 20C10 18 12 16 16 16C20 16 22 18 22 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="autofill-title">OwlApply</span>
        </div>
        <div className="autofill-controls">
          <button className="icon-btn" title="Play">▶</button>
          <button className="icon-btn" title="Refresh">↻</button>
          <button className="icon-btn" title="Dark mode">🌙</button>
          <button className="icon-btn" title="Undo">↶</button>
          <button className="icon-btn" title="Redo">↷</button>
          <button className="icon-btn" title="Forward">→</button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="autofill-banner">
        Save your time by autofilling this application
      </div>

      {/* Fields Table */}
      <div className="autofill-table">
        <div className="autofill-table-header">
          <div className="autofill-table-cell">Field</div>
          <div className="autofill-table-cell">Status</div>
        </div>

        <div className="autofill-fields-list">
          {fields.map(field => (
            <div key={field.id} className="autofill-field-row">
              <div className="autofill-field-name">{field.label}</div>
              <div className="autofill-field-status">
                <button 
                  className={`autofill-eye-btn ${field.visible ? 'visible' : 'hidden'}`}
                  onClick={() => toggleVisibility(field.id)}
                  title={field.visible ? 'Hide' : 'Show'}
                >
                  {field.visible ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
                <div className={`autofill-status-indicator ${field.value ? 'filled' : 'empty'}`}>
                  {field.value ? '●' : '○'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="autofill-footer">
        <div className="autofill-nav">
          <button className="nav-icon">🏠</button>
          <button className="nav-icon">📋</button>
          <button className="nav-icon">✉️</button>
          <button className="nav-icon">💬</button>
          <button className="nav-icon">👤</button>
        </div>
        <button className="autofill-action-btn" onClick={handleAutofill}>
          Autofill For Me!
        </button>
      </div>
    </div>
  );
}
