// Gmail API integration
import { ensureAuth } from "./auth";

export interface DraftOptions {
  to: string;
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    mimeType: string;
    data: string; // Base64 encoded
  }>;
}

function createMimeMessage(options: DraftOptions): string {
  const boundary = "boundary_" + Date.now();
  
  let message = [
    `To: ${options.to}`,
    `Subject: ${options.subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: quoted-printable",
    "",
    options.body,
  ].join("\r\n");

  // Add attachments
  if (options.attachments && options.attachments.length > 0) {
    for (const attachment of options.attachments) {
      message += [
        "",
        `--${boundary}`,
        `Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`,
        "Content-Transfer-Encoding: base64",
        `Content-Disposition: attachment; filename="${attachment.filename}"`,
        "",
        attachment.data,
      ].join("\r\n");
    }
  }

  message += `\r\n--${boundary}--`;

  return message;
}

function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function createDraft(options: DraftOptions): Promise<string> {
  const token = await ensureAuth();

  const mimeMessage = createMimeMessage(options);
  const encodedMessage = base64UrlEncode(mimeMessage);

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        raw: encodedMessage,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Failed to create draft: ${error.error?.message || response.statusText}`);
  }

  const draft = await response.json();
  return `https://mail.google.com/mail/u/0/#drafts?compose=${draft.id}`;
}

export async function createApplicationDraft(
  recipientEmail: string,
  company: string,
  position: string,
  coverLetterHtml: string,
  cvPdfBase64?: string
): Promise<string> {
  const attachments = cvPdfBase64
    ? [
        {
          filename: `CV_${company}_${position}.pdf`.replace(/\s+/g, "_"),
          mimeType: "application/pdf",
          data: cvPdfBase64,
        },
      ]
    : [];

  return createDraft({
    to: recipientEmail,
    subject: `Application for ${position} at ${company}`,
    body: coverLetterHtml,
    attachments,
  });
}
