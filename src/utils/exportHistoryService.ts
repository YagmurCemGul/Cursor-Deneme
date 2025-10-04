/**
 * Export History Service
 * Tracks all export operations for analytics and quick re-export
 */

import { ExportRecord } from '../types';
import { StorageService } from './storage';

export class ExportHistoryService {
  private static readonly STORAGE_KEY = 'export_history';
  private static readonly MAX_RECORDS = 500; // Keep last 500 exports

  /**
   * Add a new export record to history
   */
  static async addRecord(record: ExportRecord): Promise<void> {
    const history = await this.getHistory();
    history.unshift(record); // Add to beginning

    // Keep only the most recent records
    if (history.length > this.MAX_RECORDS) {
      history.splice(this.MAX_RECORDS);
    }

    await StorageService.set(this.STORAGE_KEY, history);
  }

  /**
   * Get all export history
   */
  static async getHistory(): Promise<ExportRecord[]> {
    const history = await StorageService.get<ExportRecord[]>(this.STORAGE_KEY);
    return history || [];
  }

  /**
   * Get history filtered by type
   */
  static async getHistoryByType(type: 'cv' | 'cover-letter'): Promise<ExportRecord[]> {
    const history = await this.getHistory();
    return history.filter((record) => record.type === type);
  }

  /**
   * Get history for a specific date range
   */
  static async getHistoryByDateRange(startDate: string, endDate: string): Promise<ExportRecord[]> {
    const history = await this.getHistory();
    return history.filter((record) => {
      const recordDate = new Date(record.timestamp);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return recordDate >= start && recordDate <= end;
    });
  }

  /**
   * Get export statistics
   */
  static async getStatistics(): Promise<{
    totalExports: number;
    successfulExports: number;
    failedExports: number;
    byType: { cv: number; coverLetter: number };
    byFormat: Record<string, number>;
    byDate: Record<string, number>;
    lastExport?: ExportRecord;
  }> {
    const history = await this.getHistory();

    const stats = {
      totalExports: history.length,
      successfulExports: history.filter((r) => r.success).length,
      failedExports: history.filter((r) => !r.success).length,
      byType: {
        cv: history.filter((r) => r.type === 'cv').length,
        coverLetter: history.filter((r) => r.type === 'cover-letter').length,
      },
      byFormat: {} as Record<string, number>,
      byDate: {} as Record<string, number>,
      lastExport: history[0],
    };

    // Count by format
    history.forEach((record) => {
      record.formats.forEach((format) => {
        if (format.success) {
          stats.byFormat[format.format] = (stats.byFormat[format.format] || 0) + 1;
        }
      });
    });

    // Count by date (YYYY-MM-DD)
    history.forEach((record) => {
      const date = record.timestamp.split('T')[0]!;
      stats.byDate[date] = (stats.byDate[date] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get recent exports (last N)
   */
  static async getRecentExports(count: number = 10): Promise<ExportRecord[]> {
    const history = await this.getHistory();
    return history.slice(0, count);
  }

  /**
   * Delete an export record
   */
  static async deleteRecord(id: string): Promise<void> {
    const history = await this.getHistory();
    const filtered = history.filter((record) => record.id !== id);
    await StorageService.set(this.STORAGE_KEY, filtered);
  }

  /**
   * Clear all export history
   */
  static async clearHistory(): Promise<void> {
    await StorageService.set(this.STORAGE_KEY, []);
  }

  /**
   * Export history as JSON for backup
   */
  static async exportHistoryAsJSON(): Promise<string> {
    const history = await this.getHistory();
    return JSON.stringify(history, null, 2);
  }

  /**
   * Import history from JSON
   */
  static async importHistoryFromJSON(json: string): Promise<void> {
    try {
      const imported = JSON.parse(json) as ExportRecord[];
      const current = await this.getHistory();

      // Merge and deduplicate by ID
      const merged = [...imported, ...current];
      const unique = Array.from(new Map(merged.map((r) => [r.id, r])).values());

      // Sort by timestamp descending
      unique.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Keep only the most recent records
      const toSave = unique.slice(0, this.MAX_RECORDS);

      await StorageService.set(this.STORAGE_KEY, toSave);
    } catch (error) {
      throw new Error('Invalid JSON format for import');
    }
  }

  /**
   * Get export success rate
   */
  static async getSuccessRate(): Promise<number> {
    const history = await this.getHistory();
    if (history.length === 0) return 0;

    const successful = history.filter((r) => r.success).length;
    return (successful / history.length) * 100;
  }

  /**
   * Get most used format
   */
  static async getMostUsedFormat(): Promise<string | null> {
    const stats = await this.getStatistics();
    const formats = Object.entries(stats.byFormat);

    if (formats.length === 0) return null;

    return formats.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  }

  /**
   * Search export history
   */
  static async searchHistory(query: string): Promise<ExportRecord[]> {
    const history = await this.getHistory();
    const lowerQuery = query.toLowerCase();

    return history.filter(
      (record) =>
        record.fileName.toLowerCase().includes(lowerQuery) ||
        record.type.toLowerCase().includes(lowerQuery) ||
        record.formats.some((f) => f.format.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get export trends (daily export count for last N days)
   */
  static async getExportTrends(days: number = 30): Promise<Array<{ date: string; count: number }>> {
    const history = await this.getHistory();
    const trends: Record<string, number> = {};

    // Initialize last N days with 0
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]!;
      trends[dateStr] = 0;
    }

    // Count exports per day
    history.forEach((record) => {
      const date = record.timestamp.split('T')[0]!;
      if (date in trends) {
        trends[date]++;
      }
    });

    // Convert to array and sort by date
    return Object.entries(trends)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
