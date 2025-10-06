// Short cover letter template - concise, email-friendly
export interface CoverLetterData {
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  companyName: string;
  hiringManagerName?: string;
  position: string;
  content: string;
}

export function renderShortCoverLetter(data: CoverLetterData, locale: string = "en"): string {
  const t = (en: string, tr: string) => (locale === "tr" ? tr : en);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; line-height: 1.7; color: #333;">
      <!-- Subject Line -->
      <div style="font-weight: bold; font-size: 16px; margin-bottom: 20px; color: #1a1a1a;">
        ${t("Re: Application for", "Konu: Başvuru -")} ${data.position} ${t("at", "şirket")} ${data.companyName}
      </div>

      <!-- Greeting -->
      <div style="margin-bottom: 15px;">
        ${t("Dear", "Sayın")} ${data.hiringManagerName || t("Hiring Team", "İşe Alım Ekibi")},
      </div>

      <!-- Body -->
      <div style="white-space: pre-line;">
        ${data.content}
      </div>

      <!-- Quick contact -->
      <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
        <div style="font-weight: 600;">${data.applicantName}</div>
        <div style="font-size: 14px; color: #666;">
          ${data.applicantEmail}${data.applicantPhone ? ` | ${data.applicantPhone}` : ""}
        </div>
      </div>
    </div>
  `;
}
