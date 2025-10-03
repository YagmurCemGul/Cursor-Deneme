import React from 'react';
import { Project } from '../types';

interface ProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export const ProjectsForm: React.FC<ProjectsFormProps> = ({ projects, onChange }) => {
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

  const handleUpdate = (id: string, field: keyof Project, value: any) => {
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
        🚀 Projects
        <button className="btn btn-primary btn-icon" onClick={handleAdd}>
          + Add Project
        </button>
      </h2>
      
      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🚀</div>
          <div className="empty-state-text">No projects added yet. Click "Add Project" to get started!</div>
        </div>
      ) : (
        <div className="card-list">
          {projects.map((proj, index) => (
            <div key={proj.id} className="experience-item">
              <div className="experience-item-header">
                <span style={{ fontWeight: 600, color: '#64748b' }}>
                  Project #{index + 1}
                </span>
                <button 
                  className="btn btn-danger btn-icon"
                  onClick={() => handleRemove(proj.id)}
                >
                  🗑️ Remove
                </button>
              </div>
              
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={proj.name}
                  onChange={(e) => handleUpdate(proj.id, 'name', e.target.value)}
                  placeholder="E-Commerce Platform"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={proj.description}
                  onChange={(e) => handleUpdate(proj.id, 'description', e.target.value)}
                  placeholder="Describe the project, your role, and achievements..."
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="month"
                    className="form-input"
                    value={proj.startDate}
                    onChange={(e) => handleUpdate(proj.id, 'startDate', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">End Date</label>
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
                    I am currently working on this project
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Associated With</label>
                <input
                  type="text"
                  className="form-input"
                  value={proj.associatedWith}
                  onChange={(e) => handleUpdate(proj.id, 'associatedWith', e.target.value)}
                  placeholder="Company, School, or Organization"
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
                        handleAddSkill(proj.id, (e.target as HTMLInputElement).value);
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
        </div>
      )}
    </div>
  );
};
