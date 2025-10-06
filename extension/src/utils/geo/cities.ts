// Lightweight city dataset - initial set, expandable on demand
export interface City {
  name: string;
  countryCode: string;
}

export const cities: City[] = [
  // US
  { name: "New York", countryCode: "US" },
  { name: "Los Angeles", countryCode: "US" },
  { name: "Chicago", countryCode: "US" },
  { name: "San Francisco", countryCode: "US" },
  { name: "Seattle", countryCode: "US" },
  { name: "Boston", countryCode: "US" },
  { name: "Austin", countryCode: "US" },
  { name: "Denver", countryCode: "US" },
  { name: "Miami", countryCode: "US" },
  { name: "Atlanta", countryCode: "US" },
  
  // UK
  { name: "London", countryCode: "GB" },
  { name: "Manchester", countryCode: "GB" },
  { name: "Birmingham", countryCode: "GB" },
  { name: "Edinburgh", countryCode: "GB" },
  { name: "Glasgow", countryCode: "GB" },
  { name: "Bristol", countryCode: "GB" },
  { name: "Cambridge", countryCode: "GB" },
  { name: "Oxford", countryCode: "GB" },
  
  // Turkey
  { name: "Istanbul", countryCode: "TR" },
  { name: "Ankara", countryCode: "TR" },
  { name: "Izmir", countryCode: "TR" },
  { name: "Bursa", countryCode: "TR" },
  { name: "Antalya", countryCode: "TR" },
  { name: "Adana", countryCode: "TR" },
  { name: "Gaziantep", countryCode: "TR" },
  { name: "Konya", countryCode: "TR" },
  
  // Germany
  { name: "Berlin", countryCode: "DE" },
  { name: "Munich", countryCode: "DE" },
  { name: "Hamburg", countryCode: "DE" },
  { name: "Frankfurt", countryCode: "DE" },
  { name: "Cologne", countryCode: "DE" },
  { name: "Stuttgart", countryCode: "DE" },
  { name: "Düsseldorf", countryCode: "DE" },
  
  // France
  { name: "Paris", countryCode: "FR" },
  { name: "Lyon", countryCode: "FR" },
  { name: "Marseille", countryCode: "FR" },
  { name: "Toulouse", countryCode: "FR" },
  { name: "Nice", countryCode: "FR" },
  { name: "Nantes", countryCode: "FR" },
  
  // Canada
  { name: "Toronto", countryCode: "CA" },
  { name: "Vancouver", countryCode: "CA" },
  { name: "Montreal", countryCode: "CA" },
  { name: "Calgary", countryCode: "CA" },
  { name: "Ottawa", countryCode: "CA" },
  
  // Australia
  { name: "Sydney", countryCode: "AU" },
  { name: "Melbourne", countryCode: "AU" },
  { name: "Brisbane", countryCode: "AU" },
  { name: "Perth", countryCode: "AU" },
  { name: "Adelaide", countryCode: "AU" },
  
  // Other major cities
  { name: "Amsterdam", countryCode: "NL" },
  { name: "Rotterdam", countryCode: "NL" },
  { name: "Madrid", countryCode: "ES" },
  { name: "Barcelona", countryCode: "ES" },
  { name: "Rome", countryCode: "IT" },
  { name: "Milan", countryCode: "IT" },
  { name: "Tokyo", countryCode: "JP" },
  { name: "Shanghai", countryCode: "CN" },
  { name: "Beijing", countryCode: "CN" },
  { name: "Mumbai", countryCode: "IN" },
  { name: "Bangalore", countryCode: "IN" },
  { name: "Dubai", countryCode: "AE" },
  { name: "Singapore", countryCode: "SG" },
  { name: "Stockholm", countryCode: "SE" },
  { name: "Oslo", countryCode: "NO" },
  { name: "Copenhagen", countryCode: "DK" },
  { name: "Helsinki", countryCode: "FI" },
  { name: "Zurich", countryCode: "CH" },
  { name: "Vienna", countryCode: "AT" },
  { name: "Brussels", countryCode: "BE" },
  { name: "Dublin", countryCode: "IE" },
];

export function getCitiesByCountry(countryCode: string): City[] {
  return cities.filter((c) => c.countryCode === countryCode);
}

export function searchCities(query: string, countryCode?: string): City[] {
  const lowerQuery = query.toLowerCase();
  let filtered = cities;
  
  if (countryCode) {
    filtered = cities.filter((c) => c.countryCode === countryCode);
  }
  
  return filtered.filter((c) => c.name.toLowerCase().includes(lowerQuery));
}

// Placeholder for future expanded dataset download
export async function downloadExtendedCityDataset(): Promise<void> {
  // Future: fetch larger dataset from CDN and store in chrome.storage.local
  console.log("Extended city dataset download not yet implemented");
}
