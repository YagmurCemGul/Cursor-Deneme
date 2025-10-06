import React, { useState, useEffect, useRef } from "react";
import { countries, searchCountries, getCountryName } from "../../utils/geo/countries";
import { getCitiesByCountry, searchCities } from "../../utils/geo/cities";

interface CountryCitySelectProps {
  countryValue?: string;
  cityValue?: string;
  onCountryChange: (code?: string) => void;
  onCityChange: (name?: string) => void;
  locale?: "en" | "tr";
  labels?: {
    country: string;
    city: string;
    searchCountry: string;
    searchCity: string;
    noCountries: string;
    noCities: string;
  };
}

export function CountryCitySelect({
  countryValue,
  cityValue,
  onCountryChange,
  onCityChange,
  locale = "en",
  labels = {
    country: locale === "tr" ? "Ülke" : "Country",
    city: locale === "tr" ? "Şehir" : "City",
    searchCountry: locale === "tr" ? "Ülke ara..." : "Search country...",
    searchCity: locale === "tr" ? "Şehir ara..." : "Search city...",
    noCountries: locale === "tr" ? "Ülke bulunamadı" : "No countries found",
    noCities: locale === "tr" ? "Şehir bulunamadı" : "No cities found",
  },
}: CountryCitySelectProps) {
  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  
  const countryRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  const filteredCountries = countryQuery
    ? searchCountries(countryQuery, locale)
    : countries;

  const filteredCities = countryValue
    ? cityQuery
      ? searchCities(cityQuery, countryValue)
      : getCitiesByCountry(countryValue)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset city when country changes
  useEffect(() => {
    if (countryValue && cityValue) {
      const cityExists = getCitiesByCountry(countryValue).some(c => c.name === cityValue);
      if (!cityExists) {
        onCityChange(undefined);
      }
    }
  }, [countryValue]);

  return (
    <div className="country-city-select" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      {/* Country Select */}
      <div ref={countryRef} style={{ position: "relative", flex: "1 1 200px" }}>
        <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>
          {labels.country}
        </label>
        <button
          type="button"
          onClick={() => setCountryOpen(!countryOpen)}
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: "white",
            textAlign: "left",
            cursor: "pointer",
          }}
          aria-haspopup="listbox"
          aria-expanded={countryOpen}
        >
          {countryValue ? getCountryName(countryValue, locale) : labels.searchCountry}
        </button>

        {countryOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: "0.25rem",
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
              maxHeight: "200px",
              overflow: "auto",
              zIndex: 100,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            role="listbox"
          >
            <input
              type="text"
              value={countryQuery}
              onChange={(e) => setCountryQuery(e.target.value)}
              placeholder={labels.searchCountry}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "none",
                borderBottom: "1px solid #eee",
                outline: "none",
              }}
              autoFocus
            />
            {filteredCountries.length === 0 ? (
              <div style={{ padding: "0.5rem", color: "#666" }}>{labels.noCountries}</div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onCountryChange(country.code);
                    setCountryOpen(false);
                    setCountryQuery("");
                  }}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "none",
                    background: country.code === countryValue ? "#e8f4ff" : "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                  role="option"
                  aria-selected={country.code === countryValue}
                >
                  {locale === "tr" ? country.nameTr : country.nameEn}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* City Select */}
      <div ref={cityRef} style={{ position: "relative", flex: "1 1 200px" }}>
        <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>
          {labels.city}
        </label>
        <button
          type="button"
          onClick={() => setCityOpen(!cityOpen)}
          disabled={!countryValue}
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: countryValue ? "white" : "#f5f5f5",
            textAlign: "left",
            cursor: countryValue ? "pointer" : "not-allowed",
            opacity: countryValue ? 1 : 0.6,
          }}
          aria-haspopup="listbox"
          aria-expanded={cityOpen}
        >
          {cityValue || labels.searchCity}
        </button>

        {cityOpen && countryValue && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: "0.25rem",
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
              maxHeight: "200px",
              overflow: "auto",
              zIndex: 100,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            role="listbox"
          >
            <input
              type="text"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder={labels.searchCity}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "none",
                borderBottom: "1px solid #eee",
                outline: "none",
              }}
              autoFocus
            />
            {filteredCities.length === 0 ? (
              <div style={{ padding: "0.5rem", color: "#666" }}>{labels.noCities}</div>
            ) : (
              filteredCities.map((city) => (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => {
                    onCityChange(city.name);
                    setCityOpen(false);
                    setCityQuery("");
                  }}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "none",
                    background: city.name === cityValue ? "#e8f4ff" : "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                  role="option"
                  aria-selected={city.name === cityValue}
                >
                  {city.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
