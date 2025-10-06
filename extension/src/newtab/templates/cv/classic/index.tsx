// Classic CV Template - traditional, serif fonts, conservative
import type { ResumeProfile } from "../../../../lib/storage/schema";

export function renderClassicCV(profile: ResumeProfile, locale: string = "en"): string {
  const fullName = `${profile.personal.firstName} ${profile.personal.middleName || ""} ${profile.personal.lastName}`.trim();
  
  const t = (en: string, tr: string) => (locale === "tr" ? tr : en);

  return `
    <div style="font-family: 'Times New Roman', Times, serif; max-width: 800px; margin: 0 auto; padding: 50px; background: white; color: #000;">
      <!-- Header -->
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 25px;">
        <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">${fullName}</h1>
        <div style="font-size: 13px; line-height: 1.8;">
          ${[
            profile.personal.email,
            profile.personal.phone,
            profile.personal.location,
            profile.personal.linkedin ? `LinkedIn: ${profile.personal.linkedin}` : "",
          ]
            .filter(Boolean)
            .join(" | ")}
        </div>
      </div>

      <!-- Summary -->
      ${profile.personal.summary ? `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px;">${t("Professional Summary", "Profesyonel Özet")}</h2>
          <p style="line-height: 1.8; text-align: justify;">${profile.personal.summary}</p>
        </div>
      ` : ""}

      <!-- Experience -->
      ${profile.experience.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 5px;">${t("Professional Experience", "Profesyonel Deneyim")}</h2>
          ${profile.experience.map((exp) => `
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <div style="font-weight: bold; font-size: 15px;">${exp.title}</div>
                <div style="font-style: italic; font-size: 14px;">
                  ${exp.startDate}${exp.isCurrent ? ` - ${t("Present", "Günümüz")}` : exp.endDate ? ` - ${exp.endDate}` : ""}
                </div>
              </div>
              <div style="font-style: italic; margin-bottom: 8px; font-size: 14px;">${exp.company}${exp.location ? `, ${exp.location}` : ""}</div>
              ${exp.description ? `<p style="margin: 0; line-height: 1.7; text-align: justify;">${exp.description}</p>` : ""}
              ${exp.skills && exp.skills.length > 0 ? `
                <div style="margin-top: 8px; font-size: 13px;">
                  <strong>${t("Key Skills", "Ana Yetenekler")}:</strong> ${exp.skills.join(", ")}
                </div>
              ` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}

      <!-- Education -->
      ${profile.education.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 5px;">${t("Education", "Eğitim")}</h2>
          ${profile.education.map((edu) => `
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <div style="font-weight: bold; font-size: 15px;">${edu.school}</div>
                ${edu.startDate || edu.endDate ? `
                  <div style="font-style: italic; font-size: 14px;">
                    ${edu.startDate || ""}${edu.endDate ? ` - ${edu.endDate}` : ""}
                  </div>
                ` : ""}
              </div>
              <div style="font-size: 14px;">${edu.degree || ""}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}</div>
              ${edu.grade ? `<div style="font-size: 14px; margin-top: 3px;">Grade: ${edu.grade}</div>` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}

      <!-- Skills -->
      ${profile.skills.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px;">${t("Skills", "Yetenekler")}</h2>
          <p style="line-height: 1.8;">${profile.skills.join(" • ")}</p>
        </div>
      ` : ""}

      <!-- Licenses -->
      ${profile.licenses.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 5px;">${t("Licenses & Certifications", "Lisanslar & Sertifikalar")}</h2>
          ${profile.licenses.map((lic) => `
            <div style="margin-bottom: 10px;">
              <div style="font-weight: bold;">${lic.name}</div>
              ${lic.organization ? `<div style="font-size: 14px;">${lic.organization}${lic.issueDate ? `, ${lic.issueDate}` : ""}</div>` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}

      <!-- Projects -->
      ${profile.projects.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 5px;">${t("Projects", "Projeler")}</h2>
          ${profile.projects.map((proj) => `
            <div style="margin-bottom: 15px;">
              <div style="font-weight: bold;">${proj.name}</div>
              ${proj.description ? `<p style="margin: 5px 0; line-height: 1.7; text-align: justify;">${proj.description}</p>` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
}
