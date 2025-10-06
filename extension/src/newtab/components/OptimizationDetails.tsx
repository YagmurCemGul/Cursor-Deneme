import React from "react";
import { highlightBus } from "../../lib/highlight/bus";

interface OptimizationDetailsProps {
  section: string;
  field?: string;
  index?: number;
  rationale: string;
  before?: string;
  after?: string;
  locale?: "en" | "tr";
}

export function OptimizationDetails({
  section,
  field,
  index,
  rationale,
  before,
  after,
  locale = "en",
}: OptimizationDetailsProps) {
  const handleHighlight = () => {
    highlightBus.publish({ section, field, index });
    
    // Announce to screen readers
    const message = locale === "tr" 
      ? "Optimize edilmiş bölüm vurgulandı"
      : "Optimized section highlighted";
    
    const liveRegion = document.createElement("div");
    liveRegion.setAttribute("role", "status");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.style.position = "absolute";
    liveRegion.style.left = "-10000px";
    liveRegion.textContent = message;
    document.body.appendChild(liveRegion);
    setTimeout(() => document.body.removeChild(liveRegion), 1000);
  };

  return (
    <div
      className="optimization-details"
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        padding: "1rem",
        marginBottom: "1rem",
        background: "#fafafa",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <button
          onClick={handleHighlight}
          style={{
            background: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "0.25rem 0.75rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#16a34a")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#22c55e")}
          aria-label={locale === "tr" ? "Optimize edilmiş bölümü göster" : "Show optimized section"}
        >
          {locale === "tr" ? "Optimize Edildi" : "Optimized"}
        </button>
        <span style={{ fontSize: "0.875rem", color: "#666" }}>
          {section}
          {field && ` • ${field}`}
          {index !== undefined && ` #${index + 1}`}
        </span>
      </div>

      <div style={{ marginBottom: "0.75rem" }}>
        <strong style={{ display: "block", marginBottom: "0.25rem" }}>
          {locale === "tr" ? "Gerekçe:" : "Rationale:"}
        </strong>
        <p style={{ margin: 0, color: "#444", lineHeight: 1.5 }}>{rationale}</p>
      </div>

      {before && (
        <div style={{ marginBottom: "0.75rem" }}>
          <strong style={{ display: "block", marginBottom: "0.25rem", color: "#dc2626" }}>
            {locale === "tr" ? "Önce:" : "Before:"}
          </strong>
          <p
            style={{
              margin: 0,
              color: "#666",
              fontStyle: "italic",
              background: "#fee",
              padding: "0.5rem",
              borderRadius: "4px",
            }}
          >
            {before}
          </p>
        </div>
      )}

      {after && (
        <div>
          <strong style={{ display: "block", marginBottom: "0.25rem", color: "#16a34a" }}>
            {locale === "tr" ? "Sonra:" : "After:"}
          </strong>
          <p
            style={{
              margin: 0,
              color: "#444",
              background: "#efe",
              padding: "0.5rem",
              borderRadius: "4px",
            }}
          >
            {after}
          </p>
        </div>
      )}
    </div>
  );
}
