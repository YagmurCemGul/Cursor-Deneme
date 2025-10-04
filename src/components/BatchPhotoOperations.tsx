import React, { useState } from 'react';
import { t, Lang } from '../i18n';
import { PhotoFilters, AIPhotoEnhancement } from '../types';
import { ImageFilterProcessor } from '../utils/imageFilters';

interface BatchPhoto {
  id: string;
  dataUrl: string;
  name: string;
  selected: boolean;
}

interface BatchPhotoOperationsProps {
  photos: BatchPhoto[];
  language: Lang;
  onClose: () => void;
  onExport: (photos: BatchPhoto[]) => void;
}

export const BatchPhotoOperations: React.FC<BatchPhotoOperationsProps> = ({
  photos: initialPhotos,
  language,
  onClose,
  onExport,
}) => {
  const [photos, setPhotos] = useState<BatchPhoto[]>(initialPhotos);
  const [filters, setFilters] = useState<PhotoFilters>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    blur: 0,
    sharpen: 0,
    vignette: 0,
    temperature: 0,
    exposure: 0,
  });
  const [aiEnhancements, setAiEnhancements] = useState<AIPhotoEnhancement>({
    autoEnhance: false,
    faceDetection: false,
    backgroundBlur: 0,
    styleTransfer: 'none',
  });
  const [processing, setProcessing] = useState(false);

  const togglePhotoSelection = (id: string) => {
    setPhotos(photos.map(p => p.id === id ? { ...p, selected: !p.selected } : p));
  };

  const selectAll = () => {
    setPhotos(photos.map(p => ({ ...p, selected: true })));
  };

  const deselectAll = () => {
    setPhotos(photos.map(p => ({ ...p, selected: false })));
  };

  const applyFiltersToSelected = async () => {
    setProcessing(true);
    
    try {
      const updatedPhotos = await Promise.all(
        photos.map(async (photo) => {
          if (!photo.selected) return photo;

          // Create a temporary canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return photo;

          // Load image
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = photo.dataUrl;
          });

          canvas.width = img.width;
          canvas.height = img.height;

          // Apply filters
          ImageFilterProcessor.applyFilters(
            canvas,
            img,
            filters,
            0, 0, img.width, img.height,
            0, 0, img.width, img.height
          );

          // Apply AI enhancements
          if (aiEnhancements.autoEnhance) {
            ImageFilterProcessor.autoEnhance(ctx, 0, 0, canvas.width, canvas.height);
          }

          if (aiEnhancements.styleTransfer && aiEnhancements.styleTransfer !== 'none') {
            ImageFilterProcessor.applyStyleTransfer(
              ctx, 0, 0, canvas.width, canvas.height, aiEnhancements.styleTransfer
            );
          }

          // Get processed data URL
          const processedDataUrl = canvas.toDataURL('image/jpeg', 0.9);

          return {
            ...photo,
            dataUrl: processedDataUrl,
          };
        })
      );

      setPhotos(updatedPhotos);
    } catch (error) {
      console.error('Error applying filters:', error);
      alert('Error processing photos. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = () => {
    const selectedPhotos = photos.filter(p => p.selected);
    onExport(selectedPhotos);
  };

  const selectedCount = photos.filter(p => p.selected).length;

  return (
    <div className="batch-operations-overlay" onClick={onClose}>
      <div className="batch-operations-modal" onClick={(e) => e.stopPropagation()}>
        <div className="batch-operations-header">
          <h3>📦 {t(language, 'personal.photoBulkExport')}</h3>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="batch-operations-toolbar">
          <div className="batch-selection-info">
            {selectedCount} / {photos.length} selected
          </div>
          <div className="batch-selection-actions">
            <button className="btn btn-secondary btn-sm" onClick={selectAll}>
              Select All
            </button>
            <button className="btn btn-secondary btn-sm" onClick={deselectAll}>
              Deselect All
            </button>
          </div>
        </div>

        <div className="batch-operations-content">
          <div className="batch-photos-grid">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`batch-photo-card ${photo.selected ? 'selected' : ''}`}
                onClick={() => togglePhotoSelection(photo.id)}
              >
                <img src={photo.dataUrl} alt={photo.name} />
                <div className="batch-photo-overlay">
                  <input
                    type="checkbox"
                    checked={photo.selected}
                    onChange={() => {}}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="batch-photo-name">{photo.name}</div>
              </div>
            ))}
          </div>

          <div className="batch-filters-panel">
            <h4>{t(language, 'personal.photoApplyToAll')}</h4>
            
            <div className="filter-group">
              <label>{t(language, 'personal.photoBrightness')}: {filters.brightness}%</label>
              <input
                type="range"
                min="0"
                max="200"
                value={filters.brightness}
                onChange={(e) => setFilters({ ...filters, brightness: parseInt(e.target.value) })}
              />
            </div>

            <div className="filter-group">
              <label>{t(language, 'personal.photoContrast')}: {filters.contrast}%</label>
              <input
                type="range"
                min="0"
                max="200"
                value={filters.contrast}
                onChange={(e) => setFilters({ ...filters, contrast: parseInt(e.target.value) })}
              />
            </div>

            <div className="filter-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={aiEnhancements.autoEnhance}
                  onChange={(e) => setAiEnhancements({ ...aiEnhancements, autoEnhance: e.target.checked })}
                />
                <span>{t(language, 'personal.photoAutoEnhance')}</span>
              </label>
            </div>

            <button
              className="btn btn-primary"
              onClick={applyFiltersToSelected}
              disabled={processing || selectedCount === 0}
            >
              {processing ? 'Processing...' : `Apply to ${selectedCount} photo(s)`}
            </button>
          </div>
        </div>

        <div className="batch-operations-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleExport}
            disabled={selectedCount === 0}
          >
            Export {selectedCount} photo(s)
          </button>
        </div>
      </div>
    </div>
  );
};
