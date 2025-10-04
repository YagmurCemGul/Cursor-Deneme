/**
 * Batch Export Service
 * Handles batch export of CVs and cover letters to multiple formats simultaneously
 */

import {
  CVData,
  ATSOptimization,
  BatchExportOptions,
  BatchExportProgress,
  ExportFormat,
  ExportRecord,
} from '../types';
import { DocumentGenerator } from './documentGenerator';
import { GoogleDriveService } from './googleDriveService';
import { logger } from './logger';
import { ExportHistoryService } from './exportHistoryService';
import { FileNamingService } from './fileNamingService';

export class BatchExportService {
  /**
   * Export to multiple formats in parallel
   */
  static async batchExport(
    options: BatchExportOptions,
    onProgress?: (progress: BatchExportProgress) => void
  ): Promise<ExportRecord> {
    const startTime = new Date().toISOString();
    const results: ExportFormat[] = [];
    const total = options.formats.length;
    let completed = 0;

    logger.log('Starting batch export:', { formats: options.formats });

    // Create file name based on template or use default
    const fileName = options.namingTemplate
      ? FileNamingService.applyTemplate(options.namingTemplate, {
          firstName: options.cvData.personalInfo.firstName,
          lastName: options.cvData.personalInfo.lastName,
          type: options.type === 'cv' ? 'Resume' : 'CoverLetter',
          date: new Date().toISOString().split('T')[0]!,
          time: new Date().toTimeString().split(' ')[0]!.replace(/:/g, '-'),
          format: '', // Will be filled per format
        })
      : this.getDefaultFileName(options);

    const exportPromises = options.formats.map(async (format) => {
      try {
        const formatFileName = fileName.replace('{format}', format);

        if (onProgress) {
          onProgress({
            total,
            completed,
            current: `Exporting to ${format}...`,
            results,
          });
        }

        let result: ExportFormat;

        switch (format) {
          case 'pdf':
            result = await this.exportPDF(options, formatFileName);
            break;
          case 'docx':
            result = await this.exportDOCX(options, formatFileName);
            break;
          case 'google-docs':
            result = await this.exportGoogleDocs(options, formatFileName);
            break;
          case 'google-sheets':
            result = await this.exportGoogleSheets(options, formatFileName);
            break;
          case 'google-slides':
            result = await this.exportGoogleSlides(options, formatFileName);
            break;
          default:
            throw new Error(`Unsupported format: ${format}`);
        }

        completed++;
        results.push(result);

        if (onProgress) {
          onProgress({
            total,
            completed,
            current: `Completed ${format}`,
            results,
          });
        }

        return result;
      } catch (error: any) {
        logger.error(`Export to ${format} failed:`, error);
        completed++;
        const failedResult: ExportFormat = {
          format,
          success: false,
          error: error.message || 'Export failed',
        };
        results.push(failedResult);

        if (onProgress) {
          onProgress({
            total,
            completed,
            current: `Failed: ${format}`,
            results,
          });
        }

        return failedResult;
      }
    });

    // Wait for all exports to complete
    await Promise.all(exportPromises);

    // Create export record
    const record: ExportRecord = {
      id: `export_${Date.now()}`,
      type: options.type,
      formats: results,
      timestamp: startTime,
      fileName,
      success: results.some((r) => r.success),
      error: results.every((r) => !r.success)
        ? 'All exports failed'
        : results.some((r) => !r.success)
          ? 'Some exports failed'
          : undefined,
    };

    // Save to export history
    await ExportHistoryService.addRecord(record);

    return record;
  }

  /**
   * Export to PDF
   */
  private static async exportPDF(
    options: BatchExportOptions,
    fileName: string
  ): Promise<ExportFormat> {
    try {
      if (options.type === 'cv') {
        await DocumentGenerator.generatePDF(
          options.cvData,
          options.optimizations,
          fileName,
          options.templateId
        );
      } else if (options.coverLetter) {
        const name = `${options.cvData.personalInfo.firstName} ${options.cvData.personalInfo.lastName}`.trim();
        await DocumentGenerator.generateCoverLetterPDF(
          options.coverLetter,
          name,
          fileName,
          options.templateId
        );
      }

      return {
        format: 'pdf',
        success: true,
        filePath: fileName,
      };
    } catch (error: any) {
      throw new Error(`PDF export failed: ${error.message}`);
    }
  }

  /**
   * Export to DOCX
   */
  private static async exportDOCX(
    options: BatchExportOptions,
    fileName: string
  ): Promise<ExportFormat> {
    try {
      if (options.type === 'cv') {
        await DocumentGenerator.generateDOCX(
          options.cvData,
          options.optimizations,
          fileName,
          options.templateId
        );
      } else if (options.coverLetter) {
        const name = `${options.cvData.personalInfo.firstName} ${options.cvData.personalInfo.lastName}`.trim();
        await DocumentGenerator.generateCoverLetterDOCX(
          options.coverLetter,
          name,
          fileName,
          options.templateId
        );
      }

      return {
        format: 'docx',
        success: true,
        filePath: fileName,
      };
    } catch (error: any) {
      throw new Error(`DOCX export failed: ${error.message}`);
    }
  }

  /**
   * Export to Google Docs
   */
  private static async exportGoogleDocs(
    options: BatchExportOptions,
    _fileName: string
  ): Promise<ExportFormat> {
    try {
      const file = await GoogleDriveService.exportToGoogleDocs(
        options.cvData,
        options.optimizations,
        options.templateId
      );

      // Move to folder if specified
      if (options.folderId) {
        await GoogleDriveService.moveFileToFolder(file.id, options.folderId);
      }

      return {
        format: 'google-docs',
        success: true,
        fileId: file.id,
        driveLink: file.webViewLink,
      };
    } catch (error: any) {
      throw new Error(`Google Docs export failed: ${error.message}`);
    }
  }

  /**
   * Export to Google Sheets
   */
  private static async exportGoogleSheets(
    options: BatchExportOptions,
    _fileName: string
  ): Promise<ExportFormat> {
    try {
      const file = await GoogleDriveService.exportToGoogleSheets(options.cvData);

      // Move to folder if specified
      if (options.folderId) {
        await GoogleDriveService.moveFileToFolder(file.id, options.folderId);
      }

      return {
        format: 'google-sheets',
        success: true,
        fileId: file.id,
        driveLink: file.webViewLink,
      };
    } catch (error: any) {
      throw new Error(`Google Sheets export failed: ${error.message}`);
    }
  }

  /**
   * Export to Google Slides
   */
  private static async exportGoogleSlides(
    options: BatchExportOptions,
    _fileName: string
  ): Promise<ExportFormat> {
    try {
      const file = await GoogleDriveService.exportToGoogleSlides(options.cvData);

      // Move to folder if specified
      if (options.folderId) {
        await GoogleDriveService.moveFileToFolder(file.id, options.folderId);
      }

      return {
        format: 'google-slides',
        success: true,
        fileId: file.id,
        driveLink: file.webViewLink,
      };
    } catch (error: any) {
      throw new Error(`Google Slides export failed: ${error.message}`);
    }
  }

  /**
   * Get default file name if no template specified
   */
  private static getDefaultFileName(options: BatchExportOptions): string {
    const firstName = options.cvData.personalInfo.firstName.replace(/\s+/g, '_');
    const lastName = options.cvData.personalInfo.lastName.replace(/\s+/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const type = options.type === 'cv' ? 'Resume' : 'CoverLetter';
    return `${firstName}_${lastName}_${type}_${date}.{format}`;
  }

  /**
   * Quick export presets
   */
  static async exportAll(
    cvData: CVData,
    optimizations: ATSOptimization[],
    templateId?: string,
    onProgress?: (progress: BatchExportProgress) => void
  ): Promise<ExportRecord> {
    return await this.batchExport(
      {
        formats: ['pdf', 'docx', 'google-docs'],
        cvData,
        optimizations,
        templateId,
        type: 'cv',
      },
      onProgress
    );
  }

  /**
   * Export local formats only (PDF + DOCX)
   */
  static async exportLocal(
    cvData: CVData,
    optimizations: ATSOptimization[],
    templateId?: string,
    type: 'cv' | 'cover-letter' = 'cv',
    coverLetter?: string
  ): Promise<ExportRecord> {
    return await this.batchExport({
      formats: ['pdf', 'docx'],
      cvData,
      optimizations,
      templateId,
      type,
      coverLetter,
    });
  }

  /**
   * Export cloud formats only
   */
  static async exportCloud(
    cvData: CVData,
    optimizations: ATSOptimization[],
    folderId?: string,
    templateId?: string
  ): Promise<ExportRecord> {
    return await this.batchExport({
      formats: ['google-docs', 'google-sheets', 'google-slides'],
      cvData,
      optimizations,
      templateId,
      folderId,
      type: 'cv',
    });
  }
}
