import React, { useState } from 'react';
import { t, Lang } from '../i18n';

interface SkillsFormProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  language: Lang;
}

export const SkillsForm: React.FC<SkillsFormProps> = ({ skills, onChange, language }) => {
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
        ⚡ {t(language, 'skills.section')}
      </h2>
      
      <div className="skills-input-container">
        <input
          type="text"
          className="form-input"
          placeholder={t(language, 'skills.placeholder')}
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
          + {t(language, 'skills.addSkillBtn')}
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
          <div className="empty-state-text">{t(language, 'skills.emptyState')}</div>
        </div>
      )}
    </div>
  );
};
