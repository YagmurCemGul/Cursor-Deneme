// Concise cover letter template - ultra-brief, bullet-point style
export interface CoverLetterData {
  applicantName: string;
  applicantEmail: string;
  companyName: string;
  position: string;
  content: string;
}

export function renderConciseCoverLetter(data: CoverLetterData, locale: string = "en"): string {
  const t = (en: string, tr: string) => (locale === "tr" ? tr : en);

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 35px; line-height: 1.6; color: #1a1a1a;">
      <!-- Header -->
      <div style="margin-bottom: 30px;">
        <div style="font-size: 22px; font-weight: 600; margin-bottom: 5px;">${data.applicantName}</div>
        <div style="font-size: 14px; color: #666;">${data.applicantEmail}</div>
      </div>

      <!-- Position Info -->
      <div style="margin-bottom: 25px; padding: 15px; background: #f8f9fa; border-left: 3px solid #3b82f6; border-radius: 4px;">
        <div style="font-weight: 600; margin-bottom: 3px;">${data.position}</div>
        <div style="font-size: 14px; color: #666;">${data.companyName}</div>
      </div>

      <!-- Content -->
      <div style="white-space: pre-line;">
        ${data.content}
      </div>

      <!-- Footer -->
      <div style="margin-top: 25px; font-size: 14px; color: #666;">
        ${t("Looking forward to discussing this opportunity.", "Bu fırsatı görüşmeyi dört gözle bekliyorum.")}
      </div>

      <div style="margin-top: 20px; font-weight: 600;">${data.applicantName}</div>
    </div>
  `;
}
