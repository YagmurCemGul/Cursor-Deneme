import { SavedJobDescription } from '../types';
import { logger } from './logger';

/**
 * Export job descriptions to JSON format
 */
export function exportToJSON(descriptions: SavedJobDescription[]): string {
  return JSON.stringify(descriptions, null, 2);
}

/**
 * Export job descriptions to CSV format
 */
export function exportToCSV(descriptions: SavedJobDescription[]): string {
  if (descriptions.length === 0) return '';

  const headers = ['ID', 'Name', 'Description', 'Category', 'Tags', 'Created At', 'Updated At', 'Usage Count'];
  const csvRows = [headers.join(',')];

  descriptions.forEach(desc => {
    const row = [
      desc.id,
      `"${desc.name.replace(/"/g, '""')}"`,
      `"${desc.description.replace(/"/g, '""')}"`,
      `"${desc.category || ''}"`,
      `"${desc.tags?.join('; ') || ''}"`,
      desc.createdAt,
      desc.updatedAt,
      desc.usageCount?.toString() || '0'
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

/**
 * Import job descriptions from JSON string
 */
export function importFromJSON(jsonString: string): SavedJobDescription[] {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) {
      throw new Error('Invalid JSON format: expected array');
    }
    
    // Validate and normalize the data
    return data.map((item: any) => ({
      id: item.id || crypto.randomUUID(),
      name: item.name || 'Untitled',
      description: item.description || '',
      category: item.category,
      tags: Array.isArray(item.tags) ? item.tags : [],
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
      usageCount: typeof item.usageCount === 'number' ? item.usageCount : 0
    }));
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Import job descriptions from CSV string
 */
export function importFromCSV(csvString: string): SavedJobDescription[] {
  const lines = csvString.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }

  // Skip header row
  const dataLines = lines.slice(1);
  const descriptions: SavedJobDescription[] = [];

  dataLines.forEach((line, index) => {
    try {
      // Parse CSV line respecting quoted fields
      const fields = parseCSVLine(line);
      
      if (fields.length < 8) {
        logger.warn(`Skipping line ${index + 2}: insufficient fields`);
        return;
      }

      descriptions.push({
        id: fields[0] || crypto.randomUUID(),
        name: fields[1] || 'Untitled',
        description: fields[2] || '',
        category: fields[3] || undefined,
        tags: fields[4] ? fields[4].split(';').map(t => t.trim()).filter(Boolean) : [],
        createdAt: fields[5] || new Date().toISOString(),
        updatedAt: fields[6] || new Date().toISOString(),
        usageCount: parseInt(fields[7]) || 0
      });
    } catch (error) {
      logger.error(`Error parsing line ${index + 2}:`, error);
    }
  });

  return descriptions;
}

/**
 * Parse a CSV line respecting quoted fields
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }

  fields.push(currentField);
  return fields;
}

/**
 * Download a file with the given content
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Process template variables in text
 * Example: "Apply for {{role}} at {{company}}" with variables {role: "Developer", company: "Google"}
 */
export function processTemplateVariables(
  text: string,
  variables: Record<string, string>
): string {
  let result = text;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    result = result.replace(regex, value);
  });

  return result;
}

/**
 * Extract template variable names from text
 */
export function extractTemplateVariables(text: string): string[] {
  const regex = /\{\{\s*([^}]+)\s*\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const varName = match[1].trim();
    if (!variables.includes(varName)) {
      variables.push(varName);
    }
  }

  return variables;
}

/**
 * Duplicate a job description with a new ID
 */
export function duplicateJobDescription(desc: SavedJobDescription): SavedJobDescription {
  return {
    ...desc,
    id: crypto.randomUUID(),
    name: `${desc.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0
  };
}

/**
 * Filter descriptions by date range
 */
export function filterByDateRange(
  descriptions: SavedJobDescription[],
  startDate: string | null,
  endDate: string | null
): SavedJobDescription[] {
  return descriptions.filter(desc => {
    const descDate = new Date(desc.updatedAt);
    
    if (startDate && descDate < new Date(startDate)) {
      return false;
    }
    
    if (endDate && descDate > new Date(endDate)) {
      return false;
    }
    
    return true;
  });
}

/**
 * Sort descriptions by various criteria
 */
export function sortDescriptions(
  descriptions: SavedJobDescription[],
  sortBy: 'name' | 'date' | 'usage' | 'category',
  sortOrder: 'asc' | 'desc' = 'desc'
): SavedJobDescription[] {
  const sorted = [...descriptions].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'usage':
        comparison = (a.usageCount || 0) - (b.usageCount || 0);
        break;
      case 'category':
        comparison = (a.category || '').localeCompare(b.category || '');
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Generate sharing URL for a job description
 */
export function generateShareableLink(description: SavedJobDescription): string {
  const data = btoa(JSON.stringify({
    name: description.name,
    description: description.description,
    category: description.category,
    tags: description.tags
  }));
  
  return `${window.location.origin}?shared=${encodeURIComponent(data)}`;
}

/**
 * Parse shared job description from URL
 */
export function parseSharedDescription(shareData: string): Partial<SavedJobDescription> | null {
  try {
    const decoded = atob(decodeURIComponent(shareData));
    const data = JSON.parse(decoded);
    
    return {
      name: data.name,
      description: data.description,
      category: data.category,
      tags: data.tags
    };
  } catch (error) {
    logger.error('Failed to parse shared description:', error);
    return null;
  }
}
