// Type definitions for pdfjs-dist
declare module 'pdfjs-dist' {
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }

  export interface TextContent {
    items: TextItem[];
  }

  export interface TextItem {
    str: string;
    dir?: string;
    transform?: number[];
  }

  export interface GetDocumentParams {
    data: ArrayBuffer;
    cMapUrl?: string;
    cMapPacked?: boolean;
  }

  export interface GlobalWorkerOptions {
    workerSrc: string;
  }

  export function getDocument(params: GetDocumentParams | string): {
    promise: Promise<PDFDocumentProxy>;
  };

  export const GlobalWorkerOptions: GlobalWorkerOptions;
}