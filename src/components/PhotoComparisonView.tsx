import React, { useState } from 'react';
import { t, Lang } from '../i18n';

interface PhotoComparisonViewProps {
  originalPhoto: string;
  editedPhoto: string;
  language: Lang;
  onClose: () => void;
  onChooseOriginal: () => void;
  onChooseEdited: () => void;
}

export const PhotoComparisonView: React.FC<PhotoComparisonViewProps> = ({
  originalPhoto,
  editedPhoto,
  language,
  onClose,
  onChooseOriginal,
  onChooseEdited,
}) => {
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'slider' | 'overlay'>('side-by-side');
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="comparison-overlay" onClick={onClose}>
      <div className="comparison-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comparison-header">
          <h3>🔍 {t(language, 'personal.photoComparisonView')}</h3>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="comparison-mode-selector">
          <button
            className={`btn btn-sm ${comparisonMode === 'side-by-side' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setComparisonMode('side-by-side')}
          >
            Side by Side
          </button>
          <button
            className={`btn btn-sm ${comparisonMode === 'slider' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setComparisonMode('slider')}
          >
            Slider
          </button>
          <button
            className={`btn btn-sm ${comparisonMode === 'overlay' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setComparisonMode('overlay')}
          >
            Overlay
          </button>
        </div>

        <div className="comparison-content">
          {comparisonMode === 'side-by-side' && (
            <div className="comparison-side-by-side">
              <div className="comparison-image-container">
                <img src={originalPhoto} alt="Original" />
                <div className="comparison-label">Original</div>
              </div>
              <div className="comparison-image-container">
                <img src={editedPhoto} alt="Edited" />
                <div className="comparison-label">Edited</div>
              </div>
            </div>
          )}

          {comparisonMode === 'slider' && (
            <div className="comparison-slider">
              <div className="comparison-slider-container">
                <img src={originalPhoto} alt="Original" className="comparison-slider-image" />
                <div
                  className="comparison-slider-overlay"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img src={editedPhoto} alt="Edited" className="comparison-slider-image" />
                </div>
                <div
                  className="comparison-slider-handle"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="comparison-slider-line" />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                className="comparison-slider-input"
              />
            </div>
          )}

          {comparisonMode === 'overlay' && (
            <div className="comparison-overlay-mode">
              <div className="comparison-overlay-container">
                <img src={originalPhoto} alt="Original" className="comparison-overlay-base" />
                <img
                  src={editedPhoto}
                  alt="Edited"
                  className="comparison-overlay-top"
                  style={{ opacity: sliderPosition / 100 }}
                />
              </div>
              <div className="comparison-overlay-controls">
                <span>Original</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                />
                <span>Edited</span>
              </div>
            </div>
          )}
        </div>

        <div className="comparison-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-secondary" onClick={onChooseOriginal}>
            Use Original
          </button>
          <button className="btn btn-primary" onClick={onChooseEdited}>
            Use Edited
          </button>
        </div>
      </div>
    </div>
  );
};
