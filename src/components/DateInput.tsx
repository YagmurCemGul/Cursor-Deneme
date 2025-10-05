import React from 'react';
import { t, Lang } from '../i18n';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  language: Lang;
  minDate?: string;
  maxDate?: string;
  startDate?: string; // For validation: end date should be after start date
  error?: string;
  placeholder?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  language,
  minDate,
  maxDate,
  startDate,
  error,
  placeholder
}) => {
  const [localError, setLocalError] = React.useState<string>('');

  const validateDate = (newValue: string) => {
    if (!newValue) {
      setLocalError('');
      return true;
    }

    // Check if end date is before start date
    if (startDate && newValue < startDate) {
      const errorMsg = language === 'tr' 
        ? 'Bitiş tarihi başlangıç tarihinden önce olamaz' 
        : 'End date cannot be before start date';
      setLocalError(errorMsg);
      return false;
    }

    // Check if date is in the future (beyond current month)
    if (maxDate && newValue > maxDate) {
      const errorMsg = language === 'tr' 
        ? 'Tarih gelecekte olamaz' 
        : 'Date cannot be in the future';
      setLocalError(errorMsg);
      return false;
    }

    // Check min date
    if (minDate && newValue < minDate) {
      const errorMsg = language === 'tr' 
        ? 'Tarih çok eski' 
        : 'Date is too early';
      setLocalError(errorMsg);
      return false;
    }

    setLocalError('');
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    validateDate(newValue);
  };

  const displayError = error || localError;
  const hasError = !!displayError;

  // Get current month in YYYY-MM format for max date default
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const effectiveMaxDate = maxDate || getCurrentMonth();

  return (
    <div className="form-group">
      <label className="form-label">
        {label} {required && '*'}
      </label>
      <input
        type="month"
        className={`form-input ${hasError ? 'form-input-error' : ''}`}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        min={minDate}
        max={effectiveMaxDate}
        placeholder={placeholder}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${label}-error` : undefined}
      />
      {hasError && (
        <div className="form-error" id={`${label}-error`} role="alert">
          ⚠️ {displayError}
        </div>
      )}
      {!hasError && !disabled && startDate && (
        <div className="form-hint">
          {language === 'tr' 
            ? `Başlangıç tarihinden sonra olmalıdır` 
            : `Must be after start date`}
        </div>
      )}
    </div>
  );
};
