import React, { useState, useEffect, useRef } from 'react';
import { Lang } from '../i18n';
import {
  degreeOptions,
  getDegrees,
  suggestDegreesByField,
  getVerificationLink,
  getEquivalentDegrees,
  getAccreditationBodies,
  getInstitutionInfo,
  validateDegreeFieldCombination,
  DegreeCountry,
  DegreeOption,
  countryNames,
} from '../data/degreesI18n';

interface DegreeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  language: Lang;
  fieldOfStudy?: string;
  country?: DegreeCountry;
  placeholder?: string;
  onCountryChange?: (country: DegreeCountry) => void;
}

export const DegreeSelector: React.FC<DegreeSelectorProps> = ({
  value,
  onChange,
  language,
  fieldOfStudy,
  country,
  placeholder,
  onCountryChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<DegreeCountry>(country || 'GLOBAL');
  const [hoveredDegree, setHoveredDegree] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get filtered degrees based on country
  const allDegrees = getDegrees(language, selectedCountry);
  
  // Filter degrees based on search query
  const filteredDegrees = searchQuery
    ? allDegrees.filter((d) => d.toLowerCase().includes(searchQuery.toLowerCase()))
    : allDegrees;

  // Get smart suggestions based on field of study
  const smartSuggestions = fieldOfStudy ? suggestDegreesByField(fieldOfStudy) : [];
  const suggestedDegreeNames = smartSuggestions
    .map((opt) => {
      const langKey = language as keyof DegreeOption;
      return (opt[langKey] as string) || opt.en;
    })
    .filter((d) => allDegrees.includes(d));

  // Get degree info for tooltip
  const getDegreeInfoForDisplay = (degreeName: string): DegreeOption | undefined => {
    return degreeOptions.find((opt) => {
      const langKey = language as keyof DegreeOption;
      return (opt[langKey] as string) === degreeName || opt.en === degreeName;
    });
  };

  // Get all enhanced information
  const currentDegreeInfo = value ? getDegreeInfoForDisplay(value) : null;
  const verificationLink = currentDegreeInfo
    ? getVerificationLink(currentDegreeInfo.en, selectedCountry)
    : null;
  const equivalentDegrees = currentDegreeInfo ? getEquivalentDegrees(currentDegreeInfo.en) : [];
  const accreditationBodies = currentDegreeInfo ? getAccreditationBodies(currentDegreeInfo.en) : [];
  const institutionInfo = currentDegreeInfo ? getInstitutionInfo(currentDegreeInfo.en, selectedCountry) : undefined;
  const validation = fieldOfStudy && currentDegreeInfo
    ? validateDegreeFieldCombination(currentDegreeInfo.en, fieldOfStudy)
    : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountryChange = (newCountry: DegreeCountry) => {
    setSelectedCountry(newCountry);
    if (onCountryChange) {
      onCountryChange(newCountry);
    }
    // Clear selection if current degree is not available in new country
    const newDegrees = getDegrees(language, newCountry);
    if (!newDegrees.includes(value)) {
      onChange('');
    }
  };

  const handleSelect = (degree: string) => {
    onChange(degree);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsOpen(true);
    
    // Allow custom degree input
    if (query && !allDegrees.includes(query)) {
      onChange(query);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
        {/* AI Validation Warning */}
        {validation && validation.warnings && validation.warnings.length > 0 && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: validation.confidence > 70 ? '#fef3c7' : '#fee2e2',
            border: `1px solid ${validation.confidence > 70 ? '#fbbf24' : '#ef4444'}`,
            borderRadius: '0.5rem',
            marginBottom: '0.75rem',
          }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem', color: '#78350f' }}>
              ⚠️ {language === 'tr' ? 'Alan Uyarısı' : 'Field Warning'} ({validation.confidence}% {language === 'tr' ? 'Eşleşme' : 'Match'})
            </div>
            {validation.warnings.map((warning, idx) => (
              <div key={idx} style={{ fontSize: '0.75rem', color: '#78350f' }}>
                • {warning}
              </div>
            ))}
          </div>
        )}

        {/* Country Filter */}
      <div style={{ marginBottom: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
          {(() => {
            switch (language) {
              case 'tr': return 'Ülke/Bölge';
              default: return 'Country/Region';
            }
          })()}
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(['GLOBAL', 'US', 'UK', 'EU', 'TR', 'IN', 'CA', 'AU'] as DegreeCountry[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleCountryChange(c)}
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '0.875rem',
                borderRadius: '0.375rem',
                border: '1px solid',
                borderColor: selectedCountry === c ? '#3b82f6' : '#e2e8f0',
                backgroundColor: selectedCountry === c ? '#3b82f6' : 'white',
                color: selectedCountry === c ? 'white' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {c === 'GLOBAL' ? (() => {
                switch (language) {
                  case 'tr': return 'Tümü';
                  default: return 'All';
                }
              })() : c}
            </button>
          ))}
        </div>
      </div>

      {/* Degree Input with Autocomplete */}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          className="form-input"
          value={isOpen ? searchQuery : value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || (() => {
            switch (language) {
              case 'tr': return 'Derece seçin veya yazın...';
              default: return 'Select or type degree...';
            }
          })()}
          autoComplete="off"
          style={{
            width: '100%',
            paddingRight: value ? '2.5rem' : '0.75rem',
          }}
        />
        
        {/* Info icon for tooltip */}
        {value && currentDegreeInfo && (
          <div
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: '#3b82f6',
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            ℹ️
          </div>
        )}

        {/* Tooltip */}
        {showTooltip && currentDegreeInfo && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.5rem)',
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              minWidth: '250px',
              maxWidth: '350px',
            }}
          >
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem', color: '#1e293b' }}>
              {currentDegreeInfo.fullName}
            </div>
            {currentDegreeInfo.description && (
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                {currentDegreeInfo.description}
              </div>
            )}
            
            {/* Equivalent Degrees */}
            {equivalentDegrees.length > 0 && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
                  🔄 {language === 'tr' ? 'Eşdeğer Dereceler' : 'Equivalent Degrees'}:
                </div>
                {equivalentDegrees.map((eq, idx) => (
                  <div key={idx} style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '0.5rem' }}>
                    • {countryNames[eq.country]}: {eq.degreeName} ({eq.similarity}% {language === 'tr' ? 'benzerlik' : 'similar'})
                    {eq.notes && <div style={{ marginLeft: '1rem', fontStyle: 'italic' }}>→ {eq.notes}</div>}
                  </div>
                ))}
              </div>
            )}
            
            {/* Accreditation */}
            {accreditationBodies.length > 0 && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
                  ✅ {language === 'tr' ? 'Akreditasyon' : 'Accreditation'}:
                </div>
                {accreditationBodies.map((acc, idx) => (
                  <div key={idx} style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '0.5rem' }}>
                    • {acc.body} ({countryNames[acc.country]})
                    {acc.url && (
                      <a href={acc.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '0.25rem', color: '#3b82f6' }}>
                        🔗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Institutions */}
            {institutionInfo && institutionInfo.exampleInstitutions && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
                  🏛️ {language === 'tr' ? 'Örnek Kurumlar' : 'Example Institutions'}:
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '0.5rem' }}>
                  {institutionInfo.exampleInstitutions.join(', ')}
                </div>
                {institutionInfo.searchUrl && (
                  <a href={institutionInfo.searchUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#3b82f6', marginLeft: '0.5rem' }}>
                    🔍 {language === 'tr' ? 'Daha fazla ara' : 'Search more'}
                  </a>
                )}
              </div>
            )}
            
            {verificationLink && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                <a
                  href={verificationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.75rem',
                    color: '#3b82f6',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  🔗 {(() => {
                    switch (language) {
                      case 'tr': return 'Doğrulama Servisi';
                      default: return 'Verification Service';
                    }
                  })()}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Dropdown */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.25rem)',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              maxHeight: '300px',
              overflowY: 'auto',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              zIndex: 999,
            }}
          >
            {/* Smart Suggestions */}
            {suggestedDegreeNames.length > 0 && !searchQuery && (
              <div>
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#3b82f6',
                    backgroundColor: '#eff6ff',
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  💡 {(() => {
                    switch (language) {
                      case 'tr': return 'Önerilen Dereceler';
                      default: return 'Suggested Degrees';
                    }
                  })()}
                </div>
                {suggestedDegreeNames.slice(0, 3).map((degree) => {
                  const info = getDegreeInfoForDisplay(degree);
                  return (
                    <div
                      key={degree}
                      onClick={() => handleSelect(degree)}
                      onMouseEnter={() => setHoveredDegree(degree)}
                      onMouseLeave={() => setHoveredDegree(null)}
                      style={{
                        padding: '0.75rem',
                        cursor: 'pointer',
                        backgroundColor: hoveredDegree === degree ? '#f8fafc' : 'white',
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b' }}>
                        {degree}
                      </div>
                      {info?.description && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>
                          {info.description}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div style={{ borderBottom: '2px solid #e2e8f0' }} />
              </div>
            )}

            {/* All Degrees */}
            {filteredDegrees.length > 0 ? (
              filteredDegrees.map((degree) => {
                const info = getDegreeInfoForDisplay(degree);
                const isSuggested = suggestedDegreeNames.includes(degree);
                return (
                  <div
                    key={degree}
                    onClick={() => handleSelect(degree)}
                    onMouseEnter={() => setHoveredDegree(degree)}
                    onMouseLeave={() => setHoveredDegree(null)}
                    style={{
                      padding: '0.75rem',
                      cursor: 'pointer',
                      backgroundColor:
                        hoveredDegree === degree
                          ? '#f8fafc'
                          : value === degree
                          ? '#eff6ff'
                          : 'white',
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.15s',
                      display: isSuggested && !searchQuery ? 'none' : 'block',
                    }}
                  >
                    <div style={{ fontSize: '0.875rem', fontWeight: value === degree ? 600 : 400, color: '#1e293b' }}>
                      {degree}
                      {value === degree && <span style={{ marginLeft: '0.5rem', color: '#3b82f6' }}>✓</span>}
                    </div>
                    {info?.description && hoveredDegree === degree && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>
                        {info.description}
                      </div>
                    )}
                  </div>
                );
              })
            ) : searchQuery ? (
              <div
                style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#64748b',
                  textAlign: 'center',
                }}
              >
                {(() => {
                  switch (language) {
                    case 'tr': return `"${searchQuery}" özel derece olarak eklenecek`;
                    default: return `"${searchQuery}" will be added as custom degree`;
                  }
                })()}
              </div>
            ) : (
              <div
                style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#64748b',
                  textAlign: 'center',
                }}
              >
                {(() => {
                  switch (language) {
                    case 'tr': return 'Derece bulunamadı';
                    default: return 'No degrees found';
                  }
                })()}
              </div>
            )}

            {/* Custom Input Help */}
            <div
              style={{
                padding: '0.5rem 0.75rem',
                fontSize: '0.75rem',
                color: '#64748b',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
              }}
            >
              💡 {(() => {
                switch (language) {
                  case 'tr': return 'Listede yoksa özel derece adı yazabilirsiniz';
                  default: return 'Type custom degree name if not in list';
                }
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
