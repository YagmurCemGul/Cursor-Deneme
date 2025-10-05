import React, { useState, useEffect } from 'react';
import { ExportRecord } from '../types';
import { ExportHistoryService } from '../utils/exportHistoryService';

export const ExportHistory: React.FC = () => {
  const [history, setHistory] = useState<ExportRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'cv' | 'cover-letter'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [statistics, setStatistics] = useState<any>(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadHistory();
    loadStatistics();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [history, filter, searchQuery, dateRange]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const loaded = await ExportHistoryService.getHistory();
      setHistory(loaded);
    } catch (error) {
      console.error('Failed to load export history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await ExportHistoryService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...history];

    // Type filter
    if (filter !== 'all') {
      filtered = filtered.filter((record) => record.type === filter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((record) =>
        record.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(
        (record) => new Date(record.timestamp) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(
        (record) => new Date(record.timestamp) <= new Date(dateRange.end)
      );
    }

    setFilteredHistory(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this export record?')) return;

    try {
      await ExportHistoryService.deleteRecord(id);
      await loadHistory();
      await loadStatistics();
    } catch (error) {
      alert('Failed to delete record');
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all export history?')) return;

    try {
      await ExportHistoryService.clearHistory();
      await loadHistory();
      await loadStatistics();
      alert('✅ Export history cleared');
    } catch (error) {
      alert('Failed to clear history');
    }
  };

  const handleExportHistory = async () => {
    try {
      const json = await ExportHistoryService.exportHistoryAsJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-history-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export history');
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading export history...</div>;
  }

  return (
    <div className="export-history">
      <div className="history-header">
        <h3>📊 Export History</h3>
        <div className="header-actions">
          <button onClick={() => setShowStats(!showStats)} className="btn-stats">
            📈 Statistics
          </button>
          <button onClick={handleExportHistory} className="btn-export">
            💾 Export History
          </button>
          <button onClick={handleClearHistory} className="btn-danger">
            🗑️ Clear All
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      {showStats && statistics && (
        <div className="statistics-panel">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{statistics.totalExports}</div>
              <div className="stat-label">Total Exports</div>
            </div>
            <div className="stat-card success">
              <div className="stat-value">{statistics.successfulExports}</div>
              <div className="stat-label">Successful</div>
            </div>
            <div className="stat-card error">
              <div className="stat-value">{statistics.failedExports}</div>
              <div className="stat-label">Failed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {statistics.totalExports > 0
                  ? Math.round((statistics.successfulExports / statistics.totalExports) * 100)
                  : 0}
                %
              </div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>

          <div className="stats-breakdown">
            <div className="breakdown-section">
              <h5>By Type</h5>
              <div className="breakdown-item">
                <span>CVs:</span> <span>{statistics.byType.cv}</span>
              </div>
              <div className="breakdown-item">
                <span>Cover Letters:</span> <span>{statistics.byType.coverLetter}</span>
              </div>
            </div>

            <div className="breakdown-section">
              <h5>By Format</h5>
              {Object.entries(statistics.byFormat).map(([format, count]) => (
                <div key={format} className="breakdown-item">
                  <span>{format}:</span> <span>{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="history-filters">
        <div className="filter-group">
          <label>Type:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="all">All</option>
            <option value="cv">CV</option>
            <option value="cover-letter">Cover Letter</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search filename..."
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>From:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>To:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>

        {(filter !== 'all' || searchQuery || dateRange.start || dateRange.end) && (
          <button
            onClick={() => {
              setFilter('all');
              setSearchQuery('');
              setDateRange({ start: '', end: '' });
            }}
            className="btn-clear-filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* History List */}
      <div className="history-list">
        {filteredHistory.length === 0 ? (
          <div className="empty-state">
            <p>📭 No export history found</p>
            <p className="help-text">
              {history.length === 0
                ? 'Your export history will appear here'
                : 'No records match your filters'}
            </p>
          </div>
        ) : (
          filteredHistory.map((record) => (
            <div key={record.id} className={`history-item ${record.success ? 'success' : 'error'}`}>
              <div className="history-main">
                <div className="history-icon">
                  {record.type === 'cv' ? '📄' : '✉️'}
                </div>
                <div className="history-info">
                  <div className="history-filename">{record.fileName}</div>
                  <div className="history-meta">
                    <span className="history-date">{formatDate(record.timestamp)}</span>
                    <span className="history-type">
                      {record.type === 'cv' ? 'CV' : 'Cover Letter'}
                    </span>
                  </div>
                </div>
                <div className="history-status">
                  {record.success ? (
                    <span className="status-badge success">✓ Success</span>
                  ) : (
                    <span className="status-badge error">✗ Failed</span>
                  )}
                </div>
              </div>

              <div className="history-formats">
                {record.formats.map((format, idx) => (
                  <div
                    key={idx}
                    className={`format-badge ${format.success ? 'success' : 'error'}`}
                  >
                    <span>{format.format}</span>
                    {format.success ? (
                      <>
                        <span className="format-check">✓</span>
                        {format.driveLink && (
                          <a
                            href={format.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="format-link"
                          >
                            View
                          </a>
                        )}
                      </>
                    ) : (
                      <span className="format-error" title={format.error}>
                        ✗
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {record.error && <div className="history-error">⚠️ {record.error}</div>}

              <div className="history-actions">
                <button onClick={() => handleDelete(record.id)} className="btn-delete">
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
