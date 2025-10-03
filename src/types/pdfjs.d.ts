// Type definitions for pdfjs-dist
declare module 'pdfjs-dist' {
  export interface GlobalWorkerOptions {
    workerSrc: string;
  }

  export interface TextItem {
    str: string;
    dir: string;
    width: number;
    height: number;
    transform: number[];
    fontName: string;
    hasEOL?: boolean;
  }

  export interface TextMarkedContent {
    type: string;
  }

  export interface TextContent {
    items: (TextItem | TextMarkedContent)[];
    styles: Record<string, any>;
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
    getViewport(params: { scale: number }): any;
    render(params: any): any;
  }

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  export interface GetDocumentParameters {
    data?: ArrayBuffer | Uint8Array;
    url?: string;
    httpHeaders?: Record<string, string>;
    withCredentials?: boolean;
  }

  export function getDocument(params: GetDocumentParameters): PDFDocumentLoadingTask;

  export const GlobalWorkerOptions: GlobalWorkerOptions;
}

declare module 'pdfjs-dist/build/pdf.worker.min.js' {
  const workerSrc: string;
  export default workerSrc;
}