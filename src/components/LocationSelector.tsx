import React, { useState, useEffect, useRef } from 'react';
import { countries, citiesByCountry, CountryInfo } from '../data/locations';
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
  disabled = false,
}) => {
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [highlightedCountryIndex, setHighlightedCountryIndex] = useState(-1);
  const [highlightedCityIndex, setHighlightedCityIndex] = useState(-1);

  const countryInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Fuzzy search with Levenshtein distance
  const fuzzyMatch = (text: string, search: string): boolean => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const textLower = text.toLowerCase();

    // Exact substring match
    if (textLower.includes(searchLower)) return true;

    // Check if search terms match the beginning of words
    const words = textLower.split(/\s+/);
    if (words.some((word) => word.startsWith(searchLower))) return true;

    // Levenshtein distance for fuzzy matching (max distance 2)
    if (searchLower.length >= 3) {
      return calculateLevenshteinDistance(textLower, searchLower) <= 2;
    }

    return false;
  };

  const calculateLevenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      const row = matrix[0];
      if (row) row[j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        const currentRow = matrix[i];
        const prevRow = matrix[i - 1];
        if (currentRow && prevRow) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            currentRow[j] = prevRow[j - 1] ?? 0;
          } else {
            currentRow[j] = Math.min(
              (prevRow[j - 1] ?? 0) + 1,
              (currentRow[j - 1] ?? 0) + 1,
              (prevRow[j] ?? 0) + 1
            );
          }
        }
      }
    }

    const lastRow = matrix[str2.length];
    return lastRow?.[str1.length] ?? 0;
  };

  // Filter countries based on search
  const filteredCountries = countries.filter((c) => fuzzyMatch(c.name, countrySearch));

  // Get cities for selected country
  const availableCities = country ? citiesByCountry[country] || [] : [];

  // Filter cities based on search
  const filteredCities = availableCities.filter((c) => fuzzyMatch(c, citySearch));

  // Check if current city is custom
  useEffect(() => {
    if (city && country) {
      const isInList = availableCities.includes(city);
      setIsCustomCity(!isInList);
      if (!isInList) {
        setCustomCity(city);
      }
    } else {
      setIsCustomCity(false);
      setCustomCity('');
    }
  }, [city, country, availableCities]);

  const handleCountrySelect = (countryInfo: CountryInfo) => {
    const newCountry = countryInfo.name;
    onCountryChange(newCountry);
    setCountrySearch('');
    setShowCountryDropdown(false);
    setHighlightedCountryIndex(-1);

    // Check if current city exists in new country
    if (city && newCountry) {
      const citiesInNewCountry = citiesByCountry[newCountry] || [];
      if (!citiesInNewCountry.includes(city)) {
        onCityChange(''); // Clear city if not valid for new country
        setCitySearch('');
        setCustomCity('');
        setIsCustomCity(false);
      }
    }
  };

  const handleCitySelect = (selectedCity: string) => {
    onCityChange(selectedCity);
    setCitySearch('');
    setShowCityDropdown(false);
    setHighlightedCityIndex(-1);
    setIsCustomCity(false);
    setCustomCity('');
  };

  const handleCustomCitySubmit = () => {
    if (customCity.trim()) {
      onCityChange(customCity.trim());
      setIsCustomCity(true);
      setShowCityDropdown(false);
      setCitySearch('');
      setHighlightedCityIndex(-1);
    }
  };

  // Handle keyboard navigation for country
  const handleCountryKeyDown = (e: React.KeyboardEvent) => {
    if (!showCountryDropdown) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setShowCountryDropdown(true);
        setHighlightedCountryIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedCountryIndex((prev) =>
          prev < filteredCountries.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedCountryIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedCountryIndex >= 0 && highlightedCountryIndex < filteredCountries.length) {
          const selectedCountry = filteredCountries[highlightedCountryIndex];
          if (selectedCountry) {
            handleCountrySelect(selectedCountry);
          }
        }
        break;
      case 'Escape':
        setShowCountryDropdown(false);
        setHighlightedCountryIndex(-1);
        break;
    }
  };

  // Handle keyboard navigation for city
  const handleCityKeyDown = (e: React.KeyboardEvent) => {
    if (!showCityDropdown) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setShowCityDropdown(true);
        setHighlightedCityIndex(0);
        e.preventDefault();
      }
      return;
    }

    const totalItems = filteredCities.length + 1; // +1 for custom city option

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedCityIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedCityIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedCityIndex >= 0) {
          if (highlightedCityIndex < filteredCities.length) {
            const selectedCity = filteredCities[highlightedCityIndex];
            if (selectedCity) {
              handleCitySelect(selectedCity);
            }
          } else {
            // Custom city option
            handleCustomCitySubmit();
          }
        }
        break;
      case 'Escape':
        setShowCityDropdown(false);
        setHighlightedCityIndex(-1);
        break;
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node) &&
        !countryInputRef.current?.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false);
        setHighlightedCountryIndex(-1);
      }
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node) &&
        !cityInputRef.current?.contains(event.target as Node)
      ) {
        setShowCityDropdown(false);
        setHighlightedCityIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedCountryIndex >= 0 && countryDropdownRef.current) {
      const item = countryDropdownRef.current.children[highlightedCountryIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedCountryIndex]);

  useEffect(() => {
    if (highlightedCityIndex >= 0 && cityDropdownRef.current) {
      const item = cityDropdownRef.current.children[highlightedCityIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedCityIndex]);

  // Get selected country info for display
  const selectedCountry = countries.find((c) => c.name === country);

  return (
    <div className="form-row">
      <div className="form-group">
        <label className="form-label">{t(language, 'experience.country')}</label>
        <div className="location-selector-wrapper" style={{ position: 'relative' }}>
          <input
            ref={countryInputRef}
            type="text"
            className="form-input location-search-input"
            value={country || countrySearch}
            onChange={(e) => {
              setCountrySearch(e.target.value);
              if (!e.target.value) {
                onCountryChange('');
              }
              setShowCountryDropdown(true);
              setHighlightedCountryIndex(-1);
            }}
            onFocus={() => {
              setShowCountryDropdown(true);
              setCountrySearch('');
            }}
            onKeyDown={handleCountryKeyDown}
            placeholder={t(language, 'experience.selectCountry')}
            disabled={disabled}
            autoComplete="off"
          />
          {selectedCountry && !showCountryDropdown && (
            <span
              className="location-flag"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '20px',
                pointerEvents: 'none',
              }}
            >
              {selectedCountry.flag}
            </span>
          )}
          {showCountryDropdown && filteredCountries.length > 0 && (
            <div
              ref={countryDropdownRef}
              className="location-dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: '300px',
                overflowY: 'auto',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginTop: '4px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
              }}
            >
              {filteredCountries.map((countryInfo, index) => (
                <div
                  key={countryInfo.code}
                  className={`location-dropdown-item ${highlightedCountryIndex === index ? 'highlighted' : ''}`}
                  onClick={() => handleCountrySelect(countryInfo)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: highlightedCountryIndex === index ? '#f1f5f9' : 'transparent',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={() => setHighlightedCountryIndex(index)}
                >
                  <span style={{ fontSize: '20px' }}>{countryInfo.flag}</span>
                  <span style={{ flex: 1 }}>{countryInfo.name}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{countryInfo.code}</span>
                </div>
              ))}
            </div>
          )}
          {showCountryDropdown && filteredCountries.length === 0 && countrySearch && (
            <div
              className="location-dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginTop: '4px',
                padding: '12px',
                color: '#64748b',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
              }}
            >
              {t(language, 'location.noCountriesFound')}
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t(language, 'experience.city')}</label>
        <div className="location-selector-wrapper" style={{ position: 'relative' }}>
          <input
            ref={cityInputRef}
            type="text"
            className="form-input location-search-input"
            value={isCustomCity ? customCity : city || citySearch}
            onChange={(e) => {
              const value = e.target.value;
              if (isCustomCity) {
                setCustomCity(value);
                onCityChange(value);
              } else {
                setCitySearch(value);
                if (!value) {
                  onCityChange('');
                }
                setShowCityDropdown(true);
                setHighlightedCityIndex(-1);
              }
            }}
            onFocus={() => {
              if (!disabled && country) {
                setShowCityDropdown(true);
                if (!isCustomCity) {
                  setCitySearch('');
                }
              }
            }}
            onKeyDown={handleCityKeyDown}
            placeholder={
              !country
                ? t(language, 'experience.selectCountryFirst')
                : t(language, 'experience.selectCity')
            }
            disabled={!country || disabled}
            autoComplete="off"
          />
          {isCustomCity && (
            <button
              className="location-clear-custom"
              onClick={() => {
                setIsCustomCity(false);
                setCustomCity('');
                onCityChange('');
                setCitySearch('');
              }}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px',
              }}
              title={t(language, 'location.clearCustomCity')}
            >
              ✕
            </button>
          )}
          {showCityDropdown && country && (
            <div
              ref={cityDropdownRef}
              className="location-dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: '300px',
                overflowY: 'auto',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginTop: '4px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
              }}
            >
              {filteredCities.map((cityName, index) => (
                <div
                  key={cityName}
                  className={`location-dropdown-item ${highlightedCityIndex === index ? 'highlighted' : ''}`}
                  onClick={() => handleCitySelect(cityName)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    backgroundColor: highlightedCityIndex === index ? '#f1f5f9' : 'transparent',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={() => setHighlightedCityIndex(index)}
                >
                  {cityName}
                </div>
              ))}
              <div
                className={`location-dropdown-item location-custom-option ${highlightedCityIndex === filteredCities.length ? 'highlighted' : ''}`}
                onClick={() => {
                  setIsCustomCity(true);
                  setShowCityDropdown(false);
                  setHighlightedCityIndex(-1);
                  if (citySearch) {
                    setCustomCity(citySearch);
                    onCityChange(citySearch);
                  }
                }}
                onMouseEnter={() => setHighlightedCityIndex(filteredCities.length)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  backgroundColor:
                    highlightedCityIndex === filteredCities.length ? '#f1f5f9' : 'transparent',
                  borderTop: filteredCities.length > 0 ? '1px solid #e2e8f0' : 'none',
                  color: '#3b82f6',
                  fontWeight: 500,
                  transition: 'background-color 0.15s',
                }}
              >
                ✏️ {t(language, 'location.enterCustomCity')}
                {citySearch && ` "${citySearch}"`}
              </div>
            </div>
          )}
        </div>
        {isCustomCity && (
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            ✓ {t(language, 'location.customCityNote')}
          </div>
        )}
      </div>
    </div>
  );
};
