import React from 'react';
import { Project } from '../types';
import { t, Lang } from '../i18n';
import { RichTextEditor } from './RichTextEditor';

interface ProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
  language: Lang;
}

export const ProjectsForm: React.FC<ProjectsFormProps> = ({ projects, onChange, language }) => {
  const handleAdd = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      skills: [],
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      associatedWith: ''
    };
    onChange([...projects, newProject]);
  };

  const handleUpdate = (id: string, field: keyof Project, value: string | string[] | boolean) => {
    onChange(projects.map(proj => 
      proj.id === id ? { ...proj, [field]: value } : proj
    ));
  };

  const handleRemove = (id: string) => {
    onChange(projects.filter(proj => proj.id !== id));
  };

  const handleAddSkill = (id: string, skill: string) => {
    if (!skill.trim()) return;
    const project = projects.find(p => p.id === id);
    if (project && !project.skills.includes(skill.trim())) {
      handleUpdate(id, 'skills', [...project.skills, skill.trim()]);
    }
  };

  const handleRemoveSkill = (id: string, skillToRemove: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      handleUpdate(id, 'skills', project.skills.filter(s => s !== skillToRemove));
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">
        🚀 {t(language, 'projects.section')}
        <button className="btn btn-primary btn-icon" onClick={handleAdd}>
          + {t(language, 'projects.add')}
        </button>
      </h2>
      
      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🚀</div>
          <div className="empty-state-text">{t(language, 'projects.emptyState')}</div>
        </div>
      ) : (
        <div className="card-list">
          {projects.map((proj, index) => (
            <div key={proj.id} className="experience-item">
              <div className="experience-item-header">
                <span style={{ fontWeight: 600, color: '#64748b' }}>
                  {t(language, 'projects.number')} #{index + 1}
                </span>
                <button 
                  className="btn btn-danger btn-icon"
                  onClick={() => handleRemove(proj.id)}
                >
                  🗑️ {t(language, 'common.remove')}
                </button>
              </div>
              
              <div className="form-group">
                <label className="form-label">{t(language, 'projects.name')} *</label>
                <input
                  type="text"
                  className="form-input"
                  value={proj.name}
                  onChange={(e) => handleUpdate(proj.id, 'name', e.target.value)}
                  placeholder="E-Commerce Platform"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t(language, 'projects.description')}</label>
                <RichTextEditor
                  value={proj.description}
                  onChange={(value) => handleUpdate(proj.id, 'description', value)}
                  placeholder={t(language, 'projects.descriptionPlaceholder')}
                  language={language}
                  maxLength={2000}
                  showWordCount={true}
                  templateType="project"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t(language, 'projects.start')}</label>
                  <input
                    type="month"
                    className="form-input"
                    value={proj.startDate}
                    onChange={(e) => handleUpdate(proj.id, 'startDate', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t(language, 'projects.end')}</label>
                  <input
                    type="month"
                    className="form-input"
                    value={proj.endDate}
                    onChange={(e) => handleUpdate(proj.id, 'endDate', e.target.value)}
                    disabled={proj.currentlyWorking}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`currently-working-${proj.id}`}
                    checked={proj.currentlyWorking}
                    onChange={(e) => handleUpdate(proj.id, 'currentlyWorking', e.target.checked)}
                  />
                  <label htmlFor={`currently-working-${proj.id}`}>
                    {t(language, 'projects.currently')}
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">{t(language, 'projects.associated')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={proj.associatedWith}
                  onChange={(e) => handleUpdate(proj.id, 'associatedWith', e.target.value)}
                  placeholder={t(language, 'projects.associatedPlaceholder')}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t(language, 'projects.skills')}</label>
                <div className="skills-input-container">
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t(language, 'experience.skillsPlaceholder')}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(proj.id, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData('text');
                      if (text.includes(',') || text.includes(';') || text.includes('|')) {
                        e.preventDefault();
                        text.split(/[,;|]/).map(s => s.trim()).filter(Boolean).forEach(s => handleAddSkill(proj.id, s));
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                </div>
                {proj.skills.length > 0 && (
                  <div className="skills-tags">
                    {proj.skills.map((skill, idx) => (
                      <div key={idx} className="skill-tag">
                        {skill}
                        <span 
                          className="skill-tag-remove"
                          onClick={() => handleRemoveSkill(proj.id, skill)}
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
          {/* Add button at the bottom of all projects */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-primary btn-icon" onClick={handleAdd}>+ {t(language, 'projects.add')}</button>
          </div>
        </div>
      )}
    </div>
  );
};
