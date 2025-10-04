import React, { useState, useEffect } from 'react';
import { GoogleDriveService, GoogleDriveFile } from '../utils/googleDriveService';

interface FolderSelectorProps {
  onSelect: (folderId: string) => void;
  onCancel: () => void;
}

export const FolderSelector: React.FC<FolderSelectorProps> = ({ onSelect, onCancel }) => {
  const [folders, setFolders] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [breadcrumb, setBreadcrumb] = useState<Array<{ id: string | undefined; name: string }>>([
    { id: undefined, name: 'My Drive' },
  ]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  useEffect(() => {
    loadFolders(currentFolderId);
  }, [currentFolderId]);

  const loadFolders = async (parentId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const folderList = await GoogleDriveService.listFolders(parentId);
      setFolders(folderList);
    } catch (err: any) {
      setError(err.message || 'Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folderId: string | undefined, folderName: string) => {
    setCurrentFolderId(folderId);

    // Update breadcrumb
    const index = breadcrumb.findIndex((b) => b.id === folderId);
    if (index >= 0) {
      // Going back
      setBreadcrumb(breadcrumb.slice(0, index + 1));
    } else {
      // Going forward
      setBreadcrumb([...breadcrumb, { id: folderId, name: folderName }]);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert('Please enter a folder name');
      return;
    }

    try {
      const newFolder = await GoogleDriveService.createFolder(newFolderName, currentFolderId);
      setNewFolderName('');
      setShowCreateFolder(false);
      await loadFolders(currentFolderId);
      alert(`✅ Folder "${newFolder.name}" created successfully!`);
    } catch (err: any) {
      alert(`❌ Failed to create folder: ${err.message}`);
    }
  };

  const handleSelect = () => {
    if (!currentFolderId) {
      alert('Please select a folder or use "My Drive"');
      return;
    }
    onSelect(currentFolderId);
  };

  return (
    <div className="folder-selector">
      <div className="folder-selector-header">
        <h4>📁 Select Google Drive Folder</h4>
        <button onClick={onCancel} className="btn-close">
          ×
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        {breadcrumb.map((item, index) => (
          <React.Fragment key={index}>
            <button
              onClick={() => navigateToFolder(item.id, item.name)}
              className="breadcrumb-item"
            >
              {item.name}
            </button>
            {index < breadcrumb.length - 1 && <span className="breadcrumb-separator">/</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Actions */}
      <div className="folder-actions">
        <button onClick={() => setShowCreateFolder(!showCreateFolder)} className="btn-create">
          ➕ New Folder
        </button>
        <button onClick={handleSelect} className="btn-primary">
          ✓ Use This Folder
        </button>
      </div>

      {/* Create Folder Form */}
      {showCreateFolder && (
        <div className="create-folder-form">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name..."
            className="folder-name-input"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
          />
          <button onClick={handleCreateFolder} className="btn-create-confirm">
            Create
          </button>
          <button onClick={() => setShowCreateFolder(false)} className="btn-cancel">
            Cancel
          </button>
        </div>
      )}

      {/* Folder List */}
      <div className="folder-list">
        {loading ? (
          <div className="loading">Loading folders...</div>
        ) : error ? (
          <div className="error">❌ {error}</div>
        ) : folders.length === 0 ? (
          <div className="empty-state">
            <p>No folders in this location</p>
            <p className="help-text">Create a new folder to get started</p>
          </div>
        ) : (
          folders.map((folder) => (
            <div
              key={folder.id}
              className="folder-item"
              onClick={() => navigateToFolder(folder.id, folder.name)}
            >
              <span className="folder-icon">📁</span>
              <span className="folder-name">{folder.name}</span>
              <span className="folder-arrow">›</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
