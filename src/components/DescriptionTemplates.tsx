import React, { useState } from 'react';
import { t, Lang } from '../i18n';

interface DescriptionTemplatesProps {
  onSelect: (template: string) => void;
  language: Lang;
  type: 'experience' | 'education' | 'certification' | 'project';
}

export const DescriptionTemplates: React.FC<DescriptionTemplatesProps> = ({
  onSelect,
  language,
  type
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getTemplates = (): { key: string; label: string }[] => {
    switch (type) {
      case 'experience':
        return [
          { key: 'templates.experience.improved', label: t(language, 'templates.experience.improved') },
          { key: 'templates.experience.led', label: t(language, 'templates.experience.led') },
          { key: 'templates.experience.developed', label: t(language, 'templates.experience.developed') },
          { key: 'templates.experience.managed', label: t(language, 'templates.experience.managed') },
          { key: 'templates.experience.achieved', label: t(language, 'templates.experience.achieved') },
          { key: 'templates.experience.collaborated', label: t(language, 'templates.experience.collaborated') },
          { key: 'templates.experience.reduced', label: t(language, 'templates.experience.reduced') },
          { key: 'templates.experience.increased', label: t(language, 'templates.experience.increased') }
        ];
      case 'education':
        return [
          { key: 'templates.education.coursework', label: t(language, 'templates.education.coursework') },
          { key: 'templates.education.achievement', label: t(language, 'templates.education.achievement') },
          { key: 'templates.education.thesis', label: t(language, 'templates.education.thesis') },
          { key: 'templates.education.gpa', label: t(language, 'templates.education.gpa') },
          { key: 'templates.education.honors', label: t(language, 'templates.education.honors') },
          { key: 'templates.education.activities', label: t(language, 'templates.education.activities') }
        ];
      case 'certification':
        return [
          { key: 'templates.cert.skills', label: t(language, 'templates.cert.skills') },
          { key: 'templates.cert.focus', label: t(language, 'templates.cert.focus') },
          { key: 'templates.cert.validation', label: t(language, 'templates.cert.validation') },
          { key: 'templates.cert.credential', label: t(language, 'templates.cert.credential') }
        ];
      case 'project':
        return [
          { key: 'templates.project.built', label: t(language, 'templates.project.built') },
          { key: 'templates.project.implemented', label: t(language, 'templates.project.implemented') },
          { key: 'templates.project.designed', label: t(language, 'templates.project.designed') },
          { key: 'templates.project.technologies', label: t(language, 'templates.project.technologies') }
        ];
    }
  };

  const templates = getTemplates();

  return (
    <div className="template-dropdown">
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        💡 {t(language, 'editor.templates')}
      </button>
      {isOpen && (
        <>
          <div className="template-overlay" onClick={() => setIsOpen(false)} />
          <div className="template-menu">
            <div className="template-menu-header">
              <span>{t(language, 'editor.templates')}</span>
              <button
                type="button"
                className="template-close"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="template-list">
              {templates.map((template) => (
                <button
                  key={template.key}
                  type="button"
                  className="template-item"
                  onClick={() => {
                    onSelect(template.label);
                    setIsOpen(false);
                  }}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
