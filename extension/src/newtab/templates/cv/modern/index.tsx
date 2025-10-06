// Modern CV Template - clean, professional with color accents
import type { ResumeProfile } from "../../../../lib/storage/schema";

export function renderModernCV(profile: ResumeProfile, locale: string = "en"): string {
  const fullName = `${profile.personal.firstName} ${profile.personal.middleName || ""} ${profile.personal.lastName}`.trim();
  
  const t = (en: string, tr: string) => (locale === "tr" ? tr : en);

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: white; color: #333;">
      <!-- Header -->
      <div style="border-left: 4px solid #3b82f6; padding-left: 20px; margin-bottom: 30px;">
        <h1 style="margin: 0 0 10px 0; font-size: 36px; color: #1e293b;">${fullName}</h1>
        <div style="font-size: 14px; color: #64748b; line-height: 1.8;">
          ${profile.personal.email ? `<div>✉ ${profile.personal.email}</div>` : ""}
          ${profile.personal.phone ? `<div>📱 ${profile.personal.phone}</div>` : ""}
          ${profile.personal.location ? `<div>📍 ${profile.personal.location}</div>` : ""}
          ${profile.personal.linkedin ? `<div>🔗 linkedin.com/in/${profile.personal.linkedin}</div>` : ""}
          ${profile.personal.github ? `<div>💻 github.com/${profile.personal.github}</div>` : ""}
        </div>
      </div>

      <!-- Summary -->
      ${profile.personal.summary ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #3b82f6; font-size: 20px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">${t("Professional Summary", "Profesyonel Özet")}</h2>
          <p style="line-height: 1.6; color: #475569;">${profile.personal.summary}</p>
        </div>
      ` : ""}

      <!-- Experience -->
      ${profile.experience.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #3b82f6; font-size: 20px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">${t("Experience", "Deneyim")}</h2>
          ${profile.experience.map((exp) => `
            <div style="margin-bottom: 20px; padding-left: 15px; border-left: 2px solid #e2e8f0;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
                <div>
                  <h3 style="margin: 0; font-size: 18px; color: #1e293b;">${exp.title}</h3>
                  <div style="color: #64748b; font-size: 14px;">${exp.company}${exp.location ? ` • ${exp.location}` : ""}</div>
                </div>
                <div style="color: #64748b; font-size: 13px; white-space: nowrap;">
                  ${exp.startDate}${exp.isCurrent ? ` - ${t("Present", "Günümüz")}` : exp.endDate ? ` - ${exp.endDate}` : ""}
                </div>
              </div>
              ${exp.description ? `<p style="margin: 10px 0; color: #475569; line-height: 1.6;">${exp.description}</p>` : ""}
              ${exp.skills && exp.skills.length > 0 ? `
                <div style="margin-top: 10px;">
                  ${exp.skills.map(skill => `<span style="display: inline-block; background: #eff6ff; color: #3b82f6; padding: 3px 10px; border-radius: 12px; font-size: 12px; margin-right: 8px; margin-bottom: 5px;">${skill}</span>`).join("")}
                </div>
              ` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}

      <!-- Education -->
      ${profile.education.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #3b82f6; font-size: 20px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">${t("Education", "Eğitim")}</h2>
          ${profile.education.map((edu) => `
            <div style="margin-bottom: 15px; padding-left: 15px; border-left: 2px solid #e2e8f0;">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <h3 style="margin: 0; font-size: 16px; color: #1e293b;">${edu.school}</h3>
                  <div style="color: #64748b; font-size: 14px;">${edu.degree || ""}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}</div>
                </div>
                ${edu.startDate || edu.endDate ? `
                  <div style="color: #64748b; font-size: 13px; white-space: nowrap;">
                    ${edu.startDate || ""}${edu.endDate ? ` - ${edu.endDate}` : ""}
                  </div>
                ` : ""}
              </div>
              ${edu.grade ? `<div style="color: #475569; font-size: 14px; margin-top: 5px;">Grade: ${edu.grade}</div>` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}

      <!-- Skills -->
      ${profile.skills.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #3b82f6; font-size: 20px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">${t("Skills", "Yetenekler")}</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${profile.skills.map(skill => `<span style="background: #3b82f6; color: white; padding: 6px 14px; border-radius: 6px; font-size: 14px;">${skill}</span>`).join("")}
          </div>
        </div>
      ` : ""}

      <!-- Projects -->
      ${profile.projects.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #3b82f6; font-size: 20px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">${t("Projects", "Projeler")}</h2>
          ${profile.projects.map((proj) => `
            <div style="margin-bottom: 15px; padding-left: 15px; border-left: 2px solid #e2e8f0;">
              <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #1e293b;">${proj.name}</h3>
              ${proj.description ? `<p style="margin: 5px 0; color: #475569; line-height: 1.6;">${proj.description}</p>` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}

      <!-- Licenses -->
      ${profile.licenses.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #3b82f6; font-size: 20px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">${t("Licenses & Certifications", "Lisanslar & Sertifikalar")}</h2>
          ${profile.licenses.map((lic) => `
            <div style="margin-bottom: 10px;">
              <div style="font-weight: 600; color: #1e293b;">${lic.name}</div>
              ${lic.organization ? `<div style="color: #64748b; font-size: 14px;">${lic.organization}</div>` : ""}
              ${lic.issueDate ? `<div style="color: #64748b; font-size: 13px;">${t("Issued", "Verildi")}: ${lic.issueDate}</div>` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
}
