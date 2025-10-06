// Google Drive API integration
import { ensureAuth } from "./auth";

export interface UploadOptions {
  fileName: string;
  mimeType: string;
  content: Blob | string;
  folderId?: string;
}

export async function uploadFile(options: UploadOptions): Promise<string> {
  const token = await ensureAuth();

  // Create file metadata
  const metadata = {
    name: options.fileName,
    mimeType: options.mimeType,
    ...(options.folderId && { parents: [options.folderId] }),
  };

  // Prepare multipart upload
  const boundary = "-------314159265358979323846";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  let contentData: string;
  if (options.content instanceof Blob) {
    contentData = await options.content.text();
  } else {
    contentData = options.content;
  }

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${options.mimeType}\r\n\r\n` +
    contentData +
    closeDelimiter;

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Failed to upload file: ${error.error?.message || response.statusText}`);
  }

  const file = await response.json();
  return `https://drive.google.com/file/d/${file.id}/view`;
}

export async function uploadPDF(fileName: string, pdfBlob: Blob): Promise<string> {
  return uploadFile({
    fileName,
    mimeType: "application/pdf",
    content: pdfBlob,
  });
}

export async function uploadDOCX(fileName: string, docxBlob: Blob): Promise<string> {
  return uploadFile({
    fileName,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    content: docxBlob,
  });
}
