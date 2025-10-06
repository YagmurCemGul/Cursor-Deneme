import React, { useState } from "react";
import type { AdditionalAnswer, QuestionType } from "../../lib/storage/schema";

interface AdditionalQuestionsBuilderProps {
  answers: AdditionalAnswer[];
  onChange: (answers: AdditionalAnswer[]) => void;
  locale?: "en" | "tr";
}

const QUESTION_TYPES: { value: QuestionType; labelEn: string; labelTr: string }[] = [
  { value: "shortText", labelEn: "Short Text", labelTr: "Kısa Metin" },
  { value: "longText", labelEn: "Long Text", labelTr: "Uzun Metin" },
  { value: "singleSelect", labelEn: "Single Select", labelTr: "Tek Seçim" },
  { value: "multiSelect", labelEn: "Multi Select", labelTr: "Çoklu Seçim" },
  { value: "yesNo", labelEn: "Yes/No", labelTr: "Evet/Hayır" },
  { value: "date", labelEn: "Date", labelTr: "Tarih" },
  { value: "file", labelEn: "File", labelTr: "Dosya" },
  { value: "link", labelEn: "Link", labelTr: "Bağlantı" },
  { value: "number", labelEn: "Number", labelTr: "Sayı" },
];

export function AdditionalQuestionsBuilder({
  answers,
  onChange,
  locale = "en",
}: AdditionalQuestionsBuilderProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addQuestion = () => {
    const newAnswer: AdditionalAnswer = {
      qId: `q_${Date.now()}`,
      label: locale === "tr" ? "Yeni Soru" : "New Question",
      type: "shortText",
      value: undefined,
      meta: {},
    };
    onChange([...answers, newAnswer]);
    setEditingId(newAnswer.qId);
  };

  const updateQuestion = (qId: string, updates: Partial<AdditionalAnswer>) => {
    onChange(
      answers.map((a) =>
        a.qId === qId ? { ...a, ...updates } : a
      )
    );
  };

  const deleteQuestion = (qId: string) => {
    onChange(answers.filter((a) => a.qId !== qId));
  };

  const renderAnswerInput = (answer: AdditionalAnswer) => {
    switch (answer.type) {
      case "shortText":
        return (
          <input
            type="text"
            value={(answer.value as string) || ""}
            onChange={(e) => updateQuestion(answer.qId, { value: e.target.value })}
            placeholder={locale === "tr" ? "Cevabınız..." : "Your answer..."}
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        );

      case "longText":
        return (
          <textarea
            value={(answer.value as string) || ""}
            onChange={(e) => updateQuestion(answer.qId, { value: e.target.value })}
            placeholder={locale === "tr" ? "Cevabınız..." : "Your answer..."}
            rows={4}
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        );

      case "singleSelect":
      case "multiSelect": {
        const options = answer.meta?.options || [];
        const isMulti = answer.type === "multiSelect";
        const value = answer.value as string | string[] | undefined;

        return (
          <div>
            {editingId === answer.qId && (
              <div style={{ marginBottom: "0.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  {locale === "tr" ? "Seçenekler:" : "Options:"}
                </label>
                {options.map((opt, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[idx] = { ...opt, label: e.target.value, value: e.target.value };
                        updateQuestion(answer.qId, { meta: { ...answer.meta, options: newOptions } });
                      }}
                      style={{ flex: 1, padding: "0.25rem", border: "1px solid #ccc", borderRadius: "4px" }}
                    />
                    <button
                      onClick={() => {
                        const newOptions = options.filter((_, i) => i !== idx);
                        updateQuestion(answer.qId, { meta: { ...answer.meta, options: newOptions } });
                      }}
                      style={{ padding: "0.25rem 0.5rem", background: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newOptions = [...options, { label: "Option " + (options.length + 1), value: "opt_" + options.length }];
                    updateQuestion(answer.qId, { meta: { ...answer.meta, options: newOptions } });
                  }}
                  style={{ padding: "0.25rem 0.5rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  + {locale === "tr" ? "Seçenek Ekle" : "Add Option"}
                </button>
              </div>
            )}

            {options.length > 0 && (
              <div>
                {isMulti ? (
                  options.map((opt) => (
                    <label key={opt.value} style={{ display: "block", marginBottom: "0.25rem" }}>
                      <input
                        type="checkbox"
                        checked={Array.isArray(value) && value.includes(opt.value)}
                        onChange={(e) => {
                          const current = (value as string[]) || [];
                          const newValue = e.target.checked
                            ? [...current, opt.value]
                            : current.filter((v) => v !== opt.value);
                          updateQuestion(answer.qId, { value: newValue });
                        }}
                        style={{ marginRight: "0.5rem" }}
                      />
                      {opt.label}
                    </label>
                  ))
                ) : (
                  <select
                    value={(value as string) || ""}
                    onChange={(e) => updateQuestion(answer.qId, { value: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                  >
                    <option value="">{locale === "tr" ? "Seçiniz..." : "Select..."}</option>
                    {options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        );
      }

      case "yesNo":
        return (
          <div style={{ display: "flex", gap: "1rem" }}>
            <label>
              <input
                type="radio"
                checked={answer.value === true}
                onChange={() => updateQuestion(answer.qId, { value: true })}
                style={{ marginRight: "0.5rem" }}
              />
              {locale === "tr" ? "Evet" : "Yes"}
            </label>
            <label>
              <input
                type="radio"
                checked={answer.value === false}
                onChange={() => updateQuestion(answer.qId, { value: false })}
                style={{ marginRight: "0.5rem" }}
              />
              {locale === "tr" ? "Hayır" : "No"}
            </label>
          </div>
        );

      case "date":
        return (
          <input
            type="date"
            value={(answer.value as string) || ""}
            onChange={(e) => updateQuestion(answer.qId, { value: e.target.value })}
            style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        );

      case "file":
        return (
          <div>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  updateQuestion(answer.qId, {
                    value: file.name,
                    meta: {
                      ...answer.meta,
                      fileName: file.name,
                      fileSize: file.size,
                      fileType: file.type,
                    },
                  });
                }
              }}
              style={{ marginBottom: "0.5rem" }}
            />
            {answer.meta?.fileName && (
              <div style={{ fontSize: "0.875rem", color: "#666" }}>
                {answer.meta.fileName} ({Math.round((answer.meta.fileSize || 0) / 1024)} KB)
              </div>
            )}
          </div>
        );

      case "link":
        return (
          <input
            type="url"
            value={(answer.value as string) || ""}
            onChange={(e) => updateQuestion(answer.qId, { value: e.target.value })}
            placeholder="https://..."
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={(answer.value as number) || ""}
            onChange={(e) => updateQuestion(answer.qId, { value: parseFloat(e.target.value) })}
            style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="additional-questions-builder">
      <h3 style={{ marginBottom: "1rem" }}>
        {locale === "tr" ? "Ek Sorular" : "Additional Questions"}
      </h3>

      {answers.map((answer) => (
        <div
          key={answer.qId}
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
            background: "#fafafa",
          }}
        >
          {editingId === answer.qId ? (
            <div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>
                  {locale === "tr" ? "Soru:" : "Question:"}
                </label>
                <input
                  type="text"
                  value={answer.label}
                  onChange={(e) => updateQuestion(answer.qId, { label: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                />
              </div>

              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>
                  {locale === "tr" ? "Soru Tipi:" : "Question Type:"}
                </label>
                <select
                  value={answer.type}
                  onChange={(e) => updateQuestion(answer.qId, { type: e.target.value as QuestionType, value: undefined, meta: {} })}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
                >
                  {QUESTION_TYPES.map((qt) => (
                    <option key={qt.value} value={qt.value}>
                      {locale === "tr" ? qt.labelTr : qt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setEditingId(null)}
                style={{ padding: "0.5rem 1rem", background: "#22c55e", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                {locale === "tr" ? "Kaydet" : "Save"}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: "block", marginBottom: "0.25rem" }}>{answer.label}</strong>
                  <span style={{ fontSize: "0.875rem", color: "#666" }}>
                    {QUESTION_TYPES.find((qt) => qt.value === answer.type)?.[locale === "tr" ? "labelTr" : "labelEn"]}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => setEditingId(answer.qId)}
                    style={{ padding: "0.25rem 0.5rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    {locale === "tr" ? "Düzenle" : "Edit"}
                  </button>
                  <button
                    onClick={() => deleteQuestion(answer.qId)}
                    style={{ padding: "0.25rem 0.5rem", background: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    {locale === "tr" ? "Sil" : "Delete"}
                  </button>
                </div>
              </div>

              <div>{renderAnswerInput(answer)}</div>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addQuestion}
        style={{
          padding: "0.75rem 1.5rem",
          background: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        + {locale === "tr" ? "Soru Ekle" : "Add Question"}
      </button>
    </div>
  );
}
