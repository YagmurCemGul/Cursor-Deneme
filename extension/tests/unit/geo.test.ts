// Unit tests for geo utilities
import { describe, it, expect } from "@jest/globals";
import { searchCountries, getCountryName } from "../../src/utils/geo/countries";
import { getCitiesByCountry, searchCities } from "../../src/utils/geo/cities";

describe("Geo utilities", () => {
  describe("Countries", () => {
    it("should search countries by name", () => {
      const results = searchCountries("united", "en");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((c) => c.code === "US")).toBe(true);
    });

    it("should get country name by code", () => {
      expect(getCountryName("US", "en")).toBe("United States");
      expect(getCountryName("TR", "tr")).toBe("Türkiye");
    });

    it("should return code for unknown country", () => {
      expect(getCountryName("XX", "en")).toBe("XX");
    });
  });

  describe("Cities", () => {
    it("should get cities by country", () => {
      const usCities = getCitiesByCountry("US");
      expect(usCities.length).toBeGreaterThan(0);
      expect(usCities.every((c) => c.countryCode === "US")).toBe(true);
    });

    it("should search cities", () => {
      const results = searchCities("new");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((c) => c.name === "New York")).toBe(true);
    });

    it("should filter cities by country", () => {
      const results = searchCities("istanbul", "TR");
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((c) => c.countryCode === "TR")).toBe(true);
    });
  });
});
