import React, { useState } from 'react';

interface SkillsFormProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export const SkillsForm: React.FC<SkillsFormProps> = ({ skills, onChange }) => {
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      onChange([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onChange(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">
        ⚡ Skills
      </h2>
      
      <div className="skills-input-container">
        <input
          type="text"
          className="form-input"
          placeholder="Add a skill (e.g., JavaScript) or paste: skill1, skill2"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={handleKeyPress}
          onPaste={(e) => {
            const text = e.clipboardData.getData('text');
            if (text.includes(',')) {
              e.preventDefault();
              const newOnes = text.split(',').map(s => s.trim()).filter(Boolean);
              const unique = Array.from(new Set([...skills, ...newOnes]));
              onChange(unique);
            }
          }}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={handleAddSkill}>
          + Add Skill
        </button>
      </div>
      
      {skills.length > 0 && (
        <div className="skills-tags">
          {skills.map((skill, index) => (
            <div key={index} className="skill-tag">
              {skill}
              <span 
                className="skill-tag-remove" 
                onClick={() => handleRemoveSkill(skill)}
              >
                ✕
              </span>
            </div>
          ))}
        </div>
      )}
      
      {skills.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">⚡</div>
          <div className="empty-state-text">No skills added yet. Add your key skills to make your CV stand out!</div>
        </div>
      )}
    </div>
  );
};
