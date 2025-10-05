import { PhotoFilters } from '../types';
import { logger } from './logger';

/**
 * Apply advanced image filters to a canvas context
 */
export class ImageFilterProcessor {
  /**
   * Apply all filters to a canvas
   */
  static applyFilters(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    filters: PhotoFilters,
    x: number,
    y: number,
    width: number,
    height: number,
    outputX: number,
    outputY: number,
    outputWidth: number,
    outputHeight: number
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply basic CSS filters first
    const cssFilters = this.buildCSSFilterString(filters);
    ctx.filter = cssFilters;

    // Draw the image
    ctx.drawImage(image, x, y, width, height, outputX, outputY, outputWidth, outputHeight);

    // Reset CSS filter
    ctx.filter = 'none';

    // Apply pixel-based filters that can't be done with CSS
    if (filters.sharpen > 0) {
      this.applySharpen(ctx, outputX, outputY, outputWidth, outputHeight, filters.sharpen);
    }

    if (filters.vignette > 0) {
      this.applyVignette(ctx, outputX, outputY, outputWidth, outputHeight, filters.vignette);
    }

    if (filters.temperature !== 0) {
      this.applyTemperature(ctx, outputX, outputY, outputWidth, outputHeight, filters.temperature);
    }
  }

  /**
   * Build CSS filter string for basic filters
   */
  static buildCSSFilterString(filters: PhotoFilters): string {
    const parts: string[] = [];

    // Basic filters
    parts.push(`brightness(${filters.brightness}%)`);
    parts.push(`contrast(${filters.contrast}%)`);
    parts.push(`saturate(${filters.saturation}%)`);
    parts.push(`grayscale(${filters.grayscale}%)`);

    // Blur
    if (filters.blur > 0) {
      parts.push(`blur(${filters.blur}px)`);
    }

    // Exposure (simulated with brightness for now)
    if (filters.exposure !== 0) {
      const exposureBrightness = 100 + filters.exposure;
      parts.push(`brightness(${exposureBrightness}%)`);
    }

    return parts.join(' ');
  }

  /**
   * Apply sharpening filter using convolution
   */
  static applySharpen(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    amount: number
  ): void {
    const imageData = ctx.getImageData(x, y, width, height);
    const pixels = imageData.data;
    const w = imageData.width;
    const h = imageData.height;

    // Sharpening kernel
    const strength = amount / 100;
    const kernel = [
      0, -strength, 0,
      -strength, 1 + 4 * strength, -strength,
      0, -strength, 0
    ];

    const output = new Uint8ClampedArray(pixels.length);

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;

        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const kidx = ((y + ky) * w + (x + kx)) * 4 + c;
              const kernelIdx = (ky + 1) * 3 + (kx + 1);
              const kernelVal = kernel[kernelIdx];
              const pixelVal = pixels[kidx];
              if (kernelVal !== undefined && pixelVal !== undefined) {
                sum += pixelVal * kernelVal;
              }
            }
          }
          output[idx + c] = Math.max(0, Math.min(255, sum));
        }
        output[idx + 3] = pixels[idx + 3] || 255; // Alpha
      }
    }

    // Copy border pixels
    for (let i = 0; i < pixels.length; i++) {
      const outVal = output[i];
      const pixVal = pixels[i];
      if (outVal === 0 && pixVal !== 0 && pixVal !== undefined) {
        output[i] = pixVal;
      }
    }

    imageData.data.set(output);
    ctx.putImageData(imageData, x, y);
  }

  /**
   * Apply vignette effect
   */
  static applyVignette(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    amount: number
  ): void {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const maxDist = Math.sqrt(width * width + height * height) / 2;

    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, maxDist
    );

    const intensity = amount / 100;
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.5, `rgba(0, 0, 0, ${Math.min(1, intensity * 0.2)})`);
    gradient.addColorStop(0.8, `rgba(0, 0, 0, ${Math.min(1, intensity * 0.5)})`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${Math.min(1, intensity * 0.8)})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
  }

  /**
   * Apply color temperature adjustment
   */
  static applyTemperature(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    temperature: number
  ): void {
    const imageData = ctx.getImageData(x, y, width, height);
    const pixels = imageData.data;

    // Temperature adjustment factors
    const warmth = temperature / 100;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i] || 0;
      const b = pixels[i + 2] || 0;
      
      if (temperature > 0) {
        // Warm: increase red, decrease blue
        pixels[i] = Math.min(255, r + warmth * 30); // Red
        pixels[i + 2] = Math.max(0, b - warmth * 30); // Blue
      } else {
        // Cool: decrease red, increase blue
        pixels[i] = Math.max(0, r + warmth * 30); // Red
        pixels[i + 2] = Math.min(255, b - warmth * 30); // Blue
      }
    }

    ctx.putImageData(imageData, x, y);
  }

  /**
   * Auto-enhance image using histogram equalization
   */
  static autoEnhance(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const imageData = ctx.getImageData(x, y, width, height);
    const pixels = imageData.data;

    // Calculate histogram for each channel
    const histR = new Array(256).fill(0);
    const histG = new Array(256).fill(0);
    const histB = new Array(256).fill(0);

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      if (r !== undefined) histR[r]++;
      if (g !== undefined) histG[g]++;
      if (b !== undefined) histB[b]++;
    }

    // Calculate cumulative distribution
    const cdfR = this.calculateCDF(histR);
    const cdfG = this.calculateCDF(histG);
    const cdfB = this.calculateCDF(histB);

    // Apply equalization
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      if (r !== undefined) pixels[i] = cdfR[r] || 0;
      if (g !== undefined) pixels[i + 1] = cdfG[g] || 0;
      if (b !== undefined) pixels[i + 2] = cdfB[b] || 0;
    }

    ctx.putImageData(imageData, x, y);
  }

  /**
   * Calculate cumulative distribution function
   */
  private static calculateCDF(histogram: number[]): number[] {
    const cdf = new Array(256);
    const totalPixels = histogram.reduce((a, b) => a + b, 0);
    let cumSum = 0;

    for (let i = 0; i < 256; i++) {
      const histVal = histogram[i];
      if (histVal !== undefined) {
        cumSum += histVal;
      }
      cdf[i] = Math.round((cumSum / totalPixels) * 255);
    }

    return cdf;
  }

  /**
   * Detect faces in image (placeholder - requires ML library)
   */
  static async detectFaces(
    canvas: HTMLCanvasElement
  ): Promise<Array<{ x: number; y: number; width: number; height: number }>> {
    // This is a placeholder. In production, you would use:
    // - TensorFlow.js with face-api.js
    // - MediaPipe Face Detection
    // - Cloud Vision API
    
    logger.info('Face detection requires ML library integration');
    
    // Return mock face for demo purposes
    return [{
      x: canvas.width * 0.25,
      y: canvas.height * 0.2,
      width: canvas.width * 0.5,
      height: canvas.height * 0.6
    }];
  }

  /**
   * Apply background blur (requires face detection or segmentation)
   */
  static applySmartBackgroundBlur(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    blurAmount: number,
    faceRegion?: { x: number; y: number; width: number; height: number }
  ): void {
    // This is a simplified version
    // In production, use semantic segmentation (e.g., BodyPix from TensorFlow.js)
    
    if (!faceRegion) return;

    const imageData = ctx.getImageData(x, y, width, height);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.putImageData(imageData, 0, 0);
    tempCtx.filter = `blur(${blurAmount}px)`;
    tempCtx.drawImage(tempCanvas, 0, 0);

    // Clear the face region to preserve sharpness
    ctx.putImageData(imageData, x, y);
    const blurredData = tempCtx.getImageData(0, 0, width, height);
    
    // Composite: blur background, keep face sharp
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const isInFace = (
          px >= faceRegion.x - x && 
          px <= faceRegion.x - x + faceRegion.width &&
          py >= faceRegion.y - y && 
          py <= faceRegion.y - y + faceRegion.height
        );

        if (!isInFace) {
          const idx = (py * width + px) * 4;
          const r = blurredData.data[idx];
          const g = blurredData.data[idx + 1];
          const b = blurredData.data[idx + 2];
          if (r !== undefined) imageData.data[idx] = r;
          if (g !== undefined) imageData.data[idx + 1] = g;
          if (b !== undefined) imageData.data[idx + 2] = b;
        }
      }
    }

    ctx.putImageData(imageData, x, y);
  }

  /**
   * Apply style transfer filter
   */
  static applyStyleTransfer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    style: 'artistic' | 'vintage' | 'modern' | 'dramatic'
  ): void {
    const imageData = ctx.getImageData(x, y, width, height);
    const pixels = imageData.data;

    switch (style) {
      case 'vintage':
        // Sepia tone with reduced saturation
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i] || 0;
          const g = pixels[i + 1] || 0;
          const b = pixels[i + 2] || 0;

          pixels[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          pixels[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          pixels[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        break;

      case 'dramatic':
        // High contrast with deep shadows
        for (let i = 0; i < pixels.length; i += 4) {
          for (let c = 0; c < 3; c++) {
            const val = pixels[i + c] || 0;
            // S-curve for dramatic effect
            pixels[i + c] = val < 128 
              ? val * val / 128 
              : 255 - ((255 - val) * (255 - val) / 128);
          }
        }
        break;

      case 'modern':
        // Slightly desaturated with lifted blacks
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i] || 0;
          const g = pixels[i + 1] || 0;
          const b = pixels[i + 2] || 0;
          
          // Calculate grayscale
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          
          // Blend with grayscale (80% color, 20% gray)
          pixels[i] = r * 0.8 + gray * 0.2 + 10;
          pixels[i + 1] = g * 0.8 + gray * 0.2 + 10;
          pixels[i + 2] = b * 0.8 + gray * 0.2 + 10;
        }
        break;

      case 'artistic':
        // Posterize effect with vibrant colors
        const levels = 8;
        const levelSize = 256 / levels;
        for (let i = 0; i < pixels.length; i += 4) {
          for (let c = 0; c < 3; c++) {
            const val = pixels[i + c] || 0;
            pixels[i + c] = Math.floor(val / levelSize) * levelSize;
          }
        }
        break;
    }

    ctx.putImageData(imageData, x, y);
  }
}
