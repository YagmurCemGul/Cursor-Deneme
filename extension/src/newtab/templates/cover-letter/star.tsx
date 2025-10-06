// STAR method cover letter template - situation, task, action, result
export interface CoverLetterData {
  applicantName: string;
  applicantEmail: string;
  companyName: string;
  hiringManagerName?: string;
  position: string;
  content: string; // Should follow STAR format
}

export function renderStarCoverLetter(data: CoverLetterData, locale: string = "en"): string {
  const t = (en: string, tr: string) => (locale === "tr" ? tr : en);

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px; line-height: 1.7; color: #1a1a1a;">
      <!-- Header -->
      <div style="margin-bottom: 25px;">
        <div style="font-size: 18px; font-weight: 600; color: #2563eb; margin-bottom: 10px;">
          ${data.applicantName}
        </div>
        <div style="font-size: 14px; color: #666;">${data.applicantEmail}</div>
      </div>

      <!-- Title -->
      <div style="margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #2563eb;">
        <div style="font-size: 20px; font-weight: 600;">
          ${t("Application for", "Başvuru:")} ${data.position}
        </div>
        <div style="font-size: 14px; color: #666; margin-top: 5px;">${data.companyName}</div>
      </div>

      <!-- Greeting -->
      <div style="margin-bottom: 20px;">
        ${t("Dear", "Sayın")} ${data.hiringManagerName || t("Hiring Manager", "İşe Alım Yöneticisi")},
      </div>

      <!-- STAR Content -->
      <div style="white-space: pre-line; text-align: justify;">
        ${data.content}
      </div>

      <!-- Closing -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <div style="margin-bottom: 10px;">${t("Best regards", "Saygılarımla")},</div>
        <div style="font-weight: 600; font-size: 16px;">${data.applicantName}</div>
      </div>
    </div>
  `;
}
