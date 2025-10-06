// Canvas-based image editing utilities
export interface ImageEditOptions {
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  blur?: number; // 0 to 10
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  zoom?: number; // 1.0 to 3.0
  roundMask?: boolean;
  backgroundBlur?: number; // 0 to 20 (soft background blur)
}

export async function stripExif(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      }, file.type);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export async function editImage(
  imageFile: File | Blob,
  options: ImageEditOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Determine dimensions
      let srcX = options.crop?.x || 0;
      let srcY = options.crop?.y || 0;
      let srcW = options.crop?.width || img.width;
      let srcH = options.crop?.height || img.height;

      const zoom = options.zoom || 1.0;
      const outputW = srcW * zoom;
      const outputH = srcH * zoom;

      canvas.width = outputW;
      canvas.height = outputH;

      // Apply background blur if requested
      if (options.backgroundBlur && options.backgroundBlur > 0) {
        ctx.filter = `blur(${options.backgroundBlur}px)`;
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, outputW, outputH);
        ctx.filter = "none";
        
        // Draw sharp foreground (simplified - real impl would need segmentation)
        ctx.globalAlpha = 0.7;
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outputW, outputH);
        ctx.globalAlpha = 1.0;
      } else {
        // Standard draw
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outputW, outputH);
      }

      // Apply brightness/contrast
      if (options.brightness || options.contrast) {
        const imageData = ctx.getImageData(0, 0, outputW, outputH);
        const data = imageData.data;
        const brightness = (options.brightness || 0) / 100;
        const contrast = ((options.contrast || 0) + 100) / 100;

        for (let i = 0; i < data.length; i += 4) {
          // RGB channels
          data[i] = ((data[i] / 255 - 0.5) * contrast + 0.5 + brightness) * 255;
          data[i + 1] = ((data[i + 1] / 255 - 0.5) * contrast + 0.5 + brightness) * 255;
          data[i + 2] = ((data[i + 2] / 255 - 0.5) * contrast + 0.5 + brightness) * 255;
        }

        ctx.putImageData(imageData, 0, 0);
      }

      // Apply blur
      if (options.blur && options.blur > 0) {
        ctx.filter = `blur(${options.blur}px)`;
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = outputW;
        tempCanvas.height = outputH;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, 0);
          ctx.drawImage(tempCanvas, 0, 0);
        }
        ctx.filter = "none";
      }

      // Apply round mask
      if (options.roundMask) {
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = outputW;
        maskCanvas.height = outputH;
        const maskCtx = maskCanvas.getContext("2d");
        if (maskCtx) {
          maskCtx.beginPath();
          maskCtx.arc(outputW / 2, outputH / 2, Math.min(outputW, outputH) / 2, 0, Math.PI * 2);
          maskCtx.closePath();
          maskCtx.clip();
          maskCtx.drawImage(canvas, 0, 0);

          canvas.width = outputW;
          canvas.height = outputH;
          ctx.clearRect(0, 0, outputW, outputH);
          ctx.drawImage(maskCanvas, 0, 0);
        }
      }

      // Return as data URL
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(imageFile);
  });
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: "Invalid file type. Please use JPEG, PNG, or WebP." };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: "File too large. Maximum size is 10MB." };
  }

  return { valid: true };
}
