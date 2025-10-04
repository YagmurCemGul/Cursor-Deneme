import React, { useState, useEffect, useRef } from 'react';
import { t, Lang } from '../i18n';
import { SavedJobDescription } from '../types';
import { StorageService } from '../utils/storage';
import { RichTextEditor } from './RichTextEditor';
import {
  exportToJSON,
  exportToCSV,
  importFromJSON,
  importFromCSV,
  downloadFile,
  processTemplateVariables,
  extractTemplateVariables,
  duplicateJobDescription,
  sortDescriptions,
  filterByDateRange,
  generateShareableLink,
  parseSharedDescription,
} from '../utils/jobDescriptionUtils';
import {
  generateDescriptionSuggestions,
  optimizeDescription,
  extractKeywords,
} from '../utils/jobDescriptionAI';

interface EnhancedJobDescriptionLibraryProps {
  language: Lang;
  onSelect: (description: string) => void;
  onClose: () => void;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'usage' | 'category';

export const EnhancedJobDescriptionLibrary: React.FC<EnhancedJobDescriptionLibraryProps> = ({
  language,
  onSelect,
  onClose,
}) => {
  const [jobDescriptions, setJobDescriptions] = useState<SavedJobDescription[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SavedJobDescription>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minUsage, setMinUsage] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showTemplateVars, setShowTemplateVars] = useState(false);
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({});
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadJobDescriptions();
    loadLastSyncTime();
    checkForSharedDescription();
  }, []);

  const loadJobDescriptions = async () => {
    setIsLoading(true);
    try {
      const descriptions = await StorageService.getJobDescriptions();
      setJobDescriptions(descriptions);
    } catch (error) {
      console.error('Error loading job descriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLastSyncTime = async () => {
    const syncTime = await StorageService.getLastSyncTime();
    setLastSyncTime(syncTime);
  };

  const checkForSharedDescription = () => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('shared');
    
    if (sharedData) {
      const parsed = parseSharedDescription(sharedData);
      if (parsed) {
        setEditForm({
          ...parsed,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usageCount: 0,
        });
        setEditingId('new');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t(language, 'jobLibrary.confirmDelete'))) {
      await StorageService.deleteJobDescription(id);
      await loadJobDescriptions();
      selectedIds.delete(id);
      setSelectedIds(new Set(selectedIds));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (confirm(`Delete ${selectedIds.size} selected descriptions?`)) {
      await StorageService.bulkDeleteJobDescriptions(Array.from(selectedIds));
      setSelectedIds(new Set());
      await loadJobDescriptions();
    }
  };

  const handleBulkDuplicate = async () => {
    if (selectedIds.size === 0) return;
    
    await StorageService.bulkDuplicateJobDescriptions(Array.from(selectedIds));
    setSelectedIds(new Set());
    await loadJobDescriptions();
  };

  const handleSelect = async (jobDesc: SavedJobDescription) => {
    // Process template variables if any
    let processedDescription = jobDesc.description;
    const variables = extractTemplateVariables(jobDesc.description);
    
    if (variables.length > 0 && Object.keys(templateVars).length > 0) {
      processedDescription = processTemplateVariables(jobDesc.description, templateVars);
    }
    
    await StorageService.incrementJobDescriptionUsage(jobDesc.id);
    onSelect(processedDescription);
    onClose();
  };

  const handleEdit = (jobDesc: SavedJobDescription) => {
    setEditingId(jobDesc.id);
    setEditForm(jobDesc);
    
    // Extract and show template variables
    const variables = extractTemplateVariables(jobDesc.description);
    if (variables.length > 0) {
      setShowTemplateVars(true);
      const vars: Record<string, string> = {};
      variables.forEach(v => {
        vars[v] = templateVars[v] || '';
      });
      setTemplateVars(vars);
    }
  };

  const handleSaveEdit = async () => {
    if (editingId && editForm.name && editForm.description) {
      const updatedJobDesc: SavedJobDescription = {
        id: editingId === 'new' ? crypto.randomUUID() : editingId,
        name: editForm.name,
        description: editForm.description,
        category: editForm.category,
        tags: editForm.tags,
        createdAt: editForm.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: editForm.usageCount || 0,
      };
      await StorageService.saveJobDescription(updatedJobDesc);
      setEditingId(null);
      setEditForm({});
      await loadJobDescriptions();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setShowTemplateVars(false);
    setTemplateVars({});
  };

  const handleDuplicate = async (jobDesc: SavedJobDescription) => {
    const duplicate = duplicateJobDescription(jobDesc);
    await StorageService.saveJobDescription(duplicate);
    await loadJobDescriptions();
  };

  const handleExportJSON = () => {
    const selected = selectedIds.size > 0
      ? jobDescriptions.filter(jd => selectedIds.has(jd.id))
      : jobDescriptions;
    
    const json = exportToJSON(selected);
    downloadFile(json, 'job-descriptions.json', 'application/json');
  };

  const handleExportCSV = () => {
    const selected = selectedIds.size > 0
      ? jobDescriptions.filter(jd => selectedIds.has(jd.id))
      : jobDescriptions;
    
    const csv = exportToCSV(selected);
    downloadFile(csv, 'job-descriptions.csv', 'text/csv');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let imported: SavedJobDescription[] = [];

      if (file.name.endsWith('.json')) {
        imported = importFromJSON(text);
      } else if (file.name.endsWith('.csv')) {
        imported = importFromCSV(text);
      } else {
        alert('Unsupported file format. Please use JSON or CSV.');
        return;
      }

      // Save imported descriptions
      for (const desc of imported) {
        await StorageService.saveJobDescription(desc);
      }

      alert(`Successfully imported ${imported.length} descriptions!`);
      await loadJobDescriptions();
    } catch (error) {
      console.error('Import error:', error);
      alert(`Failed to import: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    try {
      const success = await StorageService.syncJobDescriptionsToCloud();
      if (success) {
        alert('Successfully synced to cloud!');
        await loadLastSyncTime();
      } else {
        alert('Failed to sync to cloud.');
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync to cloud.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncFromCloud = async () => {
    setIsSyncing(true);
    try {
      const success = await StorageService.syncJobDescriptionsFromCloud();
      if (success) {
        alert('Successfully synced from cloud!');
        await loadJobDescriptions();
      } else {
        alert('No cloud data found.');
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync from cloud.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGenerateAISuggestions = async () => {
    setIsGeneratingAI(true);
    setShowAISuggestions(true);
    
    try {
      const apiKey = await StorageService.getAPIKey();
      const provider = await StorageService.getAIProvider();
      
      if (!apiKey) {
        alert('Please configure your AI API key in settings.');
        setIsGeneratingAI(false);
        return;
      }

      const context = {
        role: editForm.name,
        category: editForm.category,
        tags: editForm.tags,
      };

      const suggestions = await generateDescriptionSuggestions(
        context,
        apiKey,
        provider
      );
      
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('AI generation error:', error);
      alert('Failed to generate AI suggestions.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleOptimizeWithAI = async () => {
    if (!editForm.description) return;
    
    setIsGeneratingAI(true);
    
    try {
      const apiKey = await StorageService.getAPIKey();
      const provider = await StorageService.getAIProvider();
      
      if (!apiKey) {
        alert('Please configure your AI API key in settings.');
        setIsGeneratingAI(false);
        return;
      }

      const keywords = editForm.tags || [];
      const optimized = await optimizeDescription(
        editForm.description,
        keywords,
        apiKey,
        provider
      );
      
      setEditForm({ ...editForm, description: optimized });
    } catch (error) {
      console.error('AI optimization error:', error);
      alert('Failed to optimize description.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSelectAISuggestion = (suggestion: string) => {
    setEditForm({ ...editForm, description: suggestion });
    setShowAISuggestions(false);
  };

  const handleToggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredDescriptions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDescriptions.map(jd => jd.id)));
    }
  };

  const handleShareDescription = (jobDesc: SavedJobDescription) => {
    const link = generateShareableLink(jobDesc);
    setShareableLink(link);
    setShowShareModal(true);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareableLink);
    alert('Link copied to clipboard!');
  };

  const categories = Array.from(
    new Set(jobDescriptions.map((jd) => jd.category).filter(Boolean))
  );

  // Apply all filters and sorting
  let filteredDescriptions = jobDescriptions.filter((jd) => {
    // Search filter
    const matchesSearch =
      jd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jd.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category filter
    const matchesCategory = selectedCategory === 'all' || jd.category === selectedCategory;

    // Usage filter
    const matchesUsage = (jd.usageCount || 0) >= minUsage;

    return matchesSearch && matchesCategory && matchesUsage;
  });

  // Date range filter
  if (startDate || endDate) {
    filteredDescriptions = filterByDateRange(filteredDescriptions, startDate, endDate);
  }

  // Sort
  filteredDescriptions = sortDescriptions(filteredDescriptions, sortBy, sortOrder);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content job-library-modal enhanced-library" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📚 {t(language, 'jobLibrary.title')} - Enhanced</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Toolbar */}
          <div className="library-toolbar">
            <div className="toolbar-section">
              <button className="btn btn-sm btn-primary" onClick={() => setEditingId('new')}>
                ➕ New
              </button>
              
              {selectedIds.size > 0 && (
                <>
                  <button className="btn btn-sm btn-secondary" onClick={handleBulkDuplicate}>
                    📋 Duplicate ({selectedIds.size})
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={handleBulkDelete}>
                    🗑️ Delete ({selectedIds.size})
                  </button>
                </>
              )}
            </div>

            <div className="toolbar-section">
              <button className="btn btn-sm" onClick={handleExportJSON}>
                📥 Export JSON
              </button>
              <button className="btn btn-sm" onClick={handleExportCSV}>
                📥 Export CSV
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
              <button className="btn btn-sm" onClick={() => fileInputRef.current?.click()}>
                📤 Import
              </button>
            </div>

            <div className="toolbar-section">
              <button
                className="btn btn-sm"
                onClick={handleSyncToCloud}
                disabled={isSyncing}
              >
                ☁️ Sync Up
              </button>
              <button
                className="btn btn-sm"
                onClick={handleSyncFromCloud}
                disabled={isSyncing}
              >
                ☁️ Sync Down
              </button>
              {lastSyncTime && (
                <span className="sync-time">
                  Last: {new Date(lastSyncTime).toLocaleString(language)}
                </span>
              )}
            </div>

            <div className="toolbar-section">
              <button
                className="btn btn-sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                🔍 {showFilters ? 'Hide' : 'Show'} Filters
              </button>
              
              <select
                className="view-mode-select"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as ViewMode)}
              >
                <option value="grid">📊 Grid</option>
                <option value="list">📋 List</option>
              </select>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="library-filters-panel">
              <div className="filter-row">
                <div className="filter-group">
                  <label>Search:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label>Category:</label>
                  <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Sort By:</label>
                  <select
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                  >
                    <option value="date">Date Modified</option>
                    <option value="name">Name</option>
                    <option value="usage">Usage Count</option>
                    <option value="category">Category</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Order:</label>
                  <select
                    className="form-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>

              <div className="filter-row">
                <div className="filter-group">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label>End Date:</label>
                  <input
                    type="date"
                    className="form-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label>Min Usage:</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    value={minUsage}
                    onChange={(e) => setMinUsage(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="filter-group">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setStartDate('');
                      setEndDate('');
                      setMinUsage(0);
                      setSortBy('date');
                      setSortOrder('desc');
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Selection Header */}
          {filteredDescriptions.length > 0 && !editingId && (
            <div className="selection-header">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredDescriptions.length}
                  onChange={handleSelectAll}
                />
                Select All ({selectedIds.size} selected)
              </label>
              <span className="result-count">
                Showing {filteredDescriptions.length} of {jobDescriptions.length} descriptions
              </span>
            </div>
          )}

          {/* Edit Modal */}
          {editingId && (
            <div className="edit-modal">
              <div className="edit-modal-header">
                <h3>{editingId === 'new' ? 'New Description' : 'Edit Description'}</h3>
                <div className="ai-actions">
                  <button
                    className="btn btn-sm btn-ai"
                    onClick={handleGenerateAISuggestions}
                    disabled={isGeneratingAI}
                  >
                    {isGeneratingAI ? '⏳ Generating...' : '🤖 AI Suggestions'}
                  </button>
                  {editForm.description && (
                    <button
                      className="btn btn-sm btn-ai"
                      onClick={handleOptimizeWithAI}
                      disabled={isGeneratingAI}
                    >
                      {isGeneratingAI ? '⏳ Optimizing...' : '✨ Optimize with AI'}
                    </button>
                  )}
                </div>
              </div>

              <div className="edit-form">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.category || ''}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      placeholder="e.g., Engineering, Sales"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tags (comma-separated):</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.tags?.join(', ') || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                        })
                      }
                      placeholder="e.g., React, Node.js, AWS"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description:</label>
                  <div className="template-vars-toggle">
                    <button
                      className="btn btn-sm"
                      onClick={() => setShowTemplateVars(!showTemplateVars)}
                    >
                      🔧 Template Variables
                    </button>
                    <span className="help-text">
                      Use {`{{variable}}`} syntax for dynamic content
                    </span>
                  </div>
                  
                  <RichTextEditor
                    value={editForm.description || ''}
                    onChange={(value) => setEditForm({ ...editForm, description: value })}
                    language={language}
                    placeholder="Enter job description..."
                    maxLength={5000}
                  />
                </div>

                {/* Template Variables Editor */}
                {showTemplateVars && (
                  <div className="template-vars-editor">
                    <h4>Template Variables</h4>
                    <p className="help-text">
                      Define variables found in your description ({`{{company}}, {{role}}`}, etc.)
                    </p>
                    {extractTemplateVariables(editForm.description || '').map((varName) => (
                      <div key={varName} className="form-group">
                        <label>{`{{${varName}}}`}:</label>
                        <input
                          type="text"
                          className="form-input"
                          value={templateVars[varName] || ''}
                          onChange={(e) =>
                            setTemplateVars({ ...templateVars, [varName]: e.target.value })
                          }
                          placeholder={`Enter value for ${varName}`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Suggestions Panel */}
                {showAISuggestions && (
                  <div className="ai-suggestions-panel">
                    <h4>AI Suggestions</h4>
                    {isGeneratingAI ? (
                      <div className="loading-message">Generating suggestions...</div>
                    ) : aiSuggestions.length > 0 ? (
                      <div className="suggestions-list">
                        {aiSuggestions.map((suggestion, index) => (
                          <div key={index} className="suggestion-item">
                            <p>{suggestion.substring(0, 200)}...</p>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleSelectAISuggestion(suggestion)}
                            >
                              Use This
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No suggestions available.</p>
                    )}
                  </div>
                )}

                <div className="edit-actions">
                  <button className="btn btn-primary" onClick={handleSaveEdit}>
                    💾 {t(language, 'common.save')}
                  </button>
                  <button className="btn btn-secondary" onClick={handleCancelEdit}>
                    {t(language, 'common.cancel')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Job Descriptions List/Grid */}
          {!editingId && (
            <>
              {isLoading ? (
                <div className="loading-message">{t(language, 'common.loading')}</div>
              ) : filteredDescriptions.length === 0 ? (
                <div className="empty-state">
                  <p>{t(language, 'jobLibrary.empty')}</p>
                </div>
              ) : (
                <div className={`job-library-${viewMode}`}>
                  {filteredDescriptions.map((jobDesc) => (
                    <div key={jobDesc.id} className={`job-library-item ${selectedIds.has(jobDesc.id) ? 'selected' : ''}`}>
                      <div className="item-header">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(jobDesc.id)}
                            onChange={() => handleToggleSelection(jobDesc.id)}
                          />
                        </label>
                        <h3>{jobDesc.name}</h3>
                        {jobDesc.category && (
                          <span className="job-library-category">{jobDesc.category}</span>
                        )}
                      </div>

                      <p className="job-library-description">
                        {jobDesc.description.substring(0, 150)}
                        {jobDesc.description.length > 150 ? '...' : ''}
                      </p>

                      {jobDesc.tags && jobDesc.tags.length > 0 && (
                        <div className="job-library-tags">
                          {jobDesc.tags.map((tag, idx) => (
                            <span key={idx} className="tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Show template variables if present */}
                      {extractTemplateVariables(jobDesc.description).length > 0 && (
                        <div className="template-vars-indicator">
                          🔧 Contains {extractTemplateVariables(jobDesc.description).length} variable(s)
                        </div>
                      )}

                      <div className="job-library-meta">
                        <span>📅 {new Date(jobDesc.updatedAt).toLocaleDateString(language)}</span>
                        {jobDesc.usageCount !== undefined && jobDesc.usageCount > 0 && (
                          <span>📊 Used {jobDesc.usageCount} times</span>
                        )}
                      </div>

                      <div className="job-library-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSelect(jobDesc)}
                        >
                          ✓ {t(language, 'jobLibrary.use')}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(jobDesc)}
                        >
                          ✏️ {t(language, 'common.edit')}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDuplicate(jobDesc)}
                        >
                          📋 Duplicate
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleShareDescription(jobDesc)}
                        >
                          🔗 Share
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(jobDesc.id)}
                        >
                          🗑️ {t(language, 'common.delete')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="share-modal">
            <div className="share-modal-content">
              <h3>Share Description</h3>
              <p>Share this link with your team:</p>
              <div className="share-link-container">
                <input
                  type="text"
                  className="form-input"
                  value={shareableLink}
                  readOnly
                />
                <button className="btn btn-primary" onClick={handleCopyShareLink}>
                  📋 Copy
                </button>
              </div>
              <button className="btn btn-secondary" onClick={() => setShowShareModal(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
