import React from 'react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({ value, onChange }) => {
  return (
    <div className="section">
      <h2 className="section-title">
        💼 Job Description
      </h2>
      
      <div className="form-group">
        <label className="form-label">
          Paste the job description you're applying for
        </label>
        <textarea
          className="form-textarea"
          placeholder="Paste the full job description here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight: '200px' }}
        />
      </div>
      
      <div className="alert alert-info">
        💡 Tip: The AI will analyze this job description to optimize your CV with relevant keywords and match your experience to the job requirements.
      </div>
    </div>
  );
};
