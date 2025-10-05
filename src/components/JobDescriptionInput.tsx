import React from 'react';
import { t, Lang } from '../i18n';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  language: Lang;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
  language,
}) => {
  return (
    <div className="section">
      <h2 className="section-title">💼 {t(language, 'job.section')}</h2>

      <div className="form-group">
        <label className="form-label">{t(language, 'job.paste')}</label>
        <textarea
          className="form-textarea"
          placeholder={t(language, 'job.placeholder')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight: '200px' }}
        />
      </div>

      <div className="alert alert-info">💡 {t(language, 'job.tipFull')}</div>
    </div>
  );
};
