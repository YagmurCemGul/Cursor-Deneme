import React, { useState } from 'react';
import { Experience } from '../types';
import { countries, citiesByCountry } from '../data/locations';

interface ExperienceFormProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({ experiences, onChange }) => {
  const [, setIsAdding] = useState(false);

  const handleAdd = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      title: '',
      employmentType: '',
      company: '',
      startDate: '',
      endDate: '',
      location: '',
      country: '',
      city: '',
      locationType: '',
      description: '',
      skills: []
    };
    onChange([...experiences, newExperience]);
    setIsAdding(true);
  };

  const handleUpdate = (id: string, field: keyof Experience, value: string | string[] | boolean) => {
    onChange(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const handleRemove = (id: string) => {
    onChange(experiences.filter(exp => exp.id !== id));
  };

  const handleAddSkill = (id: string, skill: string) => {
    if (!skill.trim()) return;
    const experience = experiences.find(exp => exp.id === id);
    if (experience && !experience.skills.includes(skill.trim())) {
      handleUpdate(id, 'skills', [...experience.skills, skill.trim()]);
    }
  };

  const handleRemoveSkill = (id: string, skillToRemove: string) => {
    const experience = experiences.find(exp => exp.id === id);
    if (experience) {
      handleUpdate(id, 'skills', experience.skills.filter(s => s !== skillToRemove));
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">
        💼 Experience
        <button className="btn btn-primary btn-icon" onClick={handleAdd}>
          + Add Experience
        </button>
      </h2>
      
      {experiences.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💼</div>
          <div className="empty-state-text">No work experience added yet. Click "Add Experience" to get started!</div>
        </div>
      ) : (
        <div className="card-list">
          {experiences.map((exp, index) => (
            <div key={exp.id} className="experience-item">
              <div className="experience-item-header">
                <span style={{ fontWeight: 600, color: '#64748b' }}>
                  Experience #{index + 1}
                </span>
                <button 
                  className="btn btn-danger btn-icon"
                  onClick={() => handleRemove(exp.id)}
                >
                  🗑️ Remove
                </button>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={exp.title}
                    onChange={(e) => handleUpdate(exp.id, 'title', e.target.value)}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Employment Type</label>
                  <select
                    className="form-select"
                    value={exp.employmentType}
                    onChange={(e) => handleUpdate(exp.id, 'employmentType', e.target.value)}
                  >
                    <option value="">Select Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Company or Organization *</label>
                <input
                  type="text"
                  className="form-input"
                  value={exp.company}
                  onChange={(e) => handleUpdate(exp.id, 'company', e.target.value)}
                  placeholder="Tech Company Inc."
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="month"
                    className="form-input"
                    value={exp.startDate}
                    onChange={(e) => handleUpdate(exp.id, 'startDate', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="month"
                    className="form-input"
                    value={exp.endDate}
                    onChange={(e) => handleUpdate(exp.id, 'endDate', e.target.value)}
                    placeholder="Present"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <select
                    className="form-select"
                    value={exp.country || ''}
                    onChange={(e) => {
                      const country = e.target.value;
                      const firstCity = country ? citiesByCountry[country]?.[0] || '' : '';
                      handleUpdate(exp.id, 'country', country);
                      handleUpdate(exp.id, 'city', firstCity);
                      handleUpdate(exp.id, 'location', country && firstCity ? `${firstCity}, ${country}` : country || '');
                    }}
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <select
                    className="form-select"
                    value={exp.city || ''}
                    onChange={(e) => {
                      const city = e.target.value;
                      handleUpdate(exp.id, 'city', city);
                      handleUpdate(exp.id, 'location', exp.country && city ? `${city}, ${exp.country}` : city);
                    }}
                    disabled={!exp.country}
                  >
                    <option value="">{exp.country ? 'Select City' : 'Select Country First'}</option>
                    {(exp.country ? citiesByCountry[exp.country] || [] : []).map((ct) => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location Type</label>
                <select
                  className="form-select"
                  value={exp.locationType}
                  onChange={(e) => handleUpdate(exp.id, 'locationType', e.target.value)}
                >
                  <option value="">Select Type</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={exp.description}
                  onChange={(e) => handleUpdate(exp.id, 'description', e.target.value)}
                  placeholder="Use bullets like: \n• Improved X by Y% \n• Led Z project"
                  onPaste={(e) => {
                    const text = e.clipboardData.getData('text');
                    if (text.includes('•') || text.includes('\n- ') || text.includes('\n* ')) {
                      e.preventDefault();
                      const normalized = text
                        .split(/\n|•|^-\s|^\*\s/m)
                        .map(s => s.trim())
                        .filter(Boolean)
                        .map(s => `• ${s}`)
                        .join('\n');
                      handleUpdate(exp.id, 'description', (exp.description ? exp.description + '\n' : '') + normalized);
                    }
                  }}
                />
                <div>
                  <button className="btn btn-secondary" onClick={(e) => { e.preventDefault(); handleUpdate(exp.id, 'description', (exp.description ? exp.description + '\n' : '') + '• '); }}>+ Add Bullet</button>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Skills</label>
                <div className="skills-input-container">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add a skill or paste: skill1, skill2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(exp.id, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData('text');
                      if (text.includes(',')) {
                        e.preventDefault();
                        text.split(',').map(s => s.trim()).filter(Boolean).forEach(s => handleAddSkill(exp.id, s));
                      }
                    }}
                    className="flex-input"
                  />
                </div>
                {exp.skills.length > 0 && (
                  <div className="skills-tags">
                    {exp.skills.map((skill, idx) => (
                      <div key={idx} className="skill-tag">
                        {skill}
                        <span 
                          className="skill-tag-remove"
                          onClick={() => handleRemoveSkill(exp.id, skill)}
                        >
                          ✕
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* Add button at the bottom of all experiences */}
          <div className="add-button-container">
            <button className="btn btn-primary btn-icon" onClick={handleAdd}>+ Add Experience</button>
          </div>
        </div>
      )}
    </div>
  );
};