import React, { useState } from 'react';
import { CVData, ATSOptimization, BatchExportProgress } from '../types';
import { BatchExportService } from '../utils/batchExportService';
import { FolderSelector } from './FolderSelector';
import { NamingTemplateSelector } from './NamingTemplateSelector';

interface BatchExportProps {
  cvData: CVData;
  optimizations: ATSOptimization[];
  templateId?: string;
  type?: 'cv' | 'cover-letter';
  coverLetter?: string;
}

export const BatchExport: React.FC<BatchExportProps> = ({
  cvData,
  optimizations,
  templateId,
  type = 'cv',
  coverLetter,
}) => {
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(
    new Set(['pdf', 'docx', 'google-docs'])
  );
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>();
  const [selectedNamingTemplate, setSelectedNamingTemplate] = useState<string>('default');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<BatchExportProgress | null>(null);
  const [exportComplete, setExportComplete] = useState(false);
  const [showFolderSelector, setShowFolderSelector] = useState(false);

  const formats = [
    { id: 'pdf', name: 'PDF', icon: '📄', local: true },
    { id: 'docx', name: 'DOCX', icon: '📝', local: true },
    { id: 'google-docs', name: 'Google Docs', icon: '📋', local: false },
    { id: 'google-sheets', name: 'Google Sheets', icon: '📊', local: false },
    { id: 'google-slides', name: 'Google Slides', icon: '📽️', local: false },
  ];

  const toggleFormat = (formatId: string) => {
    const newFormats = new Set(selectedFormats);
    if (newFormats.has(formatId)) {
      newFormats.delete(formatId);
    } else {
      newFormats.add(formatId);
    }
    setSelectedFormats(newFormats);
  };

  const handleBatchExport = async () => {
    if (selectedFormats.size === 0) {
      alert('Please select at least one export format');
      return;
    }

    setIsExporting(true);
    setProgress(null);
    setExportComplete(false);

    try {
      const result = await BatchExportService.batchExport(
        {
          formats: Array.from(selectedFormats) as any[],
          cvData,
          optimizations,
          templateId,
          folderId: selectedFolder,
          namingTemplate: selectedNamingTemplate,
          type,
          coverLetter,
        },
        (p) => setProgress(p)
      );

      setExportComplete(true);

      // Show results
      const successCount = result.formats.filter((f) => f.success).length;
      const failCount = result.formats.filter((f) => !f.success).length;

      if (failCount === 0) {
        alert(`✅ Successfully exported to all ${successCount} formats!`);
      } else {
        alert(
          `⚠️ Export completed with ${successCount} successes and ${failCount} failures.\nCheck export history for details.`
        );
      }
    } catch (error: any) {
      alert(`❌ Batch export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const quickExportAll = async () => {
    setIsExporting(true);
    try {
      await BatchExportService.exportAll(cvData, optimizations, templateId);
      alert('✅ Exported to PDF, DOCX, and Google Docs!');
    } catch (error: any) {
      alert(`❌ Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const quickExportLocal = async () => {
    setIsExporting(true);
    try {
      await BatchExportService.exportLocal(cvData, optimizations, templateId, type, coverLetter);
      alert('✅ Exported to PDF and DOCX!');
    } catch (error: any) {
      alert(`❌ Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="batch-export">
      <h3>📦 Batch Export</h3>
      <p className="subtitle">Export to multiple formats at once</p>

      {/* Quick Export Buttons */}
      <div className="quick-export-buttons">
        <button onClick={quickExportAll} disabled={isExporting} className="btn-primary">
          🚀 Export All (PDF + DOCX + Docs)
        </button>
        <button onClick={quickExportLocal} disabled={isExporting} className="btn-secondary">
          💾 Local Only (PDF + DOCX)
        </button>
      </div>

      <div className="divider">
        <span>or customize your export</span>
      </div>

      {/* Format Selection */}
      <div className="format-selection">
        <h4>Select Formats</h4>
        <div className="format-grid">
          {formats.map((format) => (
            <button
              key={format.id}
              className={`format-card ${selectedFormats.has(format.id) ? 'selected' : ''}`}
              onClick={() => toggleFormat(format.id)}
              disabled={isExporting}
            >
              <span className="format-icon">{format.icon}</span>
              <span className="format-name">{format.name}</span>
              {!format.local && <span className="cloud-badge">☁️</span>}
              {selectedFormats.has(format.id) && <span className="check-icon">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Google Drive Options */}
      {Array.from(selectedFormats).some((f) => !formats.find((fmt) => fmt.id === f)?.local) && (
        <div className="drive-options">
          <h4>📁 Google Drive Options</h4>
          <button
            onClick={() => setShowFolderSelector(!showFolderSelector)}
            className="btn-outline"
          >
            {selectedFolder ? '📁 Change Folder' : '📁 Select Folder (Optional)'}
          </button>
          {showFolderSelector && (
            <FolderSelector
              onSelect={(folderId) => {
                setSelectedFolder(folderId);
                setShowFolderSelector(false);
              }}
              onCancel={() => setShowFolderSelector(false)}
            />
          )}
        </div>
      )}

      {/* Naming Template */}
      <div className="naming-template">
        <h4>📝 File Naming</h4>
        <NamingTemplateSelector
          selectedTemplate={selectedNamingTemplate}
          onSelect={setSelectedNamingTemplate}
          cvData={cvData}
        />
      </div>

      {/* Export Button */}
      <button
        onClick={handleBatchExport}
        disabled={isExporting || selectedFormats.size === 0}
        className="btn-export-batch"
      >
        {isExporting ? '⏳ Exporting...' : `📤 Export to ${selectedFormats.size} Format(s)`}
      </button>

      {/* Progress Indicator */}
      {progress && (
        <div className="export-progress">
          <div className="progress-header">
            <span>
              {progress.completed}/{progress.total} completed
            </span>
            <span>{Math.round((progress.completed / progress.total) * 100)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>
          <div className="progress-current">{progress.current}</div>

          {/* Results */}
          {progress.results.length > 0 && (
            <div className="progress-results">
              {progress.results.map((result, index) => (
                <div key={index} className={`result-item ${result.success ? 'success' : 'error'}`}>
                  <span>
                    {result.success ? '✅' : '❌'} {result.format}
                  </span>
                  {result.driveLink && (
                    <a href={result.driveLink} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  )}
                  {result.error && <span className="error-msg">{result.error}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {exportComplete && (
        <div className="export-complete">
          <p>✅ Export completed! Check your downloads folder and Google Drive.</p>
        </div>
      )}
    </div>
  );
};
