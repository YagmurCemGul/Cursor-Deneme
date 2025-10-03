// Type definitions for mammoth
declare module 'mammoth' {
  export interface ExtractRawTextOptions {
    arrayBuffer: ArrayBuffer;
  }

  export interface ExtractRawTextResult {
    value: string;
    messages: string[];
  }

  export function extractRawText(options: ExtractRawTextOptions): Promise<ExtractRawTextResult>;
}