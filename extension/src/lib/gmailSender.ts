/**
 * Gmail API Integration
 * Send emails with attachments using Gmail API
 */

import { getAuthToken } from './googleAuth';

interface GmailMessage {
  to: string;
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    mimeType: string;
    data: string; // base64 encoded
  }>;
}

/**
 * Convert HTML element to PDF blob
 */
async function htmlElementToPDFBlob(elementId: string): Promise<Blob> {
  const { default: html2canvas } = await import('html2canvas');
  const { default: jsPDF } = await import('jspdf');

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF({
    orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

  return pdf.output('blob');
}

/**
 * Convert blob to base64
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix
      const base64Content = base64.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Create Gmail message in RFC 2822 format with attachment
 */
function createGmailMessage(message: GmailMessage): string {
  const boundary = '==_mimepart_' + Date.now();
  const nl = '\r\n';
  
  let email = [
    `To: ${message.to}`,
    `Subject: ${message.subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    message.body,
    '',
  ].join(nl);

  // Add attachments
  if (message.attachments && message.attachments.length > 0) {
    for (const attachment of message.attachments) {
      email += [
        `--${boundary}`,
        `Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${attachment.filename}"`,
        '',
        attachment.data,
        '',
      ].join(nl);
    }
  }

  email += `--${boundary}--`;

  return email;
}

/**
 * Send email using Gmail API
 */
export async function sendEmailWithGmail(
  to: string,
  subject: string,
  body: string,
  cvElementId?: string,
  cvFilename?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Get auth token
    const token = await getAuthToken();

    // Prepare attachments
    const attachments: Array<{ filename: string; mimeType: string; data: string }> = [];

    if (cvElementId) {
      // Convert CV to PDF blob
      const pdfBlob = await htmlElementToPDFBlob(cvElementId);
      const base64Data = await blobToBase64(pdfBlob);
      
      attachments.push({
        filename: cvFilename || 'CV.pdf',
        mimeType: 'application/pdf',
        data: base64Data,
      });
    }

    // Create Gmail message
    const emailMessage = createGmailMessage({
      to,
      subject,
      body,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    // Encode message in base64url format
    const encodedMessage = btoa(emailMessage)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send using Gmail API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to send email');
    }

    const result = await response.json();
    
    return {
      success: true,
      messageId: result.id,
    };
  } catch (error: any) {
    console.error('Gmail send error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

/**
 * Open default email client (fallback method)
 */
export function openEmailClient(
  to: string,
  subject: string,
  body: string
): void {
  const mailtoLink = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink, '_blank');
}

/**
 * Check if Gmail send is available
 */
export async function isGmailSendAvailable(): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get(['google_auth_token', 'google_token_expiry']);
    const token = result.google_auth_token;
    const expiry = result.google_token_expiry;
    return !!(token && expiry && Date.now() < expiry);
  } catch {
    return false;
  }
}
