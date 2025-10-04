# Developer Quick Reference Guide
## Degree Input System - Advanced Features

---

## 🚀 Quick Start

### Import the Component
```typescript
import { DegreeSelector } from './components/DegreeSelector';
```

### Basic Usage
```tsx
<DegreeSelector
  value={education.degree}
  onChange={(value) => updateDegree(value)}
  language={currentLanguage}
  fieldOfStudy={education.fieldOfStudy}  // For smart suggestions
  country="GLOBAL"  // Optional country filter
/>
```

---

## 📚 API Reference

### Core Functions

#### `getDegrees(lang, country?)`
Get list of degrees filtered by language and country.
```typescript
import { getDegrees } from '../data/degreesI18n';

// All degrees in English
const degrees = getDegrees('en');

// Only US degrees in Spanish
const usDegreesES = getDegrees('es', 'US');
```

#### `getDegreeInfo(degreeName)`
Get full metadata for a degree.
```typescript
import { getDegreeInfo } from '../data/degreesI18n';

const info = getDegreeInfo('Bachelor of Science (BSc)');
// Returns: DegreeOption with all metadata
```

### Equivalency

#### `getEquivalentDegrees(degreeName, targetCountry?)`
Get equivalent degrees in other countries.
```typescript
import { getEquivalentDegrees } from '../data/degreesI18n';

// All equivalents
const equivalents = getEquivalentDegrees('Bachelor of Laws (LLB)');

// US equivalent only
const usEquiv = getEquivalentDegrees('Bachelor of Laws (LLB)', 'US');
// Returns: [{ country: 'US', degreeName: 'Juris Doctor (JD)', similarity: 75, notes: '...' }]
```

### Accreditation

#### `getAccreditationBodies(degreeName, country?)`
Get accreditation bodies for a degree.
```typescript
import { getAccreditationBodies } from '../data/degreesI18n';

const bodies = getAccreditationBodies('Master of Business Administration (MBA)');
// Returns: [{ body: 'AACSB', country: 'GLOBAL', url: '...', type: 'professional' }]
```

### Institutions

#### `getInstitutionInfo(degreeName, country?)`
Get institution information.
```typescript
import { getInstitutionInfo } from '../data/degreesI18n';

const info = getInstitutionInfo('Bachelor of Technology (B.Tech)', 'IN');
// Returns: { 
//   country: 'IN', 
//   searchUrl: 'https://www.ugc.ac.in/',
//   exampleInstitutions: ['IIT', 'NIT', 'BITS Pilani']
// }
```

### Verification

#### `getVerificationLink(degreeName, country)`
Get verification service link.
```typescript
import { getVerificationLink } from '../data/degreesI18n';

const link = getVerificationLink('Bachelor of Science (BSc)', 'US');
// Returns: 'https://www.studentclearinghouse.org/'
```

### Smart Suggestions

#### `suggestDegreesByField(fieldOfStudy)`
Get degree suggestions based on field.
```typescript
import { suggestDegreesByField } from '../data/degreesI18n';

const suggestions = suggestDegreesByField('Computer Science');
// Returns: [BSc, BCA, B.Tech, ...]
```

### AI Validation

#### `validateDegreeFieldCombination(degreeName, fieldOfStudy)`
Validate degree matches field.
```typescript
import { validateDegreeFieldCombination } from '../data/degreesI18n';

const result = validateDegreeFieldCombination('LLB', 'Computer Science');
// Returns: {
//   valid: false,
//   confidence: 40,
//   warnings: ['This degree is typically not associated with computer science field']
// }
```

### Historical Names

#### `findHistoricalDegree(searchTerm)`
Find degree by historical name.
```typescript
import { findHistoricalDegree } from '../data/degreesI18n';

const degree = findHistoricalDegree('LL.B.');
// Returns: DegreeOption for 'Bachelor of Laws (LLB)'
```

#### `findDegreeByName(name)`
Find by current or historical name.
```typescript
import { findDegreeByName } from '../data/degreesI18n';

const degree = findDegreeByName('M.B.A.');
// Returns: DegreeOption for 'Master of Business Administration (MBA)'
```

---

## 🌍 Language Support

### Supported Languages
```typescript
type Lang = 'en' | 'tr' | 'de' | 'es' | 'fr' | 'zh' | 'ar' | 'pt' | 'ja' | 'ko' | 'it' | 'nl';
```

### Language Names
```typescript
import { languageNames } from '../i18n';

console.log(languageNames['zh']); // '中文'
console.log(languageNames['ar']); // 'العربية'
```

### Translations
```typescript
import { t } from '../i18n';

const text = t('en', 'degree.equivalency');  // 'Equivalent Degrees'
const textZH = t('zh', 'degree.equivalency'); // '同等学位'
```

---

## 🌏 Country Support

### Supported Countries
```typescript
type DegreeCountry = 'US' | 'UK' | 'EU' | 'TR' | 'IN' | 'CA' | 'AU' | 'GLOBAL';
```

### Country Names
```typescript
import { countryNames } from '../data/degreesI18n';

console.log(countryNames['IN']);  // 'India'
console.log(countryNames['AU']);  // 'Australia'
```

---

## 🎓 Degree Categories

```typescript
import { degreeCategories } from '../data/degreesI18n';

// Available categories:
'high-school'  // High School
'associate'    // Associate  
'bachelor'     // Bachelor's
'master'       // Master's
'doctoral'     // Doctoral
'professional' // Professional
'other'        // Other
```

---

## 📊 Data Structures

### DegreeOption
```typescript
interface DegreeOption {
  // Translations (12 languages)
  en: string;
  tr: string;
  de?: string;
  es?: string;
  fr?: string;
  zh?: string;
  ar?: string;
  pt?: string;
  ja?: string;
  ko?: string;
  it?: string;
  nl?: string;
  
  // Metadata
  fullName?: string;
  description?: string;
  countries: DegreeCountry[];
  category: string;
  relatedFields?: string[];
  
  // Advanced features
  verificationLinks?: { [country: string]: string };
  equivalentDegrees?: DegreeEquivalency[];
  accreditation?: AccreditationInfo[];
  institutions?: InstitutionInfo[];
  historicalNames?: string[];
  aiValidation?: AIValidation;
}
```

### DegreeEquivalency
```typescript
interface DegreeEquivalency {
  country: DegreeCountry;
  degreeName: string;
  similarity: number;  // 0-100%
  notes?: string;
}
```

### AccreditationInfo
```typescript
interface AccreditationInfo {
  body: string;
  country: DegreeCountry;
  url?: string;
  type: 'national' | 'regional' | 'professional';
}
```

### InstitutionInfo
```typescript
interface InstitutionInfo {
  country: DegreeCountry;
  searchUrl?: string;
  exampleInstitutions?: string[];
}
```

### AIValidation
```typescript
interface AIValidation {
  requiredFields?: string[];
  incompatibleFields?: string[];
}
```

---

## 💡 Common Patterns

### Pattern 1: Complete Degree Info Display
```typescript
const degree = getDegreeInfo(selectedDegree);

if (degree) {
  const equivalents = getEquivalentDegrees(degree.en);
  const accreditation = getAccreditationBodies(degree.en);
  const institutions = getInstitutionInfo(degree.en, selectedCountry);
  const verification = getVerificationLink(degree.en, selectedCountry);
  
  // Display all information
}
```

### Pattern 2: Smart Degree Selection
```typescript
// User enters field of study
const fieldOfStudy = 'Computer Science';

// Get smart suggestions
const suggestions = suggestDegreesByField(fieldOfStudy);

// Display suggestions
const suggestedNames = suggestions
  .map(d => d[currentLanguage] || d.en)
  .slice(0, 3);

// When user selects degree, validate
const validation = validateDegreeFieldCombination(
  selectedDegree,
  fieldOfStudy
);

if (validation.warnings) {
  // Show warnings to user
}
```

### Pattern 3: International User Flow
```typescript
// Detect user's country
const userCountry = 'IN';

// Get country-specific degrees
const degrees = getDegrees(currentLanguage, userCountry);

// User selects degree
const selectedDegree = 'Bachelor of Technology (B.Tech)';

// Show equivalents for target country
const targetCountry = 'US';
const equivalents = getEquivalentDegrees(selectedDegree, targetCountry);

// Show institutions in user's country
const institutions = getInstitutionInfo(selectedDegree, userCountry);

// Provide verification link
const verificationLink = getVerificationLink(selectedDegree, userCountry);
```

### Pattern 4: Historical Degree Handling
```typescript
// User pastes old CV with "M.B.A."
const oldDegreeName = 'M.B.A.';

// Find modern equivalent
const modernDegree = findDegreeByName(oldDegreeName);

if (modernDegree) {
  // Update to modern name: "Master of Business Administration (MBA)"
  updateDegree(modernDegree.en);
}
```

---

## 🔧 Configuration

### Adding a New Degree
```typescript
// In src/data/degreesI18n.ts
{
  en: 'New Degree Name',
  tr: 'Türkçe İsim',
  de: 'Deutscher Name',
  // ... other languages
  fullName: 'Full Official Name',
  description: 'Detailed description',
  countries: ['US', 'GLOBAL'],
  category: 'bachelor',
  relatedFields: ['field1', 'field2'],
  equivalentDegrees: [
    {
      country: 'UK',
      degreeName: 'UK Equivalent',
      similarity: 90,
      notes: 'Optional notes'
    }
  ],
  accreditation: [
    {
      body: 'Accreditation Body',
      country: 'US',
      url: 'https://example.com',
      type: 'national'
    }
  ],
  institutions: [
    {
      country: 'US',
      searchUrl: 'https://search-url.com',
      exampleInstitutions: ['Institution 1', 'Institution 2']
    }
  ],
  historicalNames: ['Old Name 1', 'Old Name 2'],
  aiValidation: {
    requiredFields: ['required-field'],
    incompatibleFields: ['incompatible-field']
  }
}
```

### Adding a New Language
```typescript
// 1. Update Lang type in src/i18n.ts
export type Lang = 'en' | 'tr' | ... | 'newlang';

// 2. Add translations in src/i18n.ts
'key': { 
  en: 'English', 
  tr: 'Türkçe',
  newlang: 'New Language Translation'
}

// 3. Add language name
export const languageNames: Record<Lang, string> = {
  // ...
  newlang: 'Language Name'
};

// 4. Add degree translations in src/data/degreesI18n.ts
{
  en: 'Bachelor of Science',
  tr: 'Fen Fakültesi',
  newlang: 'Translation'
}

// 5. Update popup.tsx language selector
<option value="newlang">🌐 Language Name</option>
```

### Adding a New Country
```typescript
// 1. Update DegreeCountry type
export type DegreeCountry = 'US' | 'UK' | ... | 'NEWCOUNTRY';

// 2. Add country name
export const countryNames: Record<DegreeCountry, string> = {
  // ...
  NEWCOUNTRY: 'Country Name'
};

// 3. Tag relevant degrees with new country
{
  en: 'Degree Name',
  countries: ['NEWCOUNTRY', 'GLOBAL'],
  // ...
}

// 4. Update DegreeSelector country filter
{(['GLOBAL', 'US', 'UK', 'EU', 'TR', 'IN', 'CA', 'AU', 'NEWCOUNTRY'] as DegreeCountry[]).map((c) => (
  // ...
))}
```

---

## 🐛 Troubleshooting

### Degree Not Showing
```typescript
// Check country filter
const degrees = getDegrees('en', 'US'); // Only US degrees
const allDegrees = getDegrees('en');     // All degrees

// Check if degree has correct country tag
const degreeInfo = getDegreeInfo('Degree Name');
console.log(degreeInfo?.countries);  // Should include target country
```

### Translation Missing
```typescript
// Check if translation exists
const degreeInfo = getDegreeInfo('Degree Name');
console.log(degreeInfo?.de);  // Check German translation

// Fallback to English if missing
const displayName = degreeInfo?.de || degreeInfo?.en;
```

### Validation Not Working
```typescript
// Ensure field of study is provided
const validation = validateDegreeFieldCombination(
  'Bachelor of Science',
  'Computer Science'  // Must be non-empty
);

// Check if degree has aiValidation defined
const degreeInfo = getDegreeInfo('Bachelor of Science');
console.log(degreeInfo?.aiValidation);  // Should exist for validation
```

### Equivalency Not Found
```typescript
// Check if equivalency is defined
const degree = getDegreeInfo('Degree Name');
console.log(degree?.equivalentDegrees);  // Should have array

// Not all degrees have equivalents
if (!degree?.equivalentDegrees || degree.equivalentDegrees.length === 0) {
  // No equivalents defined
}
```

---

## 📈 Performance Tips

1. **Cache Degree Lists**
```typescript
const [degreeList, setDegreeList] = useState<string[]>([]);

useEffect(() => {
  setDegreeList(getDegrees(language, country));
}, [language, country]);
```

2. **Memoize Suggestions**
```typescript
const suggestions = useMemo(() => 
  suggestDegreesByField(fieldOfStudy),
  [fieldOfStudy]
);
```

3. **Debounce Search**
```typescript
const debouncedSearch = useMemo(() =>
  debounce((query: string) => {
    // Perform search
  }, 300),
  []
);
```

---

## ✅ Testing

### Unit Tests
```typescript
import { getDegrees, validateDegreeFieldCombination } from '../data/degreesI18n';

describe('Degree System', () => {
  test('getDegrees returns correct count', () => {
    const degrees = getDegrees('en');
    expect(degrees.length).toBeGreaterThan(70);
  });

  test('validation works correctly', () => {
    const result = validateDegreeFieldCombination('LLB', 'Law');
    expect(result.valid).toBe(true);
    expect(result.confidence).toBeGreaterThan(90);
  });
});
```

---

## 📚 Additional Resources

- **Full Documentation**: `DEGREE_INPUT_ENHANCEMENTS.md`
- **Implementation Guide**: `IMPLEMENTATION_SUMMARY.md`
- **Advanced Features**: `ADVANCED_FEATURES_COMPLETE.md`
- **Complete Report**: `COMPLETE_IMPLEMENTATION_REPORT.md`

---

## 🆘 Support

For issues or questions:
1. Check this quick reference
2. Review full documentation
3. Check TypeScript types
4. Test with example data
5. Contact development team

---

**Version**: 3.0.0
**Last Updated**: October 4, 2025
**Status**: Production Ready ✅
