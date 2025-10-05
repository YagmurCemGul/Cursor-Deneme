import React, { useRef, useState, useEffect } from 'react';
import { t, Lang } from '../i18n';

interface PhotoCropperProps {
  imageDataUrl: string;
  onCrop: (croppedDataUrl: string) => void;
  onCancel: () => void;
  language: Lang;
}

export const PhotoCropper: React.FC<PhotoCropperProps> = ({ imageDataUrl, onCrop, onCancel, language }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 200 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      // Center crop initially
      const size = Math.min(img.width, img.height, 400);
      setCrop({
        x: (img.width - size) / 2,
        y: (img.height - size) / 2,
        size: size
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

    // Draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, displayWidth, displayHeight);

    // Draw crop overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area
    const cropX = crop.x * scale;
    const cropY = crop.y * scale;
    const cropSize = crop.size * scale;
    
    ctx.clearRect(cropX, cropY, cropSize, cropSize);
    ctx.drawImage(
      image,
      crop.x, crop.y, crop.size, crop.size,
      cropX, cropY, cropSize, cropSize
    );

    // Draw crop border
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.strokeRect(cropX, cropY, cropSize, cropSize);

    // Draw corner handles
    const handleSize = 12;
    ctx.fillStyle = '#667eea';
    // Top-left
    ctx.fillRect(cropX - handleSize/2, cropY - handleSize/2, handleSize, handleSize);
    // Top-right
    ctx.fillRect(cropX + cropSize - handleSize/2, cropY - handleSize/2, handleSize, handleSize);
    // Bottom-left
    ctx.fillRect(cropX - handleSize/2, cropY + cropSize - handleSize/2, handleSize, handleSize);
    // Bottom-right
    ctx.fillRect(cropX + cropSize - handleSize/2, cropY + cropSize - handleSize/2, handleSize, handleSize);
  }, [image, crop]);

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
      size: newSize
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

    // Draw cropped area
    ctx.drawImage(
      image,
      crop.x, crop.y, crop.size, crop.size,
      0, 0, outputSize, outputSize
    );

    // Convert to data URL with compression
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCrop(croppedDataUrl);
  };

  return (
    <div className="photo-cropper-overlay" onClick={onCancel}>
      <div className="photo-cropper-modal" onClick={(e) => e.stopPropagation()}>
        <div className="photo-cropper-header">
          <h3>🖼️ {t(language, 'personal.photoCropTitle')}</h3>
          <button className="btn btn-secondary btn-icon" onClick={onCancel}>×</button>
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
          </div>
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
