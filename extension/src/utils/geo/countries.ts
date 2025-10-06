// Lightweight country dataset with i18n support
export interface Country {
  code: string;
  nameEn: string;
  nameTr: string;
}

export const countries: Country[] = [
  { code: "US", nameEn: "United States", nameTr: "Amerika Birleşik Devletleri" },
  { code: "GB", nameEn: "United Kingdom", nameTr: "Birleşik Krallık" },
  { code: "TR", nameEn: "Turkey", nameTr: "Türkiye" },
  { code: "DE", nameEn: "Germany", nameTr: "Almanya" },
  { code: "FR", nameEn: "France", nameTr: "Fransa" },
  { code: "ES", nameEn: "Spain", nameTr: "İspanya" },
  { code: "IT", nameEn: "Italy", nameTr: "İtalya" },
  { code: "NL", nameEn: "Netherlands", nameTr: "Hollanda" },
  { code: "CA", nameEn: "Canada", nameTr: "Kanada" },
  { code: "AU", nameEn: "Australia", nameTr: "Avustralya" },
  { code: "JP", nameEn: "Japan", nameTr: "Japonya" },
  { code: "CN", nameEn: "China", nameTr: "Çin" },
  { code: "IN", nameEn: "India", nameTr: "Hindistan" },
  { code: "BR", nameEn: "Brazil", nameTr: "Brezilya" },
  { code: "MX", nameEn: "Mexico", nameTr: "Meksika" },
  { code: "RU", nameEn: "Russia", nameTr: "Rusya" },
  { code: "ZA", nameEn: "South Africa", nameTr: "Güney Afrika" },
  { code: "AE", nameEn: "United Arab Emirates", nameTr: "Birleşik Arap Emirlikleri" },
  { code: "SG", nameEn: "Singapore", nameTr: "Singapur" },
  { code: "SE", nameEn: "Sweden", nameTr: "İsveç" },
  { code: "NO", nameEn: "Norway", nameTr: "Norveç" },
  { code: "DK", nameEn: "Denmark", nameTr: "Danimarka" },
  { code: "FI", nameEn: "Finland", nameTr: "Finlandiya" },
  { code: "CH", nameEn: "Switzerland", nameTr: "İsviçre" },
  { code: "AT", nameEn: "Austria", nameTr: "Avusturya" },
  { code: "BE", nameEn: "Belgium", nameTr: "Belçika" },
  { code: "IE", nameEn: "Ireland", nameTr: "İrlanda" },
  { code: "PL", nameEn: "Poland", nameTr: "Polonya" },
  { code: "PT", nameEn: "Portugal", nameTr: "Portekiz" },
  { code: "GR", nameEn: "Greece", nameTr: "Yunanistan" },
];

export function getCountryName(code: string, locale: string = "en"): string {
  const country = countries.find((c) => c.code === code);
  if (!country) return code;
  return locale === "tr" ? country.nameTr : country.nameEn;
}

export function searchCountries(query: string, locale: string = "en"): Country[] {
  const lowerQuery = query.toLowerCase();
  return countries.filter((c) => {
    const name = locale === "tr" ? c.nameTr : c.nameEn;
    return name.toLowerCase().includes(lowerQuery) || c.code.toLowerCase().includes(lowerQuery);
  });
}
