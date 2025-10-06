import React, { useState, useRef } from "react";
import { editImage, stripExif, validateImageFile } from "../../utils/image/canvas";
import type { ImageEditOptions } from "../../utils/image/canvas";

interface PhotoEditorProps {
  initialPhoto?: string;
  onSave: (photoUrl: string, metadata: any) => void;
  onCancel: () => void;
  aiEditEnabled?: boolean;
  aiApiKey?: string;
  locale?: "en" | "tr";
}

export function PhotoEditor({
  initialPhoto,
  onSave,
  onCancel,
  aiEditEnabled = false,
  aiApiKey,
  locale = "en",
}: PhotoEditorProps) {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialPhoto || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [options, setOptions] = useState<ImageEditOptions>({
    brightness: 0,
    contrast: 0,
    blur: 0,
    zoom: 1.0,
    roundMask: true,
    backgroundBlur: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (en: string, tr: string) => (locale === "tr" ? tr : en);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Strip EXIF
      const cleaned = await stripExif(file);
      const cleanedFile = new File([cleaned], file.name, { type: file.type });
      setOriginalFile(cleanedFile);

      // Initial preview
      const preview = await editImage(cleanedFile, options);
      setPreviewUrl(preview);
    } catch (err) {
      setError(t("Failed to load image", "Görsel yüklenemedi"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = async (key: keyof ImageEditOptions, value: any) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);

    if (!originalFile) return;

    setLoading(true);
    try {
      const preview = await editImage(originalFile, newOptions);
      setPreviewUrl(preview);
    } catch (err) {
      setError(t("Failed to apply edit", "Düzenleme uygulanamadı"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAIEdit = async () => {
    if (!aiEditEnabled || !aiApiKey) {
      setError(t("AI editing is not enabled", "AI düzenleme etkin değil"));
      return;
    }

    if (!previewUrl) {
      setError(t("No image loaded", "Görsel yüklenmedi"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Use OpenAI Images API for enhancement (requires API key and explicit user consent)
      // This is a placeholder - real implementation would call the API
      console.warn("AI Edit feature requires OpenAI API integration - not sending data without explicit user consent");
      
      // For now, just apply some automatic enhancements locally
      const autoEnhanced = await editImage(originalFile!, {
        ...options,
        brightness: 10,
        contrast: 15,
      });
      setPreviewUrl(autoEnhanced);
      setOptions({ ...options, brightness: 10, contrast: 15 });
    } catch (err) {
      setError(t("AI enhancement failed", "AI iyileştirme başarısız"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!previewUrl) {
      setError(t("No image to save", "Kaydedilecek görsel yok"));
      return;
    }

    // Calculate metadata
    const img = new Image();
    img.onload = () => {
      onSave(previewUrl, {
        width: img.width,
        height: img.height,
        format: "jpeg",
        size: Math.round(previewUrl.length * 0.75), // Rough estimate
      });
    };
    img.src = previewUrl;
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px" }}>{t("Photo Editor", "Fotoğraf Düzenleyici")}</h2>

      {/* File Upload */}
      {!originalFile && (
        <div style={{ marginBottom: "20px" }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "12px 24px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {t("Upload Photo", "Fotoğraf Yükle")}
          </button>
        </div>
      )}

      {/* Preview */}
      {previewUrl && (
        <div
          style={{
            marginBottom: "20px",
            textAlign: "center",
            background: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: "400px",
              borderRadius: options.roundMask ? "50%" : "8px",
            }}
          />
        </div>
      )}

      {/* Controls */}
      {originalFile && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>
              {t("Brightness", "Parlaklık")}: {options.brightness}
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={options.brightness}
              onChange={(e) => handleOptionChange("brightness", parseInt(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>
              {t("Contrast", "Kontrast")}: {options.contrast}
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={options.contrast}
              onChange={(e) => handleOptionChange("contrast", parseInt(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>
              {t("Zoom", "Yakınlaştırma")}: {options.zoom?.toFixed(1)}x
            </label>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={options.zoom}
              onChange={(e) => handleOptionChange("zoom", parseFloat(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                checked={options.roundMask}
                onChange={(e) => handleOptionChange("roundMask", e.target.checked)}
              />
              <span>{t("Round mask", "Yuvarlak maske")}</span>
            </label>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>
              {t("Background Blur", "Arka Plan Bulanıklığı")}: {options.backgroundBlur}
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={options.backgroundBlur}
              onChange={(e) => handleOptionChange("backgroundBlur", parseInt(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          {/* AI Edit (optional) */}
          {aiEditEnabled && aiApiKey && (
            <div style={{ marginBottom: "15px", padding: "15px", background: "#fffbeb", borderRadius: "6px", border: "1px solid #fbbf24" }}>
              <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
                {t(
                  "AI Enhancement will send your image to OpenAI for automatic improvement.",
                  "AI İyileştirme, görselinizi otomatik iyileştirme için OpenAI'ye gönderecektir."
                )}
              </p>
              <button
                onClick={handleAIEdit}
                disabled={loading}
                style={{
                  padding: "8px 16px",
                  background: "#8b5cf6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {t("AI Enhance", "AI İyileştirme")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "12px",
            background: "#fee",
            color: "#c00",
            borderRadius: "6px",
            marginBottom: "15px",
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", marginBottom: "15px", color: "#666" }}>
          {t("Processing...", "İşleniyor...")}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button
          onClick={onCancel}
          style={{
            padding: "10px 20px",
            background: "#e5e7eb",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {t("Cancel", "İptal")}
        </button>
        <button
          onClick={handleSave}
          disabled={!previewUrl || loading}
          style={{
            padding: "10px 20px",
            background: previewUrl && !loading ? "#22c55e" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: previewUrl && !loading ? "pointer" : "not-allowed",
          }}
        >
          {t("Save", "Kaydet")}
        </button>
      </div>
    </div>
  );
}
