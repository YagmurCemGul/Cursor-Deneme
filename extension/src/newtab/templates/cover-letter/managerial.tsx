// Managerial cover letter template - leadership focus, executive presence
export interface CoverLetterData {
  applicantName: string;
  applicantTitle?: string;
  applicantEmail: string;
  applicantPhone?: string;
  companyName: string;
  hiringManagerName?: string;
  position: string;
  content: string;
}

export function renderManagerialCoverLetter(data: CoverLetterData, locale: string = "en"): string {
  const t = (en: string, tr: string) => (locale === "tr" ? tr : en);

  return `
    <div style="font-family: 'Georgia', 'Times New Roman', serif; max-width: 700px; margin: 0 auto; padding: 50px; line-height: 1.9; color: #1a1a1a;">
      <!-- Letterhead -->
      <div style="margin-bottom: 35px; text-align: center; border-bottom: 3px double #333; padding-bottom: 20px;">
        <div style="font-size: 20px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
          ${data.applicantName}
        </div>
        ${data.applicantTitle ? `<div style="font-size: 14px; font-style: italic; margin-top: 5px; color: #555;">${data.applicantTitle}</div>` : ""}
        <div style="font-size: 13px; margin-top: 10px; color: #666;">
          ${data.applicantEmail}${data.applicantPhone ? ` • ${data.applicantPhone}` : ""}
        </div>
      </div>

      <!-- Date -->
      <div style="margin-bottom: 30px; font-size: 14px;">
        ${new Date().toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
      </div>

      <!-- Recipient -->
      <div style="margin-bottom: 30px;">
        ${data.hiringManagerName ? `<div style="font-weight: 600;">${data.hiringManagerName}</div>` : ""}
        <div style="font-weight: 600;">${data.companyName}</div>
        <div style="font-size: 14px; margin-top: 5px; color: #555;">
          ${t("Re: Leadership Role -", "Konu: Liderlik Rolü -")} ${data.position}
        </div>
      </div>

      <!-- Salutation -->
      <div style="margin-bottom: 25px;">
        ${t("Dear", "Sayın")} ${data.hiringManagerName || t("Executive Search Committee", "Yönetim Kurulu")},
      </div>

      <!-- Body -->
      <div style="white-space: pre-line; text-align: justify; font-size: 15px;">
        ${data.content}
      </div>

      <!-- Professional Closing -->
      <div style="margin-top: 40px;">
        <div style="margin-bottom: 10px;">${t("With highest regard", "En derin saygılarımla")},</div>
        <div style="margin-top: 50px;">
          <div style="font-weight: 700; font-size: 16px;">${data.applicantName}</div>
          ${data.applicantTitle ? `<div style="font-size: 13px; font-style: italic; margin-top: 3px; color: #666;">${data.applicantTitle}</div>` : ""}
        </div>
      </div>
    </div>
  `;
}
