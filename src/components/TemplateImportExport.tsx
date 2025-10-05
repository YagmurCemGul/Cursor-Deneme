import React, { useState } from 'react';
import { StorageService } from '../utils/storage';
import { t, Lang } from '../i18n';

interface TemplateImportExportProps {
  language: Lang;
  onClose: () => void;
  onImportComplete?: () => void;
}

export const TemplateImportExport: React.FC<TemplateImportExportProps> = ({
  language,
  onClose,
  onImportComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  React.useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const customTemplates = await StorageService.getCustomTemplates();
    setTemplates(customTemplates);
  };

  const handleExport = async () => {
    const data = await StorageService.exportCustomTemplates(
      selectedTemplates.length > 0 ? selectedTemplates : undefined
    );
    setExportData(data);
  };

  const handleDownloadExport = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv-templates-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportData);
    alert(t(language, 'export.copied'));
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      alert(t(language, 'import.emptyData'));
      return;
    }

    const results = await StorageService.importCustomTemplates(importData);
    setImportResults(results);

    if (results.success > 0) {
      await loadTemplates();
      if (onImportComplete) {
        onImportComplete();
      }
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setImportData(text);
    };
    reader.readAsText(file);
  };

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const selectAll = () => {
    setSelectedTemplates(templates.map(t => t.id));
  };

  const deselectAll = () => {
    setSelectedTemplates([]);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content import-export-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>📦 {t(language, 'importExport.title')}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'export' ? 'active' : ''}`}
              onClick={() => setActiveTab('export')}
            >
              📤 {t(language, 'importExport.export')}
            </button>
            <button
              className={`tab ${activeTab === 'import' ? 'active' : ''}`}
              onClick={() => setActiveTab('import')}
            >
              📥 {t(language, 'importExport.import')}
            </button>
          </div>

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="export-section">
              <div className="section-description">
                <p>{t(language, 'importExport.exportDesc')}</p>
              </div>

              {/* Template Selection */}
              <div className="template-selection">
                <div className="selection-header">
                  <h4>{t(language, 'importExport.selectTemplates')} ({selectedTemplates.length}/{templates.length})</h4>
                  <div className="selection-actions">
                    <button className="btn-link" onClick={selectAll}>
                      {t(language, 'importExport.selectAll')}
                    </button>
                    <button className="btn-link" onClick={deselectAll}>
                      {t(language, 'importExport.deselectAll')}
                    </button>
                  </div>
                </div>

                <div className="template-list-checkboxes">
                  {templates.length === 0 ? (
                    <p className="no-templates">{t(language, 'importExport.noTemplates')}</p>
                  ) : (
                    templates.map(template => (
                      <label key={template.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={selectedTemplates.includes(template.id)}
                          onChange={() => toggleTemplate(template.id)}
                        />
                        <span className="template-info">
                          <span className="template-name">{template.name}</span>
                          <span className="template-type-badge">{template.type}</span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Export Actions */}
              <div className="export-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleExport}
                  disabled={templates.length === 0}
                >
                  🔄 {t(language, 'importExport.generateExport')}
                </button>
              </div>

              {/* Export Data Display */}
              {exportData && (
                <div className="export-data">
                  <div className="data-header">
                    <h4>{t(language, 'importExport.exportData')}</h4>
                    <div className="data-actions">
                      <button className="btn btn-sm btn-secondary" onClick={handleCopyExport}>
                        📋 {t(language, 'importExport.copyToClipboard')}
                      </button>
                      <button className="btn btn-sm btn-primary" onClick={handleDownloadExport}>
                        💾 {t(language, 'importExport.downloadFile')}
                      </button>
                    </div>
                  </div>
                  <textarea
                    className="export-textarea"
                    value={exportData}
                    readOnly
                    rows={12}
                  />
                </div>
              )}
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="import-section">
              <div className="section-description">
                <p>{t(language, 'importExport.importDesc')}</p>
              </div>

              {/* Import Methods */}
              <div className="import-methods">
                <div className="import-method">
                  <h4>📄 {t(language, 'importExport.fromFile')}</h4>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="file-input"
                  />
                </div>

                <div className="import-method">
                  <h4>📋 {t(language, 'importExport.fromText')}</h4>
                  <textarea
                    className="import-textarea"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder={t(language, 'importExport.pastePlaceholder')}
                    rows={12}
                  />
                </div>
              </div>

              {/* Import Actions */}
              <div className="import-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleImport}
                  disabled={!importData.trim()}
                >
                  📥 {t(language, 'importExport.startImport')}
                </button>
              </div>

              {/* Import Results */}
              {importResults && (
                <div className={`import-results ${importResults.success > 0 ? 'success' : 'error'}`}>
                  <h4>{t(language, 'importExport.importResults')}</h4>
                  <div className="results-summary">
                    <div className="result-item success">
                      <span className="result-icon">✓</span>
                      <span>{t(language, 'importExport.successCount')}: {importResults.success}</span>
                    </div>
                    {importResults.failed > 0 && (
                      <div className="result-item error">
                        <span className="result-icon">✗</span>
                        <span>{t(language, 'importExport.failedCount')}: {importResults.failed}</span>
                      </div>
                    )}
                  </div>

                  {importResults.errors.length > 0 && (
                    <div className="import-errors">
                      <h5>{t(language, 'importExport.errors')}:</h5>
                      <ul>
                        {importResults.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {t(language, 'common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
