import React from 'react';
import { Education } from '../types';
import { degrees } from '../data/degrees';
import { t, Lang } from '../i18n';
import { RichTextEditor } from './RichTextEditor';
import { LocationSelector } from './LocationSelector';

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
  language: Lang;
}

export const EducationForm: React.FC<EducationFormProps> = ({ education, onChange, language }) => {
  const handleAdd = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      currentlyStudying: false,
      grade: '',
      activities: '',
      description: '',
      skills: [],
      country: '',
      city: '',
      location: ''
    };
    onChange([...education, newEducation]);
  };

  const handleUpdate = (id: string, field: keyof Education, value: string | string[] | boolean) => {
    onChange(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const handleRemove = (id: string) => {
    onChange(education.filter(edu => edu.id !== id));
  };

  const handleAddSkill = (id: string, skill: string) => {
    if (!skill.trim()) return;
    const edu = education.find(e => e.id === id);
    if (edu && !edu.skills.includes(skill.trim())) {
      handleUpdate(id, 'skills', [...edu.skills, skill.trim()]);
    }
  };

  const handleRemoveSkill = (id: string, skillToRemove: string) => {
    const edu = education.find(e => e.id === id);
    if (edu) {
      handleUpdate(id, 'skills', edu.skills.filter(s => s !== skillToRemove));
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">
        🎓 {t(language, 'education.section')}
        <button className="btn btn-primary btn-icon" onClick={handleAdd}>
          + {t(language, 'education.add')}
        </button>
      </h2>
      
      {education.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎓</div>
          <div className="empty-state-text">{t(language, 'education.emptyState')}</div>
        </div>
      ) : (
        <div className="card-list">
          {education.map((edu, index) => (
            <div key={edu.id} className="experience-item">
              <div className="experience-item-header">
                <span style={{ fontWeight: 600, color: '#64748b' }}>
                  {t(language, 'education.number')} #{index + 1}
                </span>
                <button 
                  className="btn btn-danger btn-icon"
                  onClick={() => handleRemove(edu.id)}
                >
                  🗑️ {t(language, 'common.remove')}
                </button>
              </div>
              
              <div className="form-group">
                <label className="form-label">{t(language, 'education.school')} *</label>
                <input
                  type="text"
                  className="form-input"
                  value={edu.school}
                  onChange={(e) => handleUpdate(edu.id, 'school', e.target.value)}
                  placeholder="University of Technology"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t(language, 'education.degree')} *</label>
                  <select
                    className="form-select"
                    value={edu.degree}
                    onChange={(e) => handleUpdate(edu.id, 'degree', e.target.value)}
                  >
                    <option value="">{t(language, 'education.selectDegree')}</option>
                    {degrees.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t(language, 'education.field')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={edu.fieldOfStudy}
                    onChange={(e) => handleUpdate(edu.id, 'fieldOfStudy', e.target.value)}
                    placeholder="Computer Science"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t(language, 'education.start')}</label>
                  <input
                    type="month"
                    className="form-input"
                    value={edu.startDate}
                    onChange={(e) => handleUpdate(edu.id, 'startDate', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t(language, 'education.end')}</label>
                  <input
                    type="month"
                    className="form-input"
                    value={edu.endDate}
                    onChange={(e) => handleUpdate(edu.id, 'endDate', e.target.value)}
                    disabled={edu.currentlyStudying}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`current-${edu.id}`}
                    checked={!!edu.currentlyStudying}
                    onChange={(e) => handleUpdate(edu.id, 'currentlyStudying', e.target.checked)}
                  />
                  <label htmlFor={`current-${edu.id}`}>{t(language, 'education.currentlyStudying')}</label>
                </div>
              </div>
              
              <LocationSelector
                country={edu.country || ''}
                city={edu.city || ''}
                onCountryChange={(country) => {
                  handleUpdate(edu.id, 'country', country);
                  handleUpdate(edu.id, 'location', country && edu.city ? `${edu.city}, ${country}` : country || '');
                }}
                onCityChange={(city) => {
                  handleUpdate(edu.id, 'city', city);
                  handleUpdate(edu.id, 'location', edu.country && city ? `${city}, ${edu.country}` : edu.country || '');
                }}
                language={language}
              />
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t(language, 'education.gradeLabel')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={edu.grade}
                    onChange={(e) => handleUpdate(edu.id, 'grade', e.target.value)}
                    placeholder="3.8 / 4.0"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t(language, 'education.activitiesLabel')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={edu.activities}
                    onChange={(e) => handleUpdate(edu.id, 'activities', e.target.value)}
                    placeholder="Student Government, Tech Club"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">{t(language, 'education.description')}</label>
                <RichTextEditor
                  value={edu.description}
                  onChange={(value) => handleUpdate(edu.id, 'description', value)}
                  placeholder={t(language, 'education.descriptionPlaceholder')}
                  language={language}
                  maxLength={2000}
                  showWordCount={true}
                  templateType="education"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t(language, 'education.skills')}</label>
                <div className="skills-input-container">
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t(language, 'experience.skillsPlaceholder')}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(edu.id, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData('text');
                      if (text.includes(',') || text.includes(';') || text.includes('|')) {
                        e.preventDefault();
                        text.split(/[,;|]/).map(s => s.trim()).filter(Boolean).forEach(s => handleAddSkill(edu.id, s));
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                </div>
                {edu.skills.length > 0 && (
                  <div className="skills-tags">
                    {edu.skills.map((skill, idx) => (
                      <div key={idx} className="skill-tag">
                        {skill}
                        <span 
                          className="skill-tag-remove"
                          onClick={() => handleRemoveSkill(edu.id, skill)}
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
          {/* Add button at the bottom of all education */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-primary btn-icon" onClick={handleAdd}>+ {t(language, 'education.add')}</button>
          </div>
        </div>
      )}
    </div>
  );
};
