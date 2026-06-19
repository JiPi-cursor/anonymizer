/** Supported upload and export formats. */
export type DocumentFormat = "txt" | "pdf" | "docx";

export interface Replacement {
  from: string;
  to: string;
}

/** Result of reading a source document. */
export interface ExtractedDocument {
  format: DocumentFormat;
  text: string;
  warnings: string[];
}

/** Payload kept in memory to rebuild binary exports. */
export interface DocumentArtifact {
  format: DocumentFormat;
  fileName: string;
  bytes: Uint8Array;
  pdfItems?: PdfPageLayout[];
}

/** Positioned PDF text fragment used to preserve layout. */
export interface PdfTextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
}

export interface PdfPageLayout {
  pageIndex: number;
  pageWidth: number;
  pageHeight: number;
  items: PdfTextItem[];
}

