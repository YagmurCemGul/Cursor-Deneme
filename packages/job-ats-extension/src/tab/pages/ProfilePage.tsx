import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { getProfile, saveProfile, type Profile } from '../../lib/storage';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: '',
      country: '',
      linkedin: '',
      github: '',
      portfolio: '',
    },
    workAuth: {
      authorized: true,
      needsVisa: false,
      canRelocate: false,
    },
    preferences: {
      salaryExpectation: '',
      noticePeriod: '',
      preferredLocations: [],
    },
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const data = await getProfile();
    if (data) setProfile(data);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveProfile(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Profile</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <div className="spinner" /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>

      {/* Personal Information */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2>Personal Information</h2>
        
        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input
              type="text"
              className="form-input"
              value={profile.personalInfo.firstName}
              onChange={(e) => setProfile({
                ...profile,
                personalInfo: { ...profile.personalInfo, firstName: e.target.value }
              })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input
              type="text"
              className="form-input"
              value={profile.personalInfo.lastName}
              onChange={(e) => setProfile({
                ...profile,
                personalInfo: { ...profile.personalInfo, lastName: e.target.value }
              })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email *</label>
          <input
            type="email"
            className="form-input"
            value={profile.personalInfo.email}
            onChange={(e) => setProfile({
              ...profile,
              personalInfo: { ...profile.personalInfo, email: e.target.value }
            })}
            required
          />
        </div>

        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="form-label">Phone *</label>
            <input
              type="tel"
              className="form-input"
              value={profile.personalInfo.phone}
              onChange={(e) => setProfile({
                ...profile,
                personalInfo: { ...profile.personalInfo, phone: e.target.value }
              })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">City *</label>
            <input
              type="text"
              className="form-input"
              value={profile.personalInfo.city}
              onChange={(e) => setProfile({
                ...profile,
                personalInfo: { ...profile.personalInfo, city: e.target.value }
              })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Country *</label>
          <input
            type="text"
            className="form-input"
            value={profile.personalInfo.country}
            onChange={(e) => setProfile({
              ...profile,
              personalInfo: { ...profile.personalInfo, country: e.target.value }
            })}
            required
          />
        </div>

        <h3 style={{ marginTop: '1.5rem' }}>Links</h3>

        <div className="form-group">
          <label className="form-label">LinkedIn</label>
          <input
            type="url"
            className="form-input"
            placeholder="https://linkedin.com/in/username"
            value={profile.personalInfo.linkedin || ''}
            onChange={(e) => setProfile({
              ...profile,
              personalInfo: { ...profile.personalInfo, linkedin: e.target.value }
            })}
          />
        </div>

        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="form-label">GitHub</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://github.com/username"
              value={profile.personalInfo.github || ''}
              onChange={(e) => setProfile({
                ...profile,
                personalInfo: { ...profile.personalInfo, github: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Portfolio</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://yourportfolio.com"
              value={profile.personalInfo.portfolio || ''}
              onChange={(e) => setProfile({
                ...profile,
                personalInfo: { ...profile.personalInfo, portfolio: e.target.value }
              })}
            />
          </div>
        </div>
      </div>

      {/* Work Authorization */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2>Work Authorization</h2>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={profile.workAuth.authorized}
              onChange={(e) => setProfile({
                ...profile,
                workAuth: { ...profile.workAuth, authorized: e.target.checked }
              })}
            />
            <span>Authorized to work in this country</span>
          </label>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={profile.workAuth.needsVisa}
              onChange={(e) => setProfile({
                ...profile,
                workAuth: { ...profile.workAuth, needsVisa: e.target.checked }
              })}
            />
            <span>Require visa sponsorship</span>
          </label>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={profile.workAuth.canRelocate}
              onChange={(e) => setProfile({
                ...profile,
                workAuth: { ...profile.workAuth, canRelocate: e.target.checked }
              })}
            />
            <span>Willing to relocate</span>
          </label>
        </div>
      </div>

      {/* Preferences */}
      <div className="card">
        <h2>Preferences</h2>

        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="form-label">Salary Expectation</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., $80,000 - $100,000"
              value={profile.preferences.salaryExpectation || ''}
              onChange={(e) => setProfile({
                ...profile,
                preferences: { ...profile.preferences, salaryExpectation: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notice Period</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., 2 weeks"
              value={profile.preferences.noticePeriod || ''}
              onChange={(e) => setProfile({
                ...profile,
                preferences: { ...profile.preferences, noticePeriod: e.target.value }
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
