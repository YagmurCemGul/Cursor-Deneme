// import { StorageService } from './storage';

export interface TemplateVersion {
  id: string;
  templateId: string;
  versionNumber: number;
  content: string;
  metadata: {
    name: string;
    description: string;
    category: string;
    tags: string[];
  };
  changes: VersionChange[];
  createdAt: string;
  createdBy?: string;
  commitMessage?: string;
}

export interface VersionChange {
  type: 'addition' | 'deletion' | 'modification';
  lineNumber: number;
  oldContent?: string;
  newContent?: string;
}

export interface DiffResult {
  additions: number;
  deletions: number;
  modifications: number;
  changes: VersionChange[];
}

export class VersionControlSystem {
  /**
   * Create a new version of a template
   */
  static async createVersion(
    templateId: string,
    content: string,
    metadata: TemplateVersion['metadata'],
    commitMessage?: string,
  ): Promise<TemplateVersion> {
    const versions = await this.getVersions(templateId);
    const latestVersion = versions[0];
    
    const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
    const changes = latestVersion 
      ? this.calculateDiff(latestVersion.content, content)
      : [];

    const newVersion: TemplateVersion = {
      id: `${templateId}-v${versionNumber}-${Date.now()}`,
      templateId,
      versionNumber,
      content,
      metadata,
      changes: Array.isArray(changes) ? changes : changes.changes || [],
      createdAt: new Date().toISOString(),
      commitMessage: commitMessage || `Version ${versionNumber}`,
    };

    await this.saveVersion(newVersion);
    return newVersion;
  }

  /**
   * Get all versions of a template
   */
  static async getVersions(templateId: string): Promise<TemplateVersion[]> {
    const { templateVersions = [] } = await chrome.storage.local.get('templateVersions');
    return templateVersions
      .filter((v: TemplateVersion) => v.templateId === templateId)
      .sort((a: TemplateVersion, b: TemplateVersion) => b.versionNumber - a.versionNumber);
  }

  /**
   * Get a specific version
   */
  static async getVersion(versionId: string): Promise<TemplateVersion | null> {
    const { templateVersions = [] } = await chrome.storage.local.get('templateVersions');
    return templateVersions.find((v: TemplateVersion) => v.id === versionId) || null;
  }

  /**
   * Save a version to storage
   */
  private static async saveVersion(version: TemplateVersion): Promise<void> {
    const { templateVersions = [] } = await chrome.storage.local.get('templateVersions');
    
    // Keep only last 20 versions per template
    const otherVersions = templateVersions.filter(
      (v: TemplateVersion) => v.templateId !== version.templateId
    );
    const thisTemplateVersions = templateVersions
      .filter((v: TemplateVersion) => v.templateId === version.templateId)
      .sort((a: TemplateVersion, b: TemplateVersion) => b.versionNumber - a.versionNumber)
      .slice(0, 19); // Keep 19 + new one = 20 total

    await chrome.storage.local.set({
      templateVersions: [...otherVersions, ...thisTemplateVersions, version],
    });
  }

  /**
   * Calculate diff between two contents
   */
  static calculateDiff(oldContent: string, newContent: string): DiffResult {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    
    const changes: VersionChange[] = [];
    let additions = 0;
    let deletions = 0;
    let modifications = 0;

    const maxLength = Math.max(oldLines.length, newLines.length);

    for (let i = 0; i < maxLength; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === undefined && newLine !== undefined) {
        // Addition
        changes.push({
          type: 'addition',
          lineNumber: i + 1,
          newContent: newLine,
        });
        additions++;
      } else if (oldLine !== undefined && newLine === undefined) {
        // Deletion
        changes.push({
          type: 'deletion',
          lineNumber: i + 1,
          oldContent: oldLine,
        });
        deletions++;
      } else if (oldLine !== newLine) {
        // Modification
        changes.push({
          type: 'modification',
          lineNumber: i + 1,
          oldContent: oldLine || '',
          newContent: newLine || '',
        });
        modifications++;
      }
    }

    return {
      additions,
      deletions,
      modifications,
      changes,
    };
  }

  /**
   * Compare two versions
   */
  static async compareVersions(
    versionId1: string,
    versionId2: string,
  ): Promise<DiffResult | null> {
    const version1 = await this.getVersion(versionId1);
    const version2 = await this.getVersion(versionId2);

    if (!version1 || !version2) return null;

    return this.calculateDiff(version1.content, version2.content);
  }

  /**
   * Restore a specific version
   */
  static async restoreVersion(versionId: string): Promise<TemplateVersion | null> {
    const version = await this.getVersion(versionId);
    if (!version) return null;

    // Create a new version based on the restored content
    return await this.createVersion(
      version.templateId,
      version.content,
      version.metadata,
      `Restored from version ${version.versionNumber}`,
    );
  }

  /**
   * Delete all versions of a template
   */
  static async deleteTemplateVersions(templateId: string): Promise<void> {
    const { templateVersions = [] } = await chrome.storage.local.get('templateVersions');
    const filtered = templateVersions.filter((v: TemplateVersion) => v.templateId !== templateId);
    await chrome.storage.local.set({ templateVersions: filtered });
  }

  /**
   * Get version history with statistics
   */
  static async getVersionHistory(templateId: string): Promise<{
    versions: TemplateVersion[];
    totalVersions: number;
    totalChanges: number;
    firstCreated: string;
    lastUpdated: string;
  }> {
    const versions = await this.getVersions(templateId);
    
    const totalChanges = versions.reduce(
      (sum, v) => sum + (v.changes?.length || 0),
      0
    );

    return {
      versions,
      totalVersions: versions.length,
      totalChanges,
      firstCreated: versions[versions.length - 1]?.createdAt || new Date().toISOString(),
      lastUpdated: versions[0]?.createdAt || new Date().toISOString(),
    };
  }

  /**
   * Create a branch from a version (for future collaborative features)
   */
  static async createBranch(
    versionId: string,
    branchName: string,
  ): Promise<TemplateVersion | null> {
    const version = await this.getVersion(versionId);
    if (!version) return null;

    // Create new template ID for branch
    const branchTemplateId = `${version.templateId}-${branchName}-${Date.now()}`;
    
    return await this.createVersion(
      branchTemplateId,
      version.content,
      version.metadata,
      `Branched from ${version.templateId} v${version.versionNumber}`,
    );
  }

  /**
   * Generate changelog between versions
   */
  static generateChangelog(changes: VersionChange[]): string {
    const additions = changes.filter(c => c.type === 'addition');
    const deletions = changes.filter(c => c.type === 'deletion');
    const modifications = changes.filter(c => c.type === 'modification');

    let changelog = '## Changes\n\n';
    
    if (additions.length > 0) {
      changelog += `### Added (${additions.length} lines)\n`;
      additions.forEach(c => {
        changelog += `- Line ${c.lineNumber}: ${c.newContent}\n`;
      });
      changelog += '\n';
    }

    if (modifications.length > 0) {
      changelog += `### Modified (${modifications.length} lines)\n`;
      modifications.forEach(c => {
        changelog += `- Line ${c.lineNumber}:\n`;
        changelog += `  - Old: ${c.oldContent}\n`;
        changelog += `  - New: ${c.newContent}\n`;
      });
      changelog += '\n';
    }

    if (deletions.length > 0) {
      changelog += `### Removed (${deletions.length} lines)\n`;
      deletions.forEach(c => {
        changelog += `- Line ${c.lineNumber}: ${c.oldContent}\n`;
      });
    }

    return changelog;
  }
}
