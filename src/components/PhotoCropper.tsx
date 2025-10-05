import React, { useRef, useState, useEffect } from 'react';
import { t, Lang } from '../i18n';
import { PhotoFilters, AIPhotoEnhancement } from '../types';
import { ImageFilterProcessor } from '../utils/imageFilters';

interface PhotoCropperProps {
  imageDataUrl: string;
  onCrop: (croppedDataUrl: string, filters?: PhotoFilters, aiEnhancements?: AIPhotoEnhancement) => void;
  onCancel: () => void;
  language: Lang;
  initialFilters?: PhotoFilters;
  initialAIEnhancements?: AIPhotoEnhancement;
}

const DEFAULT_FILTERS: PhotoFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  blur: 0,
  sharpen: 0,
  vignette: 0,
  temperature: 0,
  exposure: 0,
};

const DEFAULT_AI_ENHANCEMENTS: AIPhotoEnhancement = {
  autoEnhance: false,
  faceDetection: false,
  backgroundBlur: 0,
  styleTransfer: 'none',
};

export const PhotoCropper: React.FC<PhotoCropperProps> = ({
  imageDataUrl,
  onCrop,
  onCancel,
  language,
  initialFilters,
  initialAIEnhancements,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 200 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [filters, setFilters] = useState<PhotoFilters>(initialFilters || DEFAULT_FILTERS);
  const [aiEnhancements, setAiEnhancements] = useState<AIPhotoEnhancement>(initialAIEnhancements || DEFAULT_AI_ENHANCEMENTS);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'ai'>('basic');

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

    // Draw base image with filters
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ImageFilterProcessor.applyFilters(
      canvas,
      image,
      filters,
      0, 0, image.width, image.height,
      0, 0, displayWidth, displayHeight
    );

    // Apply AI enhancements if enabled
    if (aiEnhancements.autoEnhance) {
      ImageFilterProcessor.autoEnhance(ctx, 0, 0, displayWidth, displayHeight);
    }

    if (aiEnhancements.styleTransfer && aiEnhancements.styleTransfer !== 'none') {
      ImageFilterProcessor.applyStyleTransfer(ctx, 0, 0, displayWidth, displayHeight, aiEnhancements.styleTransfer);
    }

    // Draw crop overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area and redraw with filters
    const cropX = crop.x * scale;
    const cropY = crop.y * scale;
    const cropSize = crop.size * scale;

    ctx.clearRect(cropX, cropY, cropSize, cropSize);
    ImageFilterProcessor.applyFilters(
      canvas,
      image,
      filters,
      crop.x, crop.y, crop.size, crop.size,
      cropX, cropY, cropSize, cropSize
    );

    // Apply AI enhancements to crop area
    if (aiEnhancements.autoEnhance) {
      ImageFilterProcessor.autoEnhance(ctx, cropX, cropY, cropSize, cropSize);
    }

    if (aiEnhancements.styleTransfer && aiEnhancements.styleTransfer !== 'none') {
      ImageFilterProcessor.applyStyleTransfer(ctx, cropX, cropY, cropSize, cropSize, aiEnhancements.styleTransfer);
    }

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
  }, [image, crop, filters, aiEnhancements]);

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

  const handleCrop = async () => {
    if (!image) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Output size: 500x500
    const outputSize = 500;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Apply all filters
    ImageFilterProcessor.applyFilters(
      canvas,
      image,
      filters,
      crop.x, crop.y, crop.size, crop.size,
      0, 0, outputSize, outputSize
    );

    // Apply AI enhancements
    if (aiEnhancements.autoEnhance) {
      ImageFilterProcessor.autoEnhance(ctx, 0, 0, outputSize, outputSize);
    }

    if (aiEnhancements.faceDetection) {
      // Face detection would be applied here
      const faces = await ImageFilterProcessor.detectFaces(canvas);
      if (faces.length > 0 && aiEnhancements.backgroundBlur > 0) {
        ImageFilterProcessor.applySmartBackgroundBlur(
          ctx, 0, 0, outputSize, outputSize,
          aiEnhancements.backgroundBlur,
          faces[0]
        );
      }
    }

    if (aiEnhancements.styleTransfer && aiEnhancements.styleTransfer !== 'none') {
      ImageFilterProcessor.applyStyleTransfer(ctx, 0, 0, outputSize, outputSize, aiEnhancements.styleTransfer);
    }

    // Convert to data URL with compression
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCrop(croppedDataUrl, filters, aiEnhancements);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const resetAIEnhancements = () => {
    setAiEnhancements(DEFAULT_AI_ENHANCEMENTS);
  };

  const applyBlackAndWhite = () => {
    setFilters({ ...filters, grayscale: 100, saturation: 0 });
  };

  const applyPreset = (preset: 'warm' | 'cool' | 'dramatic' | 'soft') => {
    switch (preset) {
      case 'warm':
        setFilters({ ...filters, temperature: 30, exposure: 10 });
        break;
      case 'cool':
        setFilters({ ...filters, temperature: -30, brightness: 110 });
        break;
      case 'dramatic':
        setFilters({ ...filters, contrast: 140, saturation: 120, vignette: 30 });
        break;
      case 'soft':
        setFilters({ ...filters, blur: 1, brightness: 105, contrast: 95 });
        break;
    }
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
              <div className="photo-filters-tabs">
                <button 
                  className={`filter-tab ${activeTab === 'basic' ? 'active' : ''}`}
                  onClick={() => setActiveTab('basic')}
                >
                  {t(language, 'personal.photoBasicFilters')}
                </button>
                <button 
                  className={`filter-tab ${activeTab === 'advanced' ? 'active' : ''}`}
                  onClick={() => setActiveTab('advanced')}
                >
                  {t(language, 'personal.photoAdvancedFilters')}
                </button>
                <button 
                  className={`filter-tab ${activeTab === 'ai' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ai')}
                >
                  ✨ {t(language, 'personal.photoAITools')}
                </button>
              </div>

              {activeTab === 'basic' && (
                <div className="filter-tab-content">
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

              {activeTab === 'advanced' && (
                <div className="filter-tab-content">
                  <div className="filter-group">
                    <label>{t(language, 'personal.photoBlur')}: {filters.blur}px</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={filters.blur}
                      onChange={(e) => setFilters({ ...filters, blur: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="filter-group">
                    <label>{t(language, 'personal.photoSharpen')}: {filters.sharpen}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.sharpen}
                      onChange={(e) => setFilters({ ...filters, sharpen: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="filter-group">
                    <label>{t(language, 'personal.photoVignette')}: {filters.vignette}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.vignette}
                      onChange={(e) => setFilters({ ...filters, vignette: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="filter-group">
                    <label>{t(language, 'personal.photoTemperature')}: {filters.temperature}</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={filters.temperature}
                      onChange={(e) => setFilters({ ...filters, temperature: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="filter-group">
                    <label>{t(language, 'personal.photoExposure')}: {filters.exposure}</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={filters.exposure}
                      onChange={(e) => setFilters({ ...filters, exposure: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="filter-presets">
                    <h4>{t(language, 'personal.photoPresets')}</h4>
                    <button className="btn btn-secondary btn-sm" onClick={() => applyPreset('warm')}>
                      🌞 {t(language, 'personal.photoPresetWarm')}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => applyPreset('cool')}>
                      ❄️ {t(language, 'personal.photoPresetCool')}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => applyPreset('dramatic')}>
                      🎭 {t(language, 'personal.photoPresetDramatic')}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => applyPreset('soft')}>
                      💫 {t(language, 'personal.photoPresetSoft')}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="filter-tab-content">
                  <div className="filter-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={aiEnhancements.autoEnhance}
                        onChange={(e) => setAiEnhancements({ ...aiEnhancements, autoEnhance: e.target.checked })}
                      />
                      <span>{t(language, 'personal.photoAutoEnhance')}</span>
                    </label>
                    <p className="filter-help">Automatically improve image quality using histogram equalization</p>
                  </div>

                  <div className="filter-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={aiEnhancements.faceDetection}
                        onChange={(e) => setAiEnhancements({ ...aiEnhancements, faceDetection: e.target.checked })}
                      />
                      <span>{t(language, 'personal.photoFaceDetection')}</span>
                    </label>
                    <p className="filter-help">Enable face detection for smart cropping and effects</p>
                  </div>

                  {aiEnhancements.faceDetection && (
                    <div className="filter-group">
                      <label>{t(language, 'personal.photoBackgroundBlur')}: {aiEnhancements.backgroundBlur}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={aiEnhancements.backgroundBlur}
                        onChange={(e) => setAiEnhancements({ ...aiEnhancements, backgroundBlur: parseInt(e.target.value) })}
                      />
                      <p className="filter-help">Blur background while keeping face sharp</p>
                    </div>
                  )}

                  <div className="filter-group">
                    <label>{t(language, 'personal.photoStyleTransfer')}</label>
                    <select
                      className="form-select"
                      value={aiEnhancements.styleTransfer || 'none'}
                      onChange={(e) => setAiEnhancements({ ...aiEnhancements, styleTransfer: e.target.value as any })}
                    >
                      <option value="none">{t(language, 'personal.photoStyleNone')}</option>
                      <option value="artistic">{t(language, 'personal.photoStyleArtistic')}</option>
                      <option value="vintage">{t(language, 'personal.photoStyleVintage')}</option>
                      <option value="modern">{t(language, 'personal.photoStyleModern')}</option>
                      <option value="dramatic">{t(language, 'personal.photoStyleDramatic')}</option>
                    </select>
                    <p className="filter-help">Apply artistic style transfer to your photo</p>
                  </div>

                  <div className="filter-presets">
                    <button className="btn btn-secondary btn-sm" onClick={resetAIEnhancements}>
                      {t(language, 'personal.photoResetFilters')}
                    </button>
                  </div>
                </div>
              )}
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
