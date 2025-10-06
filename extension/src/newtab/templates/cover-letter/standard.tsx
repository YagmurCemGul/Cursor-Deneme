// Standard cover letter template
export interface CoverLetterData {
  applicantName: string;
  applicantAddress?: string;
  applicantEmail: string;
  applicantPhone?: string;
  date: string;
  companyName: string;
  hiringManagerName?: string;
  companyAddress?: string;
  position: string;
  content: string; // Main body paragraphs
}

export function renderStandardCoverLetter(data: CoverLetterData, locale: string = "en"): string {
  const t = (en: string, tr: string) => (locale === "tr" ? tr : en);

  return `
    <div style="font-family: 'Times New Roman', Times, serif; max-width: 650px; margin: 0 auto; padding: 40px; line-height: 1.8; color: #000;">
      <!-- Applicant info -->
      <div style="margin-bottom: 30px;">
        <div style="font-weight: bold; font-size: 16px;">${data.applicantName}</div>
        ${data.applicantAddress ? `<div>${data.applicantAddress}</div>` : ""}
        <div>${data.applicantEmail}${data.applicantPhone ? ` | ${data.applicantPhone}` : ""}</div>
      </div>

      <!-- Date -->
      <div style="margin-bottom: 30px;">${data.date}</div>

      <!-- Company info -->
      <div style="margin-bottom: 30px;">
        ${data.hiringManagerName ? `<div>${data.hiringManagerName}</div>` : `<div>${t("Hiring Manager", "İşe Alım Yöneticisi")}</div>`}
        <div>${data.companyName}</div>
        ${data.companyAddress ? `<div>${data.companyAddress}</div>` : ""}
      </div>

      <!-- Salutation -->
      <div style="margin-bottom: 20px;">
        ${t("Dear", "Sayın")} ${data.hiringManagerName || t("Hiring Manager", "İşe Alım Yöneticisi")},
      </div>

      <!-- Body -->
      <div style="white-space: pre-line; text-align: justify;">
        ${data.content}
      </div>

      <!-- Closing -->
      <div style="margin-top: 30px;">
        <div>${t("Sincerely", "Saygılarımla")},</div>
        <div style="margin-top: 40px; font-weight: bold;">${data.applicantName}</div>
      </div>
    </div>
  `;
}
