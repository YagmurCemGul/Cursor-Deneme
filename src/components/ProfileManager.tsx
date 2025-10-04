import React, { useState, useEffect } from 'react';
import { CVProfile, CVTemplate } from '../types';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';
import { CVTemplateManager } from './CVTemplateManager';

interface ProfileManagerProps {
  onLoadProfile: (profile: CVProfile) => void;
  onSaveProfile: (name: string) => void;
  currentProfileName: string;
  onProfileNameChange: (name: string) => void;
  language: Lang;
  currentTemplateId?: string;
  onTemplateChange?: (templateId: string) => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  onLoadProfile,
  onSaveProfile,
  currentProfileName,
  onProfileNameChange,
  language,
  currentTemplateId,
  onTemplateChange,
}) => {
  const [profiles, setProfiles] = useState<CVProfile[]>([]);
  const [, setTemplates] = useState<CVTemplate[]>([]);
  const [, setIsEditingName] = useState(false);
  const [activeTab, setActiveTab] = useState<'profiles' | 'templates'>('profiles');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [loadedProfiles, loadedTemplates] = await Promise.all([
      StorageService.getProfiles(),
      StorageService.getTemplates(),
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

  const handleExportProfile = (profile: CVProfile) => {
    const dataStr = JSON.stringify(profile, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAllProfiles = () => {
    if (profiles.length === 0) {
      alert(language === 'en' ? 'No profiles to export' : 'Dışa aktarılacak profil yok');
      return;
    }
    const dataStr = JSON.stringify(profiles, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all_profiles_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProfiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Check if it's a single profile or array of profiles
      const profilesToImport = Array.isArray(data) ? data : [data];
      
      // Validate profiles
      for (const profile of profilesToImport) {
        if (!profile.name || !profile.data) {
          throw new Error('Invalid profile format');
        }
        // Generate new ID to avoid conflicts
        profile.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        profile.createdAt = new Date().toISOString();
        profile.updatedAt = new Date().toISOString();
        
        await StorageService.saveProfile(profile);
      }
      
      await loadData();
      alert(
        language === 'en' 
          ? `Successfully imported ${profilesToImport.length} profile(s)` 
          : `${profilesToImport.length} profil başarıyla içe aktarıldı`
      );
    } catch (error) {
      console.error('Import error:', error);
      alert(
        language === 'en' 
          ? 'Failed to import profiles. Please check the file format.' 
          : 'Profil içe aktarma başarısız. Lütfen dosya formatını kontrol edin.'
      );
    }
    
    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="section">
      <h2 className="section-title">💾 {t(language, 'profile.section')}</h2>

      {/* Tabs */}
      <div className="subtabs">
        <button
          className={`subtab ${activeTab === 'profiles' ? 'active' : ''}`}
          onClick={() => setActiveTab('profiles')}
        >
          💾 {t(language, 'tabs.profiles')}
        </button>
        <button
          className={`subtab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          🎨 {t(language, 'templates.title')}
        </button>
      </div>

      {activeTab === 'profiles' && (
        <>
          {/* Current Profile */}
          <div className="card current-profile-card">
            <h3 className="card-subtitle">{t(language, 'profile.current')}</h3>

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

          {/* Import/Export Section */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 className="card-subtitle">
              {language === 'en' ? '📦 Import/Export' : '📦 İçe/Dışa Aktar'}
            </h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={handleExportAllProfiles}
                disabled={profiles.length === 0}
                style={{ flex: '1 1 auto' }}
              >
                📤 {language === 'en' ? 'Export All Profiles' : 'Tüm Profilleri Dışa Aktar'}
              </button>
              <label 
                className="btn btn-secondary" 
                style={{ flex: '1 1 auto', cursor: 'pointer', margin: 0 }}
              >
                📥 {language === 'en' ? 'Import Profiles' : 'Profilleri İçe Aktar'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportProfiles}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Saved Profiles */}
          {profiles.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 className="subsection-title" style={{ margin: 0 }}>{t(language, 'profile.saved')}</h3>
                <input
                  type="text"
                  className="form-input"
                  placeholder={language === 'en' ? '🔍 Search profiles...' : '🔍 Profil ara...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ maxWidth: '250px' }}
                />
              </div>

              <div className="card-list">
                {profiles
                  .filter(profile => 
                    searchQuery.trim() === '' || 
                    profile.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((profile) => (
                  <div key={profile.id} className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">{profile.name}</div>
                        <div className="card-meta">
                          {t(language, 'profile.updated')}:{' '}
                          {new Date(profile.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="card-actions">
                        <button
                          className="btn btn-primary btn-icon"
                          onClick={() => onLoadProfile(profile)}
                          title={t(language, 'profile.load')}
                        >
                          📂 {t(language, 'profile.load')}
                        </button>
                        <button
                          className="btn btn-secondary btn-icon"
                          onClick={() => handleExportProfile(profile)}
                          title={language === 'en' ? 'Export' : 'Dışa Aktar'}
                        >
                          📤
                        </button>
                        <button
                          className="btn btn-danger btn-icon"
                          onClick={() => handleDeleteProfile(profile.id)}
                          title={language === 'en' ? 'Delete' : 'Sil'}
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
              <div className="empty-state-text">{t(language, 'profile.emptyState')}</div>
            </div>
          )}
        </>
      )}

      {activeTab === 'templates' && onTemplateChange && (
        <CVTemplateManager
          language={language}
          onSelectTemplate={onTemplateChange}
          currentTemplateId={currentTemplateId}
        />
      )}
    </div>
  );
};
