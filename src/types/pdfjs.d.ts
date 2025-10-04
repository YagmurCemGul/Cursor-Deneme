declare module 'pdfjs-dist' {
  export interface PDFWorkerOptions {
    workerSrc: string;
  }

  export interface GlobalWorkerOptions {
    workerSrc: string;
  }

  export const GlobalWorkerOptions: GlobalWorkerOptions;

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
    transform: number[];
    width: number;
    height: number;
    dir: string;
  }

  export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  export interface DocumentInitParameters {
    data?: ArrayBuffer | Uint8Array;
    url?: string;
    httpHeaders?: Record<string, string>;
    withCredentials?: boolean;
    password?: string;
    length?: number;
    range?: PDFDataRangeTransport;
    rangeChunkSize?: number;
    worker?: Worker;
    verbosity?: number;
    docBaseUrl?: string;
    cMapUrl?: string;
    cMapPacked?: boolean;
    CMapReaderFactory?: CMapReaderFactory;
    standardFontDataUrl?: string;
    StandardFontDataFactory?: StandardFontDataFactory;
    useWorkerFetch?: boolean;
    isEvalSupported?: boolean;
    disableFontFace?: boolean;
    fontExtraProperties?: boolean;
    pdfBug?: boolean;
    enableXfa?: boolean;
  }

  export function getDocument(src: DocumentInitParameters | string | URL | ArrayBuffer | Uint8Array): PDFDocumentLoadingTask;

  export interface PDFDataRangeTransport {
    length: number;
    initialData: Uint8Array;
    transport: IPDFStreamReader;
    progressiveDone: boolean;
  }

  export interface IPDFStreamReader {
    onProgress?: (loaded: number, total: number) => void;
    onProgressiveData?: (chunk: Uint8Array) => void;
    onDataLoaded?: () => void;
    read(): Promise<{ value: Uint8Array; done: boolean }>;
    cancel(reason: any): void;
  }

  export interface CMapReaderFactory {
    fetch(params: { name: string }): Promise<{ cMapData: Uint8Array; compressionType: number }>;
  }

  export interface StandardFontDataFactory {
    fetch(params: { filename: string }): Promise<Uint8Array>;
  }
}