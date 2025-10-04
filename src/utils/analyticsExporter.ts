/**
 * Analytics Exporter
 * Export analytics data in various formats
 */

import { OptimizationAnalytics } from '../types';

export type ExportFormat = 'json' | 'csv' | 'excel' | 'pdf';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface AnalyticsFilter {
  dateRange?: DateRange;
  aiProvider?: 'openai' | 'gemini' | 'claude';
  categories?: string[];
  minOptimizations?: number;
}

export class AnalyticsExporter {
  /**
   * Filter analytics based on criteria
   */
  static filterAnalytics(
    analytics: OptimizationAnalytics[],
    filter: AnalyticsFilter
  ): OptimizationAnalytics[] {
    return analytics.filter((item) => {
      // Date range filter
      if (filter.dateRange) {
        const itemDate = new Date(item.timestamp);
        if (itemDate < filter.dateRange.start || itemDate > filter.dateRange.end) {
          return false;
        }
      }

      // AI Provider filter
      if (filter.aiProvider && item.aiProvider !== filter.aiProvider) {
        return false;
      }

      // Categories filter
      if (filter.categories && filter.categories.length > 0) {
        const hasCategory = filter.categories.some((cat) =>
          item.categoriesOptimized.includes(cat)
        );
        if (!hasCategory) return false;
      }

      // Min optimizations filter
      if (filter.minOptimizations && item.optimizationsApplied < filter.minOptimizations) {
        return false;
      }

      return true;
    });
  }

  /**
   * Calculate statistics from analytics data
   */
  static calculateStatistics(analytics: OptimizationAnalytics[]): Record<string, any> {
    const total = analytics.length;
    const totalOptimizations = analytics.reduce((sum, a) => sum + a.optimizationsApplied, 0);
    const averageOptimizations = total > 0 ? totalOptimizations / total : 0;

    // Provider counts
    const providerCounts: Record<string, number> = {};
    analytics.forEach((a) => {
      providerCounts[a.aiProvider] = (providerCounts[a.aiProvider] || 0) + 1;
    });

    // Category counts
    const categoryCounts: Record<string, number> = {};
    analytics.forEach((a) => {
      a.categoriesOptimized.forEach((cat) => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });

    // Section counts
    const sectionCounts: Record<string, number> = {};
    analytics.forEach((a) => {
      a.cvSections.forEach((section) => {
        sectionCounts[section] = (sectionCounts[section] || 0) + 1;
      });
    });

    // Success rate
    const totalChanges = analytics.reduce((sum, a) => sum + a.changes.length, 0);
    const appliedChanges = analytics.reduce(
      (sum, a) => sum + a.changes.filter((c) => c.applied).length,
      0
    );
    const successRate = totalChanges > 0 ? (appliedChanges / totalChanges) * 100 : 0;

    // Average job description length
    const avgJobDescLength =
      total > 0
        ? analytics.reduce((sum, a) => sum + (a.jobDescriptionLength || 0), 0) / total
        : 0;

    return {
      totalSessions: total,
      totalOptimizations,
      averageOptimizations: Math.round(averageOptimizations * 10) / 10,
      successRate: Math.round(successRate * 10) / 10,
      avgJobDescLength: Math.round(avgJobDescLength),
      providerCounts,
      categoryCounts,
      sectionCounts,
      dateRange: {
        start: analytics.length > 0 ? analytics[0].timestamp : null,
        end: analytics.length > 0 ? analytics[analytics.length - 1].timestamp : null,
      },
    };
  }

  /**
   * Export to JSON
   */
  static exportToJSON(analytics: OptimizationAnalytics[], filter?: AnalyticsFilter): string {
    const filtered = filter ? this.filterAnalytics(analytics, filter) : analytics;
    const stats = this.calculateStatistics(filtered);

    const exportData = {
      exportDate: new Date().toISOString(),
      statistics: stats,
      data: filtered,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export to CSV
   */
  static exportToCSV(analytics: OptimizationAnalytics[], filter?: AnalyticsFilter): string {
    const filtered = filter ? this.filterAnalytics(analytics, filter) : analytics;

    const headers = [
      'Date',
      'AI Provider',
      'Optimizations Applied',
      'Categories',
      'CV Sections',
      'Job Description Length',
      'Changes Total',
      'Changes Applied',
    ];

    const rows = filtered.map((item) => [
      new Date(item.timestamp).toISOString(),
      item.aiProvider,
      item.optimizationsApplied.toString(),
      item.categoriesOptimized.join('; '),
      item.cvSections.join('; '),
      (item.jobDescriptionLength || 0).toString(),
      item.changes.length.toString(),
      item.changes.filter((c) => c.applied).length.toString(),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  /**
   * Export to Excel-compatible format (TSV)
   */
  static exportToExcel(analytics: OptimizationAnalytics[], filter?: AnalyticsFilter): string {
    const filtered = filter ? this.filterAnalytics(analytics, filter) : analytics;

    const headers = [
      'Date',
      'Time',
      'AI Provider',
      'Optimizations',
      'Categories',
      'Sections',
      'Job Desc Length',
      'Success Rate %',
    ];

    const rows = filtered.map((item) => {
      const date = new Date(item.timestamp);
      const successRate =
        item.changes.length > 0
          ? Math.round(
              (item.changes.filter((c) => c.applied).length / item.changes.length) * 100
            )
          : 0;

      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        item.aiProvider,
        item.optimizationsApplied.toString(),
        item.categoriesOptimized.join(', '),
        item.cvSections.join(', '),
        (item.jobDescriptionLength || 0).toString(),
        `${successRate}%`,
      ];
    });

    // Add summary row
    const stats = this.calculateStatistics(filtered);
    rows.push([]);
    rows.push(['SUMMARY']);
    rows.push(['Total Sessions', stats.totalSessions.toString()]);
    rows.push(['Total Optimizations', stats.totalOptimizations.toString()]);
    rows.push(['Average Per Session', stats.averageOptimizations.toString()]);
    rows.push(['Overall Success Rate', `${stats.successRate}%`]);

    return [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');
  }

  /**
   * Generate comparison data for two date ranges
   */
  static generateComparison(
    analytics: OptimizationAnalytics[],
    range1: DateRange,
    range2: DateRange
  ): Record<string, any> {
    const data1 = this.filterAnalytics(analytics, { dateRange: range1 });
    const data2 = this.filterAnalytics(analytics, { dateRange: range2 });

    const stats1 = this.calculateStatistics(data1);
    const stats2 = this.calculateStatistics(data2);

    return {
      period1: {
        range: range1,
        stats: stats1,
      },
      period2: {
        range: range2,
        stats: stats2,
      },
      changes: {
        sessions: stats2.totalSessions - stats1.totalSessions,
        optimizations: stats2.totalOptimizations - stats1.totalOptimizations,
        averageOptimizations: stats2.averageOptimizations - stats1.averageOptimizations,
        successRate: stats2.successRate - stats1.successRate,
      },
      percentageChanges: {
        sessions:
          stats1.totalSessions > 0
            ? ((stats2.totalSessions - stats1.totalSessions) / stats1.totalSessions) * 100
            : 0,
        optimizations:
          stats1.totalOptimizations > 0
            ? ((stats2.totalOptimizations - stats1.totalOptimizations) /
                stats1.totalOptimizations) *
              100
            : 0,
      },
    };
  }

  /**
   * Download analytics file
   */
  static download(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export and download
   */
  static exportAndDownload(
    analytics: OptimizationAnalytics[],
    format: ExportFormat,
    filter?: AnalyticsFilter
  ): void {
    const timestamp = new Date().toISOString().split('T')[0];
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = this.exportToJSON(analytics, filter);
        filename = `analytics_${timestamp}.json`;
        mimeType = 'application/json';
        break;

      case 'csv':
        content = this.exportToCSV(analytics, filter);
        filename = `analytics_${timestamp}.csv`;
        mimeType = 'text/csv';
        break;

      case 'excel':
        content = this.exportToExcel(analytics, filter);
        filename = `analytics_${timestamp}.xls`;
        mimeType = 'application/vnd.ms-excel';
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    this.download(content, filename, mimeType);
  }
}
