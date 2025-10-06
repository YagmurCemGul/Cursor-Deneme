// Minimal CV Template - ultra-clean, maximum whitespace, modern typography
import type { ResumeProfile } from "../../../../lib/storage/schema";

export function renderMinimalCV(profile: ResumeProfile, locale: string = "en"): string {
  const fullName = `${profile.personal.firstName} ${profile.personal.middleName || ""} ${profile.personal.lastName}`.trim();
  
  const t = (en: string, tr: string) => (locale === "tr" ? tr : en);

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 60px 40px; background: white; color: #1a1a1a;">
      <!-- Header -->
      <div style="margin-bottom: 50px;">
        <h1 style="margin: 0 0 15px 0; font-size: 40px; font-weight: 300; letter-spacing: -1px;">${fullName}</h1>
        <div style="font-size: 14px; color: #666; line-height: 2;">
          ${profile.personal.email || ""}${profile.personal.phone ? ` • ${profile.personal.phone}` : ""}${profile.personal.location ? ` • ${profile.personal.location}` : ""}
        </div>
        ${profile.personal.linkedin || profile.personal.github ? `
          <div style="font-size: 14px; color: #666; margin-top: 5px;">
            ${profile.personal.linkedin ? `linkedin.com/in/${profile.personal.linkedin}` : ""}${profile.personal.github ? ` • github.com/${profile.personal.github}` : ""}
          </div>
        ` : ""}
      </div>

      <!-- Summary -->
      ${profile.personal.summary ? `
        <div style="margin-bottom: 50px;">
          <p style="line-height: 1.9; font-size: 16px; color: #333; margin: 0;">${profile.personal.summary}</p>
        </div>
      ` : ""}

      <!-- Experience -->
      ${profile.experience.length > 0 ? `
        <div style="margin-bottom: 50px;">
          <h2 style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 25px;">${t("Experience", "Deneyim")}</h2>
          ${profile.experience.map((exp) => `
            <div style="margin-bottom: 35px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <h3 style="margin: 0; font-size: 18px; font-weight: 500;">${exp.title}</h3>
                <span style="color: #999; font-size: 14px; white-space: nowrap;">
                  ${exp.startDate}${exp.isCurrent ? ` - ${t("Now", "Şimdi")}` : exp.endDate ? ` - ${exp.endDate}` : ""}
                </span>
              </div>
              <div style="color: #666; font-size: 15px; margin-bottom: 10px;">${exp.company}</div>
              ${exp.description ? `<p style="margin: 0; color: #444; line-height: 1.8; font-size: 15px;">${exp.description}</p>` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}

      <!-- Education -->
      ${profile.education.length > 0 ? `
        <div style="margin-bottom: 50px;">
          <h2 style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 25px;">${t("Education", "Eğitim")}</h2>
          ${profile.education.map((edu) => `
            <div style="margin-bottom: 25px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 500;">${edu.school}</h3>
                ${edu.endDate ? `<span style="color: #999; font-size: 14px;">${edu.endDate}</span>` : ""}
              </div>
              <div style="color: #666; font-size: 15px;">${edu.degree || ""}${edu.fieldOfStudy ? ` ${edu.fieldOfStudy}` : ""}</div>
            </div>
          `).join("")}
        </div>
      ` : ""}

      <!-- Skills -->
      ${profile.skills.length > 0 ? `
        <div style="margin-bottom: 50px;">
          <h2 style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 15px;">${t("Skills", "Yetenekler")}</h2>
          <p style="line-height: 2; font-size: 15px; color: #444; margin: 0;">${profile.skills.join(" • ")}</p>
        </div>
      ` : ""}

      <!-- Projects -->
      ${profile.projects.length > 0 ? `
        <div style="margin-bottom: 50px;">
          <h2 style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 25px;">${t("Projects", "Projeler")}</h2>
          ${profile.projects.map((proj) => `
            <div style="margin-bottom: 25px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 500;">${proj.name}</h3>
              ${proj.description ? `<p style="margin: 0; color: #444; line-height: 1.8; font-size: 15px;">${proj.description}</p>` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}

      <!-- Licenses -->
      ${profile.licenses.length > 0 ? `
        <div style="margin-bottom: 50px;">
          <h2 style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 20px;">${t("Certifications", "Sertifikalar")}</h2>
          ${profile.licenses.map((lic) => `
            <div style="margin-bottom: 15px;">
              <div style="font-weight: 500; font-size: 15px;">${lic.name}</div>
              ${lic.organization ? `<div style="color: #666; font-size: 14px; margin-top: 3px;">${lic.organization}</div>` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
}
