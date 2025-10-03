// Type definitions for mammoth
declare module 'mammoth' {
  export interface ExtractRawTextResult {
    value: string;
    messages: any[];
  }

  export interface ExtractRawTextOptions {
    arrayBuffer?: ArrayBuffer;
    buffer?: Buffer;
    path?: string;
  }

  export function extractRawText(options: ExtractRawTextOptions): Promise<ExtractRawTextResult>;
}