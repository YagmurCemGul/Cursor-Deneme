import React, { useState, useEffect } from 'react';
import { CVProfile, CVTemplate } from '../types';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';

interface ProfileManagerProps {
  onLoadProfile: (profile: CVProfile) => void;
  onSaveProfile: (name: string) => void;
  currentProfileName: string;
  onProfileNameChange: (name: string) => void;
  language: Lang;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  onLoadProfile,
  onSaveProfile,
  currentProfileName,
  onProfileNameChange,
  language
}) => {
  const [profiles, setProfiles] = useState<CVProfile[]>([]);
  const [, setTemplates] = useState<CVTemplate[]>([]);
  const [, setIsEditingName] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [loadedProfiles, loadedTemplates] = await Promise.all([
      StorageService.getProfiles(),
      StorageService.getTemplates()
    ]);
    setProfiles(loadedProfiles);
    setTemplates(loadedTemplates);
  };

  const handleSaveProfile = async () => {
    onSaveProfile(currentProfileName || 'Untitled Profile');
    await loadData();
    setIsEditingName(false);
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (confirm(t(language, 'profile.deleteConfirm'))) {
      await StorageService.deleteProfile(profileId);
      await loadData();
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">
        💾 {t(language, 'profile.section')}
      </h2>
      
      {/* Current Profile */}
      <div className="card current-profile-card">
        <h3 className="card-subtitle">
          {t(language, 'profile.current')}
        </h3>
        
        <div className="form-group">
          <label className="form-label">{t(language, 'profile.name')}</label>
          <div className="profile-name-input-group">
            <input
              type="text"
              className="form-input flex-input"
              value={currentProfileName}
              onChange={(e) => onProfileNameChange(e.target.value)}
              placeholder={t(language, 'profile.namePlaceholder')}
            />
            <button className="btn btn-success" onClick={handleSaveProfile}>
              💾 {t(language, 'profile.save')}
            </button>
          </div>
        </div>
      </div>
      
      {/* Saved Profiles */}
      {profiles.length > 0 && (
        <div>
          <h3 className="subsection-title">
            {t(language, 'profile.saved')}
          </h3>
          
          <div className="card-list">
            {profiles.map(profile => (
              <div key={profile.id} className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">{profile.name}</div>
                    <div className="card-meta">
                      {t(language, 'profile.updated')}: {new Date(profile.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn btn-primary btn-icon"
                      onClick={() => onLoadProfile(profile)}
                    >
                      📂 {t(language, 'profile.load')}
                    </button>
                    <button
                      className="btn btn-danger btn-icon"
                      onClick={() => handleDeleteProfile(profile.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {profiles.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">💾</div>
          <div className="empty-state-text">
            {t(language, 'profile.emptyState')}
          </div>
        </div>
      )}
    </div>
  );
};
