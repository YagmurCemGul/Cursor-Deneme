import React from 'react';
import { Education } from '../types';

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export const EducationForm: React.FC<EducationFormProps> = ({ education, onChange }) => {
  const handleAdd = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: '',
      activities: '',
      description: '',
      skills: []
    };
    onChange([...education, newEducation]);
  };

  const handleUpdate = (id: string, field: keyof Education, value: any) => {
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
        🎓 Education
        <button className="btn btn-primary btn-icon" onClick={handleAdd}>
          + Add Education
        </button>
      </h2>
      
      {education.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎓</div>
          <div className="empty-state-text">No education added yet. Click "Add Education" to get started!</div>
        </div>
      ) : (
        <div className="card-list">
          {education.map((edu, index) => (
            <div key={edu.id} className="experience-item">
              <div className="experience-item-header">
                <span style={{ fontWeight: 600, color: '#64748b' }}>
                  Education #{index + 1}
                </span>
                <button 
                  className="btn btn-danger btn-icon"
                  onClick={() => handleRemove(edu.id)}
                >
                  🗑️ Remove
                </button>
              </div>
              
              <div className="form-group">
                <label className="form-label">School *</label>
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
                  <label className="form-label">Degree *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={edu.degree}
                    onChange={(e) => handleUpdate(edu.id, 'degree', e.target.value)}
                    placeholder="Bachelor's Degree"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Field of Study *</label>
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
                  <label className="form-label">Start Date</label>
                  <input
                    type="month"
                    className="form-input"
                    value={edu.startDate}
                    onChange={(e) => handleUpdate(edu.id, 'startDate', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">End Date (or expected)</label>
                  <input
                    type="month"
                    className="form-input"
                    value={edu.endDate}
                    onChange={(e) => handleUpdate(edu.id, 'endDate', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Grade / GPA</label>
                  <input
                    type="text"
                    className="form-input"
                    value={edu.grade}
                    onChange={(e) => handleUpdate(edu.id, 'grade', e.target.value)}
                    placeholder="3.8 / 4.0"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Activities and Societies</label>
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
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={edu.description}
                  onChange={(e) => handleUpdate(edu.id, 'description', e.target.value)}
                  placeholder="Relevant coursework, projects, or achievements..."
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Skills</label>
                <div className="skills-input-container">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add a skill"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(edu.id, (e.target as HTMLInputElement).value);
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
        </div>
      )}
    </div>
  );
};
