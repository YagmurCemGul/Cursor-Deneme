declare module 'mammoth' {
  export interface ConversionResult {
    value: string;
    messages: ConversionMessage[];
  }

  export interface ConversionMessage {
    type: string;
    message: string;
  }

  export interface ConversionOptions {
    convertImage?: ImageConverter;
    idPrefix?: string;
    ignoreEmptyParagraphs?: boolean;
    preserveEmptyParagraphs?: boolean;
    styleMap?: string[];
    includeDefaultStyleMap?: boolean;
  }

  export interface ImageConverter {
    (element: ImageElement): Promise<ImageConversionResult>;
  }

  export interface ImageElement {
    read: (encoding?: string) => Promise<Buffer>;
    contentType: string;
    altText?: string;
  }

  export interface ImageConversionResult {
    src: string;
  }

  export function convertToHtml(
    input: { arrayBuffer: ArrayBuffer } | { buffer: Buffer } | { path: string },
    options?: ConversionOptions
  ): Promise<ConversionResult>;

  export function extractRawText(
    input: { arrayBuffer: ArrayBuffer } | { buffer: Buffer } | { path: string }
  ): Promise<ConversionResult>;
}