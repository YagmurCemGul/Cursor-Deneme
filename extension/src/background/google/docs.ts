// Google Docs API integration
import { ensureAuth } from "./auth";

export interface DocCreateOptions {
  title: string;
  content: string; // HTML content
}

export async function createDoc(options: DocCreateOptions): Promise<string> {
  const token = await ensureAuth();

  // Create empty document
  const createResponse = await fetch("https://docs.googleapis.com/v1/documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: options.title,
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.json().catch(() => ({}));
    throw new Error(`Failed to create document: ${error.error?.message || createResponse.statusText}`);
  }

  const doc = await createResponse.json();
  const documentId = doc.documentId;

  // Insert content
  await insertContent(documentId, options.content, token);

  return `https://docs.google.com/document/d/${documentId}/edit`;
}

async function insertContent(documentId: string, htmlContent: string, token: string): Promise<void> {
  // Convert HTML to plain text (simplified - real impl would preserve formatting)
  const plainText = htmlContent
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

  const requests = [
    {
      insertText: {
        location: { index: 1 },
        text: plainText,
      },
    },
  ];

  const response = await fetch(
    `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Failed to insert content: ${error.error?.message || response.statusText}`);
  }
}

export async function exportCV(title: string, htmlContent: string): Promise<string> {
  return createDoc({ title, content: htmlContent });
}

export async function exportCoverLetter(title: string, htmlContent: string): Promise<string> {
  return createDoc({ title, content: htmlContent });
}
