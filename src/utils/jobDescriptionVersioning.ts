import { SavedJobDescription } from '../types';

/**
 * Job Description Version Management
 * Tracks changes and maintains version history for job descriptions
 */

export interface JobDescriptionVersion {
  id: string;
  descriptionId: string;
  versionNumber: number;
  data: SavedJobDescription;
  createdAt: string;
  createdBy?: string;
  changesSummary?: string;
  changeLog?: VersionChange[];
}

export interface VersionChange {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
}

export interface VersionComparison {
  added: string[];
  removed: string[];
  modified: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
}

/**
 * Create a new version from a job description
 */
export function createVersion(
  description: SavedJobDescription,
  previousVersion?: JobDescriptionVersion,
  changesSummary?: string
): JobDescriptionVersion {
  const versionNumber = previousVersion ? previousVersion.versionNumber + 1 : 1;
  
  const changeLog = previousVersion 
    ? generateChangeLog(previousVersion.data, description)
    : [];

  return {
    id: crypto.randomUUID(),
    descriptionId: description.id,
    versionNumber,
    data: { ...description },
    createdAt: new Date().toISOString(),
    changesSummary: changesSummary || generateAutoSummary(changeLog),
    changeLog,
  };
}

/**
 * Generate automatic change summary
 */
function generateAutoSummary(changeLog: VersionChange[]): string {
  if (changeLog.length === 0) {
    return 'Initial version';
  }

  const fields = changeLog.map(c => c.field);
  const uniqueFields = Array.from(new Set(fields));
  
  if (uniqueFields.length === 1) {
    return `Updated ${uniqueFields[0]}`;
  } else if (uniqueFields.length <= 3) {
    return `Updated ${uniqueFields.join(', ')}`;
  } else {
    return `Updated ${uniqueFields.length} fields`;
  }
}

/**
 * Generate detailed change log between two versions
 */
function generateChangeLog(
  oldData: SavedJobDescription,
  newData: SavedJobDescription
): VersionChange[] {
  const changes: VersionChange[] = [];
  const timestamp = new Date().toISOString();

  // Compare all fields
  const fields: (keyof SavedJobDescription)[] = [
    'name',
    'description',
    'category',
    'tags',
  ];

  fields.forEach(field => {
    const oldValue = oldData[field];
    const newValue = newData[field];

    // Handle arrays differently
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field,
          oldValue,
          newValue,
          timestamp,
        });
      }
    } else if (oldValue !== newValue) {
      changes.push({
        field,
        oldValue,
        newValue,
        timestamp,
      });
    }
  });

  return changes;
}

/**
 * Compare two versions and return differences
 */
export function compareVersions(
  version1: JobDescriptionVersion,
  version2: JobDescriptionVersion
): VersionComparison {
  const comparison: VersionComparison = {
    added: [],
    removed: [],
    modified: [],
  };

  const v1Data = version1.data;
  const v2Data = version2.data;

  // Compare description text for added/removed lines
  const v1Lines = v1Data.description.split('\n');
  const v2Lines = v2Data.description.split('\n');

  v2Lines.forEach(line => {
    if (!v1Lines.includes(line) && line.trim()) {
      comparison.added.push(line);
    }
  });

  v1Lines.forEach(line => {
    if (!v2Lines.includes(line) && line.trim()) {
      comparison.removed.push(line);
    }
  });

  // Compare other fields
  if (v1Data.name !== v2Data.name) {
    comparison.modified.push({
      field: 'name',
      oldValue: v1Data.name,
      newValue: v2Data.name,
    });
  }

  if (v1Data.category !== v2Data.category) {
    comparison.modified.push({
      field: 'category',
      oldValue: v1Data.category,
      newValue: v2Data.category,
    });
  }

  if (JSON.stringify(v1Data.tags) !== JSON.stringify(v2Data.tags)) {
    comparison.modified.push({
      field: 'tags',
      oldValue: v1Data.tags,
      newValue: v2Data.tags,
    });
  }

  return comparison;
}

/**
 * Get version statistics
 */
export function getVersionStats(versions: JobDescriptionVersion[]): {
  totalVersions: number;
  totalChanges: number;
  mostChangedField: string;
  oldestVersion: string;
  newestVersion: string;
} {
  if (versions.length === 0) {
    return {
      totalVersions: 0,
      totalChanges: 0,
      mostChangedField: 'none',
      oldestVersion: '',
      newestVersion: '',
    };
  }

  const fieldCounts: Record<string, number> = {};
  let totalChanges = 0;

  versions.forEach(version => {
    if (version.changeLog) {
      totalChanges += version.changeLog.length;
      version.changeLog.forEach(change => {
        fieldCounts[change.field] = (fieldCounts[change.field] || 0) + 1;
      });
    }
  });

  const mostChangedField = Object.keys(fieldCounts).length > 0
    ? Object.keys(fieldCounts).reduce((a, b) => 
        fieldCounts[a] > fieldCounts[b] ? a : b
      )
    : 'none';

  const sorted = [...versions].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return {
    totalVersions: versions.length,
    totalChanges,
    mostChangedField,
    oldestVersion: sorted[0].createdAt,
    newestVersion: sorted[sorted.length - 1].createdAt,
  };
}

/**
 * Restore a specific version
 */
export function restoreVersion(
  version: JobDescriptionVersion
): SavedJobDescription {
  return {
    ...version.data,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate diff text for display
 */
export function generateDiffText(comparison: VersionComparison): string {
  const parts: string[] = [];

  if (comparison.added.length > 0) {
    parts.push('Added:');
    comparison.added.forEach(line => {
      parts.push(`+ ${line}`);
    });
    parts.push('');
  }

  if (comparison.removed.length > 0) {
    parts.push('Removed:');
    comparison.removed.forEach(line => {
      parts.push(`- ${line}`);
    });
    parts.push('');
  }

  if (comparison.modified.length > 0) {
    parts.push('Modified:');
    comparison.modified.forEach(mod => {
      parts.push(`• ${mod.field}: "${mod.oldValue}" → "${mod.newValue}"`);
    });
  }

  return parts.join('\n');
}

/**
 * Auto-save version on change
 */
export function shouldAutoSave(
  currentData: SavedJobDescription,
  lastVersion?: JobDescriptionVersion,
  minChangeThreshold: number = 50
): boolean {
  if (!lastVersion) {
    return true;
  }

  const changes = generateChangeLog(lastVersion.data, currentData);
  
  // Auto-save if significant changes
  if (changes.length >= 2) {
    return true;
  }

  // Check description length change
  const descChange = Math.abs(
    currentData.description.length - lastVersion.data.description.length
  );

  return descChange >= minChangeThreshold;
}

/**
 * Prune old versions (keep only N most recent)
 */
export function pruneVersions(
  versions: JobDescriptionVersion[],
  keepCount: number = 20
): JobDescriptionVersion[] {
  if (versions.length <= keepCount) {
    return versions;
  }

  return versions
    .sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, keepCount);
}

/**
 * Export version history
 */
export function exportVersionHistory(
  versions: JobDescriptionVersion[]
): string {
  return JSON.stringify(versions, null, 2);
}

/**
 * Import version history
 */
export function importVersionHistory(
  jsonString: string
): JobDescriptionVersion[] {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) {
      throw new Error('Invalid version history format');
    }
    return data;
  } catch (error) {
    throw new Error(`Failed to import version history: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
