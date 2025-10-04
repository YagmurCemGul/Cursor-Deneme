import React, { useRef, useState, useEffect } from 'react';
import { t, Lang } from '../i18n';
import { PhotoFilters } from '../types';

interface PhotoCropperProps {
  imageDataUrl: string;
  onCrop: (croppedDataUrl: string, filters?: PhotoFilters) => void;
  onCancel: () => void;
  language: Lang;
  initialFilters?: PhotoFilters;
}

const DEFAULT_FILTERS: PhotoFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
};

export const PhotoCropper: React.FC<PhotoCropperProps> = ({
  imageDataUrl,
  onCrop,
  onCancel,
  language,
  initialFilters,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 200 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [filters, setFilters] = useState<PhotoFilters>(initialFilters || DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      // Center crop initially
      const size = Math.min(img.width, img.height, 400);
      setCrop({
        x: (img.width - size) / 2,
        y: (img.height - size) / 2,
        size: size,
      });
    };
    img.src = imageDataUrl;
  }, [imageDataUrl]);

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate display size (max 400px)
    const maxDisplaySize = 400;
    const scale = Math.min(maxDisplaySize / image.width, maxDisplaySize / image.height);
    const displayWidth = image.width * scale;
    const displayHeight = image.height * scale;

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    // Apply filters to context
    const filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) grayscale(${filters.grayscale}%)`;
    ctx.filter = filterString;

    // Draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, displayWidth, displayHeight);

    // Reset filter for overlay
    ctx.filter = 'none';

    // Draw crop overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area and redraw with filters
    const cropX = crop.x * scale;
    const cropY = crop.y * scale;
    const cropSize = crop.size * scale;

    ctx.clearRect(cropX, cropY, cropSize, cropSize);
    ctx.filter = filterString;
    ctx.drawImage(image, crop.x, crop.y, crop.size, crop.size, cropX, cropY, cropSize, cropSize);
    ctx.filter = 'none';

    // Draw crop border
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.strokeRect(cropX, cropY, cropSize, cropSize);

    // Draw corner handles
    const handleSize = 12;
    ctx.fillStyle = '#667eea';
    // Top-left
    ctx.fillRect(cropX - handleSize / 2, cropY - handleSize / 2, handleSize, handleSize);
    // Top-right
    ctx.fillRect(cropX + cropSize - handleSize / 2, cropY - handleSize / 2, handleSize, handleSize);
    // Bottom-left
    ctx.fillRect(cropX - handleSize / 2, cropY + cropSize - handleSize / 2, handleSize, handleSize);
    // Bottom-right
    ctx.fillRect(
      cropX + cropSize - handleSize / 2,
      cropY + cropSize - handleSize / 2,
      handleSize,
      handleSize
    );
  }, [image, crop, filters]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !image) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const maxDisplaySize = 400;
    const scale = Math.min(maxDisplaySize / image.width, maxDisplaySize / image.height);

    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setDragging(true);
    setDragStart({ x: x - crop.x, y: y - crop.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging || !canvasRef.current || !image) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const maxDisplaySize = 400;
    const scale = Math.min(maxDisplaySize / image.width, maxDisplaySize / image.height);

    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const newX = Math.max(0, Math.min(image.width - crop.size, x - dragStart.x));
    const newY = Math.max(0, Math.min(image.height - crop.size, y - dragStart.y));

    setCrop({ ...crop, x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleZoom = (delta: number) => {
    if (!image) return;

    const newSize = Math.max(100, Math.min(Math.min(image.width, image.height), crop.size + delta));
    const centerX = crop.x + crop.size / 2;
    const centerY = crop.y + crop.size / 2;

    setCrop({
      x: Math.max(0, Math.min(image.width - newSize, centerX - newSize / 2)),
      y: Math.max(0, Math.min(image.height - newSize, centerY - newSize / 2)),
      size: newSize,
    });
  };

  const handleCrop = () => {
    if (!image) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Output size: 500x500
    const outputSize = 500;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Apply filters
    const filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) grayscale(${filters.grayscale}%)`;
    ctx.filter = filterString;

    // Draw cropped area
    ctx.drawImage(image, crop.x, crop.y, crop.size, crop.size, 0, 0, outputSize, outputSize);

    // Convert to data URL with compression
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCrop(croppedDataUrl, filters);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const applyBlackAndWhite = () => {
    setFilters({ ...filters, grayscale: 100, saturation: 0 });
  };

  return (
    <div className="photo-cropper-overlay" onClick={onCancel}>
      <div className="photo-cropper-modal" onClick={(e) => e.stopPropagation()}>
        <div className="photo-cropper-header">
          <h3>🖼️ {t(language, 'personal.photoCropTitle')}</h3>
          <button className="btn btn-secondary btn-icon" onClick={onCancel}>
            ×
          </button>
        </div>

        <div className="photo-cropper-instructions">
          <p>👆 {t(language, 'personal.photoCropInstructions')}</p>
        </div>

        <div className="photo-cropper-content">
          <canvas
            ref={canvasRef}
            className="photo-cropper-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          <div className="photo-cropper-controls">
            <button className="btn btn-secondary" onClick={() => handleZoom(-20)}>
              🔍− {t(language, 'personal.photoCropZoomOut')}
            </button>
            <button className="btn btn-secondary" onClick={() => handleZoom(20)}>
              🔍+ {t(language, 'personal.photoCropZoomIn')}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowFilters(!showFilters)}
            >
              🎨 {t(language, 'personal.photoFilters')}
            </button>
          </div>

          {showFilters && (
            <div className="photo-filters-panel">
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

              <div className="filter-group">
                <label>{t(language, 'personal.photoSaturation')}: {filters.saturation}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.saturation}
                  onChange={(e) => setFilters({ ...filters, saturation: parseInt(e.target.value) })}
                />
              </div>

              <div className="filter-group">
                <label>{t(language, 'personal.photoGrayscale')}: {filters.grayscale}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.grayscale}
                  onChange={(e) => setFilters({ ...filters, grayscale: parseInt(e.target.value) })}
                />
              </div>

              <div className="filter-presets">
                <button className="btn btn-secondary btn-sm" onClick={applyBlackAndWhite}>
                  {t(language, 'personal.photoBlackWhite')}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={resetFilters}>
                  {t(language, 'personal.photoResetFilters')}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="photo-cropper-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            {t(language, 'personal.photoCropCancel')}
          </button>
          <button className="btn btn-primary" onClick={handleCrop}>
            ✔️ {t(language, 'personal.photoCropApply')}
          </button>
        </div>
      </div>
    </div>
  );
};
