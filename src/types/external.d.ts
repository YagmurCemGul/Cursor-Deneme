declare module 'mammoth' {
  export function extractRawText(opts: { arrayBuffer: ArrayBuffer | Uint8Array }): Promise<{ value: string }>;
}
