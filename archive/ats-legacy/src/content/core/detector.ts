/**
 * Form field detection and mapping
 * Identifies input fields and maps them to profile data
 */

export type FieldType =
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'phone'
  | 'city'
  | 'country'
  | 'address'
  | 'linkedin'
  | 'github'
  | 'portfolio'
  | 'website'
  | 'resume'
  | 'cover_letter'
  | 'salary_expectation'
  | 'notice_period'
  | 'work_auth'
  | 'visa_sponsorship'
  | 'relocation'
  | 'start_date'
  | 'custom_question'
  | 'unknown';

export interface DetectedField {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  type: FieldType;
  label: string;
  confidence: number;
}

/**
 * Field detection dictionary with patterns
 */
const FIELD_PATTERNS: Record<FieldType, string[]> = {
  first_name: ['first name', 'firstname', 'given name', 'forename', 'prenom', 'ad', 'isim'],
  last_name: ['last name', 'lastname', 'surname', 'family name', 'nom', 'soyad', 'soyadı'],
  email: ['email', 'e-mail', 'mail', 'electronic mail', 'eposta', 'e-posta'],
  phone: ['phone', 'telephone', 'mobile', 'cell', 'telefon', 'cep'],
  city: ['city', 'town', 'municipality', 'şehir', 'il'],
  country: ['country', 'nation', 'ülke', 'ulke'],
  address: ['address', 'street', 'location', 'adres'],
  linkedin: ['linkedin', 'linked in'],
  github: ['github', 'git hub'],
  portfolio: ['portfolio', 'website', 'personal site', 'portföy', 'portfolyo'],
  website: ['website', 'web site', 'url', 'link'],
  resume: ['resume', 'cv', 'curriculum vitae', 'özgeçmiş', 'ozgecmis'],
  cover_letter: ['cover letter', 'coverletter', 'motivation letter', 'ön yazı', 'on yazi'],
  salary_expectation: ['salary', 'compensation', 'expected salary', 'maaş', 'maas', 'ücret', 'ucret'],
  notice_period: ['notice', 'availability', 'start date', 'when can you start', 'ne zaman başlayabilirsiniz'],
  work_auth: ['authorized', 'work authorization', 'eligibility', 'çalışma izni', 'calisma izni'],
  visa_sponsorship: ['visa', 'sponsorship', 'require sponsorship', 'vize'],
  relocation: ['relocate', 'relocation', 'willing to relocate', 'taşınma', 'tasinma'],
  start_date: ['start date', 'available from', 'başlangıç', 'baslangic'],
  custom_question: [],
  unknown: [],
};

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function similarity(a: string, b: string): number {
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  const maxLength = Math.max(a.length, b.length);
  return 1 - distance / maxLength;
}

/**
 * Extract label text from form field
 */
function extractLabel(element: HTMLElement): string {
  // Check for associated label
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label.textContent?.trim() || '';
  }

  // Check for parent label
  const parentLabel = element.closest('label');
  if (parentLabel) {
    return parentLabel.textContent?.replace(element.textContent || '', '').trim() || '';
  }

  // Check for aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel.trim();

  // Check for placeholder
  const placeholder = element.getAttribute('placeholder');
  if (placeholder) return placeholder.trim();

  // Check for name attribute
  const name = element.getAttribute('name');
  if (name) return name.replace(/[_-]/g, ' ').trim();

  // Check for nearby text
  const prev = element.previousElementSibling;
  if (prev?.textContent) return prev.textContent.trim();

  return '';
}

/**
 * Match label text to field type
 */
function matchFieldType(labelText: string): { type: FieldType; confidence: number } {
  const normalized = labelText.toLowerCase().trim();
  
  let bestMatch: FieldType = 'unknown';
  let bestScore = 0;

  for (const [fieldType, patterns] of Object.entries(FIELD_PATTERNS)) {
    for (const pattern of patterns) {
      // Exact match
      if (normalized.includes(pattern)) {
        const score = pattern.length / normalized.length;
        if (score > bestScore) {
          bestScore = Math.min(score, 0.95);
          bestMatch = fieldType as FieldType;
        }
      }

      // Fuzzy match
      const sim = similarity(normalized, pattern);
      if (sim > 0.8 && sim > bestScore) {
        bestScore = sim * 0.8; // Reduce confidence for fuzzy matches
        bestMatch = fieldType as FieldType;
      }
    }
  }

  // If still unknown but field has label, mark as custom_question
  if (bestMatch === 'unknown' && labelText.length > 0) {
    return { type: 'custom_question', confidence: 0.5 };
  }

  return { type: bestMatch, confidence: bestScore };
}

/**
 * Detect all form fields on the page
 */
export function detectFields(): DetectedField[] {
  const fields: DetectedField[] = [];
  
  // Find all input, textarea, and select elements
  const elements = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'
  );

  for (const element of elements) {
    // Skip if not visible
    if (!element.offsetParent) continue;

    const label = extractLabel(element);
    const { type, confidence } = matchFieldType(label);

    // Only include fields with reasonable confidence
    if (confidence > 0.3 || type === 'custom_question') {
      fields.push({
        element,
        type,
        label,
        confidence,
      });
    }
  }

  return fields;
}

/**
 * Detect fields within a specific container
 */
export function detectFieldsInContainer(container: HTMLElement): DetectedField[] {
  const fields: DetectedField[] = [];
  
  const elements = container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'
  );

  for (const element of elements) {
    if (!element.offsetParent) continue;

    const label = extractLabel(element);
    const { type, confidence } = matchFieldType(label);

    if (confidence > 0.3 || type === 'custom_question') {
      fields.push({
        element,
        type,
        label,
        confidence,
      });
    }
  }

  return fields;
}
