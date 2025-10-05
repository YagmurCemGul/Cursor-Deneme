import React from 'react';
import { countries, citiesByCountry } from '../data/locations';
import { t, Lang } from '../i18n';

interface LocationSelectorProps {
  country: string;
  city: string;
  onCountryChange: (country: string) => void;
  onCityChange: (city: string) => void;
  language: Lang;
  disabled?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  country,
  city,
  onCountryChange,
  onCityChange,
  language,
  disabled = false
}) => {
  const handleCountryChange = (newCountry: string) => {
    onCountryChange(newCountry);
    // Don't auto-select city, let user choose
    if (city && newCountry) {
      const citiesInNewCountry = citiesByCountry[newCountry] || [];
      if (!citiesInNewCountry.includes(city)) {
        onCityChange(''); // Clear city if not valid for new country
      }
    }
  };

  return (
    <div className="form-row">
      <div className="form-group">
        <label className="form-label">{t(language, 'experience.country')}</label>
        <select
          className="form-select"
          value={country || ''}
          onChange={(e) => handleCountryChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">{t(language, 'experience.selectCountry')}</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">{t(language, 'experience.city')}</label>
        <select
          className="form-select"
          value={city || ''}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={!country || disabled}
        >
          <option value="">
            {country 
              ? t(language, 'experience.selectCity') 
              : t(language, 'experience.selectCountryFirst')
            }
          </option>
          {(country ? citiesByCountry[country] || [] : []).map((ct) => (
            <option key={ct} value={ct}>{ct}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
