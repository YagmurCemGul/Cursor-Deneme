import React, { useState } from 'react';
import { Experience } from '../types';
import { t, Lang } from '../i18n';
import { RichTextEditor } from './RichTextEditor';
import { LocationSelector } from './LocationSelector';
import { DateInput } from './DateInput';

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
      currentlyWorking: false,
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
                <DateInput
                  label={t(language, 'experience.start')}
                  value={exp.startDate}
                  onChange={(value) => handleUpdate(exp.id, 'startDate', value)}
                  required={true}
                  language={language}
                />
                
                <DateInput
                  label={t(language, 'experience.end')}
                  value={exp.endDate}
                  onChange={(value) => handleUpdate(exp.id, 'endDate', value)}
                  disabled={exp.currentlyWorking}
                  language={language}
                  startDate={exp.startDate}
                  placeholder={t(language, 'experience.present')}
                />
              </div>

              <div className="form-group current-work-checkbox">
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`current-${exp.id}`}
                    checked={!!exp.currentlyWorking}
                    onChange={(e) => {
                      handleUpdate(exp.id, 'currentlyWorking', e.target.checked);
                      if (e.target.checked) {
                        handleUpdate(exp.id, 'endDate', '');
                      }
                    }}
                  />
                  <label htmlFor={`current-${exp.id}`}>{t(language, 'experience.currentlyWorking')}</label>
                </div>
              </div>
              
              <LocationSelector
                country={exp.country || ''}
                city={exp.city || ''}
                onCountryChange={(country) => {
                  handleUpdate(exp.id, 'country', country);
                  handleUpdate(exp.id, 'location', country && exp.city ? `${exp.city}, ${country}` : country || '');
                }}
                onCityChange={(city) => {
                  handleUpdate(exp.id, 'city', city);
                  handleUpdate(exp.id, 'location', exp.country && city ? `${city}, ${exp.country}` : exp.country || '');
                }}
                language={language}
              />

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
                <RichTextEditor
                  value={exp.description}
                  onChange={(value) => handleUpdate(exp.id, 'description', value)}
                  placeholder={t(language, 'experience.descriptionPlaceholder')}
                  language={language}
                  maxLength={2000}
                  showWordCount={true}
                  templateType="experience"
                />
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