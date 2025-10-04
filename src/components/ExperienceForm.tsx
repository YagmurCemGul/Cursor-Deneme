import React, { useState } from 'react';
import { Experience } from '../types';
import { countries, citiesByCountry } from '../data/locations';
import { t, Lang } from '../i18n';

interface ExperienceFormProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
  language: Lang;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({ experiences, onChange, language }) => {
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
        💼 {t(language, 'experience.section')}
        <button className="btn btn-primary btn-icon" onClick={handleAdd}>
          + {t(language, 'experience.add')}
        </button>
      </h2>
      
      {experiences.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💼</div>
          <div className="empty-state-text">{t(language, 'experience.emptyState')}</div>
        </div>
      ) : (
        <div className="card-list">
          {experiences.map((exp, index) => (
            <div key={exp.id} className="experience-item">
              <div className="experience-item-header">
                <span style={{ fontWeight: 600, color: '#64748b' }}>
                  {t(language, 'experience.number')} #{index + 1}
                </span>
                <button 
                  className="btn btn-danger btn-icon"
                  onClick={() => handleRemove(exp.id)}
                >
                  🗑️ {t(language, 'common.remove')}
                </button>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t(language, 'experience.jobTitle')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={exp.title}
                    onChange={(e) => handleUpdate(exp.id, 'title', e.target.value)}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t(language, 'experience.employmentType')}</label>
                  <select
                    className="form-select"
                    value={exp.employmentType}
                    onChange={(e) => handleUpdate(exp.id, 'employmentType', e.target.value)}
                  >
                    <option value="">{t(language, 'experience.selectType')}</option>
                    <option value="Full-time">{t(language, 'experience.employmentTypes.fulltime')}</option>
                    <option value="Part-time">{t(language, 'experience.employmentTypes.parttime')}</option>
                    <option value="Contract">{t(language, 'experience.employmentTypes.contract')}</option>
                    <option value="Freelance">{t(language, 'experience.employmentTypes.freelance')}</option>
                    <option value="Internship">{t(language, 'experience.employmentTypes.internship')}</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">{t(language, 'experience.company')} *</label>
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
                  <label className="form-label">{t(language, 'experience.start')} *</label>
                  <input
                    type="month"
                    className="form-input"
                    value={exp.startDate}
                    onChange={(e) => handleUpdate(exp.id, 'startDate', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t(language, 'experience.end')}</label>
                  <input
                    type="month"
                    className="form-input"
                    value={exp.endDate}
                    onChange={(e) => handleUpdate(exp.id, 'endDate', e.target.value)}
                    placeholder={t(language, 'experience.present')}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t(language, 'experience.country')}</label>
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
                    <option value="">{t(language, 'experience.selectCountry')}</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t(language, 'experience.city')}</label>
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
                    <option value="">{exp.country ? t(language, 'experience.selectCity') : t(language, 'experience.selectCountryFirst')}</option>
                    {(exp.country ? citiesByCountry[exp.country] || [] : []).map((ct) => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t(language, 'experience.locationType')}</label>
                <select
                  className="form-select"
                  value={exp.locationType}
                  onChange={(e) => handleUpdate(exp.id, 'locationType', e.target.value)}
                >
                  <option value="">{t(language, 'experience.selectType')}</option>
                  <option value="On-site">{t(language, 'experience.locationTypes.onsite')}</option>
                  <option value="Remote">{t(language, 'experience.locationTypes.remote')}</option>
                  <option value="Hybrid">{t(language, 'experience.locationTypes.hybrid')}</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">{t(language, 'experience.description')}</label>
                <textarea
                  className="form-textarea"
                  value={exp.description}
                  onChange={(e) => handleUpdate(exp.id, 'description', e.target.value)}
                  placeholder={t(language, 'experience.descriptionPlaceholder')}
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
                  <button className="btn btn-secondary" onClick={(e) => { e.preventDefault(); handleUpdate(exp.id, 'description', (exp.description ? exp.description + '\n' : '') + '• '); }}>+ {t(language, 'experience.addBullet')}</button>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">{t(language, 'experience.skills')}</label>
                <div className="skills-input-container">
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t(language, 'experience.skillsPlaceholder')}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(exp.id, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData('text');
                      if (text.includes(',') || text.includes(';') || text.includes('|')) {
                        e.preventDefault();
                        text.split(/[,;|]/).map(s => s.trim()).filter(Boolean).forEach(s => handleAddSkill(exp.id, s));
                        (e.target as HTMLInputElement).value = '';
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
            <button className="btn btn-primary btn-icon" onClick={handleAdd}>+ {t(language, 'experience.add')}</button>
          </div>
        </div>
      )}
    </div>
  );
};