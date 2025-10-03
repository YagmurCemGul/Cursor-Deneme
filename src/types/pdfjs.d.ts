declare module 'pdfjs-dist' {
  export interface TextItem { str: string }
  export interface TextContent { items: TextItem[] }
  export interface PDFPageProxy { getTextContent(): Promise<TextContent> }
  export interface PDFDocumentProxy { numPages: number; getPage(pageNumber: number): Promise<PDFPageProxy> }
  export interface GetDocumentParams { url?: string; data?: ArrayBuffer | Uint8Array }
  export const GlobalWorkerOptions: { workerSrc?: string }
  export function getDocument(params: GetDocumentParams): { promise: Promise<PDFDocumentProxy> }
}

declare module 'pdfjs-dist/build/pdf.worker.min.js' {
  const workerUrl: string;
  export default workerUrl;
}
