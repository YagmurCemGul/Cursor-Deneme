// ATS-Optimized CV Template - plain text friendly, keyword rich, parseable
import type { ResumeProfile } from "../../../../lib/storage/schema";

export function renderAtsCV(profile: ResumeProfile, locale: string = "en"): string {
  const fullName = `${profile.personal.firstName} ${profile.personal.middleName || ""} ${profile.personal.lastName}`.trim();
  
  const t = (en: string, tr: string) => (locale === "tr" ? tr : en);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: white; color: #000; line-height: 1.6;">
      <!-- Header - Simple, no formatting tricks -->
      <div style="margin-bottom: 25px;">
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">${fullName}</div>
        <div style="font-size: 14px;">
          ${profile.personal.email || ""}
          ${profile.personal.phone ? ` | ${profile.personal.phone}` : ""}
          ${profile.personal.location ? ` | ${profile.personal.location}` : ""}
        </div>
        ${profile.personal.linkedin ? `<div style="font-size: 14px;">LinkedIn: linkedin.com/in/${profile.personal.linkedin}</div>` : ""}
        ${profile.personal.github ? `<div style="font-size: 14px;">GitHub: github.com/${profile.personal.github}</div>` : ""}
        ${profile.personal.portfolio ? `<div style="font-size: 14px;">Portfolio: ${profile.personal.portfolio}</div>` : ""}
      </div>

      <!-- Summary -->
      ${profile.personal.summary ? `
        <div style="margin-bottom: 25px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; text-transform: uppercase;">${t("PROFESSIONAL SUMMARY", "PROFESYONEL ÖZET")}</div>
          <p style="margin: 0;">${profile.personal.summary}</p>
        </div>
      ` : ""}

      <!-- Skills - keyword rich, easy to parse -->
      ${profile.skills.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; text-transform: uppercase;">${t("SKILLS", "YETENEKLER")}</div>
          <div>${profile.skills.join(", ")}</div>
        </div>
      ` : ""}

      <!-- Experience -->
      ${profile.experience.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 12px; text-transform: uppercase;">${t("WORK EXPERIENCE", "İŞ DENEYİMİ")}</div>
          ${profile.experience.map((exp) => `
            <div style="margin-bottom: 20px;">
              <div style="font-weight: bold; font-size: 15px;">${exp.title}</div>
              <div style="font-size: 14px;">${exp.company}${exp.location ? ` | ${exp.location}` : ""}${exp.country ? ` | ${exp.country}` : ""}</div>
              <div style="font-size: 14px; margin-bottom: 8px;">
                ${exp.startDate}${exp.isCurrent ? ` - ${t("Present", "Günümüz")}` : exp.endDate ? ` - ${exp.endDate}` : ""}
                ${exp.locationType ? ` | ${exp.locationType}` : ""}
                ${exp.employmentType ? ` | ${exp.employmentType}` : ""}
              </div>
              ${exp.description ? `<div style="margin-bottom: 8px;">${exp.description}</div>` : ""}
              ${exp.bullets && exp.bullets.length > 0 ? `
                <ul style="margin: 8px 0; padding-left: 20px;">
                  ${exp.bullets.map(bullet => `<li>${bullet}</li>`).join("")}
                </ul>
              ` : ""}
              ${exp.skills && exp.skills.length > 0 ? `
                <div style="font-size: 13px; margin-top: 8px;">
                  <strong>${t("Skills used", "Kullanılan yetenekler")}:</strong> ${exp.skills.join(", ")}
                </div>
              ` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}

      <!-- Education -->
      ${profile.education.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 12px; text-transform: uppercase;">${t("EDUCATION", "EĞİTİM")}</div>
          ${profile.education.map((edu) => `
            <div style="margin-bottom: 15px;">
              <div style="font-weight: bold; font-size: 15px;">${edu.degree || ""}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}</div>
              <div style="font-size: 14px;">${edu.school}${edu.city ? ` | ${edu.city}` : ""}${edu.country ? ` | ${edu.country}` : ""}</div>
              <div style="font-size: 14px;">
                ${edu.startDate || ""}${edu.endDate ? ` - ${edu.endDate}` : ""}${edu.expected ? ` (${t("Expected", "Beklenen")})` : ""}
                ${edu.grade ? ` | ${t("Grade", "Not")}: ${edu.grade}` : ""}
              </div>
              ${edu.description ? `<div style="margin-top: 5px;">${edu.description}</div>` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}

      <!-- Licenses & Certifications -->
      ${profile.licenses.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 12px; text-transform: uppercase;">${t("LICENSES & CERTIFICATIONS", "LİSANSLAR & SERTİFİKALAR")}</div>
          ${profile.licenses.map((lic) => `
            <div style="margin-bottom: 12px;">
              <div style="font-weight: bold;">${lic.name}</div>
              ${lic.organization ? `<div style="font-size: 14px;">${lic.organization}</div>` : ""}
              <div style="font-size: 14px;">
                ${lic.issueDate ? `${t("Issued", "Verildi")}: ${lic.issueDate}` : ""}
                ${lic.expirationDate ? ` | ${t("Expires", "Süre Bitiş")}: ${lic.expirationDate}` : ""}
              </div>
              ${lic.credentialId ? `<div style="font-size: 13px;">ID: ${lic.credentialId}</div>` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}

      <!-- Projects -->
      ${profile.projects.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 12px; text-transform: uppercase;">${t("PROJECTS", "PROJELER")}</div>
          ${profile.projects.map((proj) => `
            <div style="margin-bottom: 15px;">
              <div style="font-weight: bold;">${proj.name}</div>
              ${proj.startDate || proj.endDate ? `
                <div style="font-size: 14px;">
                  ${proj.startDate || ""}${proj.endDate ? ` - ${proj.endDate}` : ""}${proj.current ? ` - ${t("Present", "Günümüz")}` : ""}
                </div>
              ` : ""}
              ${proj.description ? `<div style="margin-top: 5px;">${proj.description}</div>` : ""}
              ${proj.skills && proj.skills.length > 0 ? `
                <div style="font-size: 13px; margin-top: 5px;">
                  <strong>${t("Technologies", "Teknolojiler")}:</strong> ${proj.skills.join(", ")}
                </div>
              ` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
}
