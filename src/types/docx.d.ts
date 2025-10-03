// Type definitions for docx library
declare module 'docx' {
  export interface Document {
    sections: Section[];
  }

  export interface Section {
    properties: SectionProperties;
    children: Paragraph[];
  }

  export interface SectionProperties {
    page: PageProperties;
  }

  export interface PageProperties {
    margin: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  }

  export interface Paragraph {
    children: TextRun[];
  }

  export interface TextRun {
    text: string;
    bold?: boolean;
    italics?: boolean;
    underline?: UnderlineType;
    font?: string;
    size?: number;
  }

  export enum UnderlineType {
    SINGLE = 'single',
    DOUBLE = 'double',
    THICK = 'thick',
    DOTTED = 'dotted',
    DASHED = 'dashed',
  }

  export class DocumentCreator {
    constructor();
    create(): Document;
  }

  export class Packer {
    static toBuffer(document: Document): Promise<Buffer>;
  }
}