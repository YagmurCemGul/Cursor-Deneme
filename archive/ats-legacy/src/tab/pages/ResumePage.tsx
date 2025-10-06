import { useEffect, useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { getProfile, saveProfile } from '../../lib/storage';
import type { Experience, Education, Profile } from '../../lib/storage';

export default function ResumePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const data = await getProfile();
    if (data) setProfile(data);
  }

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    try {
      await saveProfile(profile);
    } finally {
      setSaving(false);
    }
  }

  function addExperience() {
    if (!profile) return;
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: '',
      title: '',
      location: '',
      startDate: '',
      current: false,
      description: '',
      achievements: [],
    };
    setProfile({
      ...profile,
      resume: {
        ...profile.resume!,
        experience: [...(profile.resume?.experience || []), newExp],
      },
    });
  }

  function addEducation() {
    if (!profile) return;
    const newEdu: Education = {
      id: crypto.randomUUID(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      current: false,
    };
    setProfile({
      ...profile,
      resume: {
        ...profile.resume!,
        education: [...(profile.resume?.education || []), newEdu],
      },
    });
  }

  if (!profile) {
    return <div className="container"><div className="spinner" /></div>;
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1>Resume</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <div className="spinner" /> : <Save size={16} />}
          Save
        </button>
      </div>

      {/* Experience */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Experience</h2>
          <button className="btn btn-secondary btn-sm" onClick={addExperience}>
            <Plus size={16} />
            Add
          </button>
        </div>

        {!profile.resume?.experience?.length && (
          <p style={{ color: 'var(--color-text-secondary)' }}>No experience added yet.</p>
        )}

        {profile.resume?.experience?.map((exp, idx) => (
          <div key={exp.id} className="card" style={{ marginBottom: '1rem', background: 'var(--color-bg-secondary)' }}>
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={exp.title}
                  onChange={(e) => {
                    const updated = [...(profile.resume?.experience || [])];
                    updated[idx].title = e.target.value;
                    setProfile({ ...profile, resume: { ...profile.resume!, experience: updated } });
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company</label>
                <input
                  type="text"
                  className="form-input"
                  value={exp.company}
                  onChange={(e) => {
                    const updated = [...(profile.resume?.experience || [])];
                    updated[idx].company = e.target.value;
                    setProfile({ ...profile, resume: { ...profile.resume!, experience: updated } });
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={exp.description}
                onChange={(e) => {
                  const updated = [...(profile.resume?.experience || [])];
                  updated[idx].description = e.target.value;
                  setProfile({ ...profile, resume: { ...profile.resume!, experience: updated } });
                }}
              />
            </div>

            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                const updated = profile.resume?.experience?.filter((_, i) => i !== idx) || [];
                setProfile({ ...profile, resume: { ...profile.resume!, experience: updated } });
              }}
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Education</h2>
          <button className="btn btn-secondary btn-sm" onClick={addEducation}>
            <Plus size={16} />
            Add
          </button>
        </div>

        {!profile.resume?.education?.length && (
          <p style={{ color: 'var(--color-text-secondary)' }}>No education added yet.</p>
        )}

        {profile.resume?.education?.map((edu, idx) => (
          <div key={edu.id} className="card" style={{ marginBottom: '1rem', background: 'var(--color-bg-secondary)' }}>
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Institution</label>
                <input
                  type="text"
                  className="form-input"
                  value={edu.institution}
                  onChange={(e) => {
                    const updated = [...(profile.resume?.education || [])];
                    updated[idx].institution = e.target.value;
                    setProfile({ ...profile, resume: { ...profile.resume!, education: updated } });
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Degree</label>
                <input
                  type="text"
                  className="form-input"
                  value={edu.degree}
                  onChange={(e) => {
                    const updated = [...(profile.resume?.education || [])];
                    updated[idx].degree = e.target.value;
                    setProfile({ ...profile, resume: { ...profile.resume!, education: updated } });
                  }}
                />
              </div>
            </div>

            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                const updated = profile.resume?.education?.filter((_, i) => i !== idx) || [];
                setProfile({ ...profile, resume: { ...profile.resume!, education: updated } });
              }}
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="card">
        <h2>Skills</h2>
        <div className="form-group">
          <label className="form-label">Skills (comma-separated)</label>
          <textarea
            className="form-textarea"
            placeholder="JavaScript, React, Node.js, Python, ..."
            value={profile.resume?.skills?.join(', ') || ''}
            onChange={(e) => {
              const skills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
              setProfile({
                ...profile,
                resume: { ...profile.resume!, skills },
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
