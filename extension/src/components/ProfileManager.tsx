import React, { useState, useEffect } from 'react';
import { ResumeProfile } from '../lib/types';
import { PROFILE_TEMPLATES, createProfileFromTemplate, duplicateProfile, compareProfiles } from '../lib/profileTemplates';
import { storage } from '../lib/storage';
import { Button } from './ui';

interface ProfileManagerProps {
  currentProfile?: ResumeProfile;
  onSelectProfile: (profile: ResumeProfile) => void;
  onClose: () => void;
}

export function ProfileManager({ currentProfile, onSelectProfile, onClose }: ProfileManagerProps) {
  const [profiles, setProfiles] = useState<ResumeProfile[]>([]);
  const [view, setView] = useState<'list' | 'templates' | 'compare'>('list');
  const [selectedForCompare, setSelectedForCompare] = useState<ResumeProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    const allProfiles = await storage.get<ResumeProfile[]>(storage.keys.PROFILES) || [];
    setProfiles(allProfiles);
  }

  async function handleCreateFromTemplate(templateId: string) {
    const template = PROFILE_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const newProfile = createProfileFromTemplate(template, currentProfile?.personal);
    const allProfiles = [...profiles, newProfile];
    
    await storage.set(storage.keys.PROFILES, allProfiles);
    await storage.set(storage.keys.ACTIVE_PROFILE_ID, newProfile.id);
    
    onSelectProfile(newProfile);
    onClose();
  }

  async function handleDuplicate(profile: ResumeProfile) {
    const duplicated = duplicateProfile(profile);
    const allProfiles = [...profiles, duplicated];
    
    await storage.set(storage.keys.PROFILES, allProfiles);
    await loadProfiles();
  }

  async function handleDelete(profileId: string) {
    if (profiles.length <= 1) {
      alert('Cannot delete the last profile');
      return;
    }

    if (!confirm('Are you sure you want to delete this profile?')) return;

    const filtered = profiles.filter(p => p.id !== profileId);
    await storage.set(storage.keys.PROFILES, filtered);
    
    if (currentProfile?.id === profileId) {
      await storage.set(storage.keys.ACTIVE_PROFILE_ID, filtered[0].id);
      onSelectProfile(filtered[0]);
    }
    
    await loadProfiles();
  }

  async function handleRename(profile: ResumeProfile, newName: string) {
    const updated = { ...profile, profileName: newName };
    const allProfiles = profiles.map(p => p.id === profile.id ? updated : p);
    
    await storage.set(storage.keys.PROFILES, allProfiles);
    if (currentProfile?.id === profile.id) {
      onSelectProfile(updated);
    }
    await loadProfiles();
  }

  const filteredProfiles = profiles.filter(p => 
    p.profileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.personal.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        maxWidth: 900,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, color: '#1e293b' }}>
              👥 Profile Manager
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
              Manage multiple CV profiles for different job applications
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

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '16px 32px',
          borderBottom: '1px solid #e5e7eb',
        }}>
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
            📋 My Profiles ({profiles.length})
          </button>
          <button
            onClick={() => setView('templates')}
            style={{
              padding: '8px 16px',
              background: view === 'templates' ? '#667eea' : 'white',
              color: view === 'templates' ? 'white' : '#64748b',
              border: `1px solid ${view === 'templates' ? '#667eea' : '#cbd5e1'}`,
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            ✨ Create from Template
          </button>
          <button
            onClick={() => setView('compare')}
            style={{
              padding: '8px 16px',
              background: view === 'compare' ? '#667eea' : 'white',
              color: view === 'compare' ? 'white' : '#64748b',
              border: `1px solid ${view === 'compare' ? '#667eea' : '#cbd5e1'}`,
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            ⚖️ Compare Profiles
          </button>
        </div>

        <div style={{ padding: 32 }}>
          {/* List View */}
          {view === 'list' && (
            <div>
              {/* Search */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search profiles..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  fontSize: 14,
                  marginBottom: 16,
                }}
              />

              <div style={{ display: 'grid', gap: 12 }}>
                {filteredProfiles.map(profile => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    isActive={currentProfile?.id === profile.id}
                    onSelect={() => {
                      storage.set(storage.keys.ACTIVE_PROFILE_ID, profile.id);
                      onSelectProfile(profile);
                      onClose();
                    }}
                    onDuplicate={() => handleDuplicate(profile)}
                    onDelete={() => handleDelete(profile.id)}
                    onRename={(newName) => handleRename(profile, newName)}
                  />
                ))}
              </div>

              {filteredProfiles.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: 40,
                  color: '#64748b',
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                  <div style={{ fontSize: 16, marginBottom: 8 }}>No profiles found</div>
                  <div style={{ fontSize: 14 }}>
                    {searchQuery ? 'Try a different search term' : 'Create a new profile from template'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Templates View */}
          {view === 'templates' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#1e293b' }}>
                  Choose a Template
                </h3>
                <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
                  Start with pre-filled skills and experience for your role
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: 16,
              }}>
                {PROFILE_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleCreateFromTemplate(template.id)}
                    style={{
                      background: 'white',
                      border: '2px solid #e2e8f0',
                      borderRadius: 12,
                      padding: 20,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102,126,234,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontSize: 40, marginBottom: 12 }}>{template.icon}</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                      {template.name}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                      {template.description}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      {template.defaultSkills.length} skills included
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Compare View */}
          {view === 'compare' && (
            <CompareView
              profiles={profiles}
              selectedProfiles={selectedForCompare}
              onSelectProfile={(profile) => {
                if (selectedForCompare.includes(profile)) {
                  setSelectedForCompare(selectedForCompare.filter(p => p.id !== profile.id));
                } else if (selectedForCompare.length < 2) {
                  setSelectedForCompare([...selectedForCompare, profile]);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileCard({
  profile,
  isActive,
  onSelect,
  onDuplicate,
  onDelete,
  onRename,
}: {
  profile: ResumeProfile;
  isActive: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.profileName);

  const completeness = Math.round(
    (profile.personal.firstName && profile.personal.lastName && profile.personal.email ? 30 : 0) +
    (profile.skills.length >= 5 ? 20 : (profile.skills.length / 5) * 20) +
    (profile.experience.length >= 2 ? 25 : (profile.experience.length / 2) * 25) +
    (profile.education.length >= 1 ? 15 : 0) +
    (profile.projects.length >= 1 ? 10 : 0)
  );

  return (
    <div style={{
      background: isActive ? '#f0f9ff' : 'white',
      border: `2px solid ${isActive ? '#667eea' : '#e2e8f0'}`,
      borderRadius: 12,
      padding: 16,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
      transition: 'all 0.2s',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={() => {
              if (editName.trim()) {
                onRename(editName.trim());
              }
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (editName.trim()) {
                  onRename(editName.trim());
                }
                setIsEditing(false);
              }
            }}
            autoFocus
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #667eea',
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 600,
            }}
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#1e293b',
              cursor: 'pointer',
              marginBottom: 4,
            }}
          >
            {profile.profileName}
            {isActive && (
              <span style={{
                marginLeft: 8,
                padding: '2px 8px',
                background: '#667eea',
                color: 'white',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
              }}>
                ACTIVE
              </span>
            )}
          </div>
        )}
        
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
          {profile.personal.email || 'No email set'}
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#94a3b8' }}>
          <span>💼 {profile.experience.length} exp</span>
          <span>🎓 {profile.education.length} edu</span>
          <span>⚡ {profile.skills.length} skills</span>
        </div>

        {/* Completeness Bar */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Completeness</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: completeness === 100 ? '#10b981' : '#667eea' }}>
              {completeness}%
            </span>
          </div>
          <div style={{ width: '100%', height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              width: `${completeness}%`,
              height: '100%',
              background: completeness === 100 ? '#10b981' : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {!isActive && (
          <button
            onClick={onSelect}
            style={{
              padding: '8px 16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Switch
          </button>
        )}
        <button
          onClick={onDuplicate}
          style={{
            padding: '8px 12px',
            background: '#f8fafc',
            color: '#64748b',
            border: '1px solid #cbd5e1',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
          }}
          title="Duplicate"
        >
          📋
        </button>
        <button
          onClick={onDelete}
          style={{
            padding: '8px 12px',
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fca5a5',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
          }}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

function CompareView({
  profiles,
  selectedProfiles,
  onSelectProfile,
}: {
  profiles: ResumeProfile[];
  selectedProfiles: ResumeProfile[];
  onSelectProfile: (profile: ResumeProfile) => void;
}) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#1e293b' }}>
          Compare Profiles
        </h3>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
          Select 2 profiles to compare their skills, experience, and completeness
        </p>
      </div>

      {/* Selection */}
      {selectedProfiles.length < 2 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#1e293b', marginBottom: 12 }}>
            Select profiles to compare ({selectedProfiles.length}/2)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {profiles.map(profile => (
              <button
                key={profile.id}
                onClick={() => onSelectProfile(profile)}
                disabled={selectedProfiles.includes(profile)}
                style={{
                  padding: 16,
                  background: selectedProfiles.includes(profile) ? '#667eea' : 'white',
                  color: selectedProfiles.includes(profile) ? 'white' : '#1e293b',
                  border: `2px solid ${selectedProfiles.includes(profile) ? '#667eea' : '#e2e8f0'}`,
                  borderRadius: 8,
                  cursor: selectedProfiles.includes(profile) ? 'default' : 'pointer',
                  textAlign: 'left',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {profile.profileName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comparison */}
      {selectedProfiles.length === 2 && (
        <div>
          <button
            onClick={() => onSelectProfile(selectedProfiles[0])}
            style={{
              marginBottom: 24,
              padding: '8px 16px',
              background: '#f8fafc',
              color: '#64748b',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            ← Change Selection
          </button>

          <ComparisonResult profile1={selectedProfiles[0]} profile2={selectedProfiles[1]} />
        </div>
      )}
    </div>
  );
}

function ComparisonResult({ profile1, profile2 }: { profile1: ResumeProfile; profile2: ResumeProfile }) {
  const comparison = compareProfiles(profile1, profile2);

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{
          padding: 20,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 12,
        }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{profile1.profileName}</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>{profile1.personal.email}</div>
        </div>
        <div style={{
          padding: 20,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          borderRadius: 12,
        }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{profile2.profileName}</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>{profile2.personal.email}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <CompareCard label="Skills" value1={profile1.skills.length} value2={profile2.skills.length} />
        <CompareCard label="Experience" value1={comparison.experience.profile1Count} value2={comparison.experience.profile2Count} />
        <CompareCard label="Education" value1={comparison.education.profile1Count} value2={comparison.education.profile2Count} />
        <CompareCard label="Completeness" value1={comparison.completeness.profile1} value2={comparison.completeness.profile2} suffix="%" />
      </div>

      {/* Skills Comparison */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
        <h4 style={{ margin: '0 0 16px', fontSize: 16, color: '#1e293b' }}>Skills Comparison</h4>
        
        <div style={{ display: 'grid', gap: 16 }}>
          {comparison.skills.common.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
                Common Skills ({comparison.skills.common.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {comparison.skills.common.map((skill, i) => (
                  <span key={i} style={{
                    padding: '4px 10px',
                    background: '#f0fdf4',
                    color: '#16a34a',
                    borderRadius: 6,
                    fontSize: 12,
                    border: '1px solid #bbf7d0',
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {comparison.skills.profile1Only.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#667eea', marginBottom: 8 }}>
                Only in {profile1.profileName} ({comparison.skills.profile1Only.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {comparison.skills.profile1Only.map((skill, i) => (
                  <span key={i} style={{
                    padding: '4px 10px',
                    background: '#f0f9ff',
                    color: '#667eea',
                    borderRadius: 6,
                    fontSize: 12,
                    border: '1px solid #bfdbfe',
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {comparison.skills.profile2Only.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f5576c', marginBottom: 8 }}>
                Only in {profile2.profileName} ({comparison.skills.profile2Only.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {comparison.skills.profile2Only.map((skill, i) => (
                  <span key={i} style={{
                    padding: '4px 10px',
                    background: '#fef2f2',
                    color: '#f5576c',
                    borderRadius: 6,
                    fontSize: 12,
                    border: '1px solid #fecaca',
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CompareCard({
  label,
  value1,
  value2,
  suffix = '',
}: {
  label: string;
  value1: number;
  value2: number;
  suffix?: string;
}) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: 16,
    }}>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          fontSize: 24,
          fontWeight: 700,
          color: value1 > value2 ? '#10b981' : value1 < value2 ? '#94a3b8' : '#667eea',
        }}>
          {value1}{suffix}
        </div>
        <div style={{ fontSize: 20, color: '#cbd5e1' }}>vs</div>
        <div style={{
          fontSize: 24,
          fontWeight: 700,
          color: value2 > value1 ? '#10b981' : value2 < value1 ? '#94a3b8' : '#667eea',
        }}>
          {value2}{suffix}
        </div>
      </div>
    </div>
  );
}
