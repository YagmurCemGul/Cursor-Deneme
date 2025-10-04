declare module 'docx' {
  export class Document {
    constructor(options?: DocumentOptions);
  }

  export interface DocumentOptions {
    sections?: SectionOptions[];
    creator?: string;
    title?: string;
    description?: string;
    styles?: {
      default?: {
        heading1?: IRunOptions;
        heading2?: IRunOptions;
        heading3?: IRunOptions;
        document?: IRunOptions;
      };
      paragraphStyles?: IParagraphStyleOptions[];
    };
  }

  export interface SectionOptions {
    properties?: ISectionPropertiesOptions;
    children: (Paragraph | Table)[];
  }

  export interface ISectionPropertiesOptions {
    page?: IPageSizeAttributes;
    margin?: IPageMarginAttributes;
  }

  export interface IPageSizeAttributes {
    width?: number;
    height?: number;
    orientation?: PageOrientation;
  }

  export interface IPageMarginAttributes {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  }

  export enum PageOrientation {
    PORTRAIT = "portrait",
    LANDSCAPE = "landscape"
  }

  export class Paragraph {
    constructor(options?: string | IParagraphOptions);
  }

  export interface IParagraphOptions {
    text?: string;
    children?: ParagraphChild[];
    heading?: HeadingLevel;
    spacing?: ISpacingProperties;
    alignment?: AlignmentType;
    bullet?: {
      level?: number;
    };
  }

  export type ParagraphChild = TextRun | ExternalHyperlink;

  export interface ISpacingProperties {
    before?: number;
    after?: number;
    line?: number;
    lineRule?: LineRuleType;
  }

  export enum LineRuleType {
    AUTO = "auto",
    AT_LEAST = "atLeast",
    EXACTLY = "exactly"
  }

  export enum AlignmentType {
    START = "start",
    CENTER = "center",
    END = "end",
    JUSTIFIED = "justified",
    LEFT = "left",
    RIGHT = "right"
  }

  export enum HeadingLevel {
    HEADING_1 = "Heading1",
    HEADING_2 = "Heading2",
    HEADING_3 = "Heading3",
    HEADING_4 = "Heading4",
    HEADING_5 = "Heading5",
    HEADING_6 = "Heading6"
  }

  export class TextRun {
    constructor(options: string | IRunOptions);
  }

  export interface IRunOptions {
    text?: string;
    bold?: boolean;
    italics?: boolean;
    underline?: UnderlineType;
    color?: string;
    size?: number;
    font?: string;
  }

  export interface UnderlineType {
    type?: string;
    color?: string;
  }

  export class ExternalHyperlink {
    constructor(options: IHyperlinkOptions);
  }

  export interface IHyperlinkOptions {
    link: string;
    children: TextRun[];
  }

  export class Table {
    constructor(options: ITableOptions);
  }

  export interface ITableOptions {
    rows: TableRow[];
    width?: ITableWidthProperties;
  }

  export interface ITableWidthProperties {
    size: number;
    type?: WidthType;
  }

  export enum WidthType {
    AUTO = "auto",
    DXA = "dxa",
    NIL = "nil",
    PERCENTAGE = "pct"
  }

  export class TableRow {
    constructor(options: ITableRowOptions);
  }

  export interface ITableRowOptions {
    children: TableCell[];
  }

  export class TableCell {
    constructor(options: ITableCellOptions);
  }

  export interface ITableCellOptions {
    children: Paragraph[];
    width?: ITableWidthProperties;
  }

  export interface IParagraphStyleOptions {
    id: string;
    name: string;
    basedOn?: string;
    next?: string;
    quickFormat?: boolean;
    run?: IRunOptions;
    paragraph?: IParagraphOptions;
  }

  export class Packer {
    static toBlob(doc: Document): Promise<Blob>;
    static toBuffer(doc: Document): Promise<Buffer>;
  }
}