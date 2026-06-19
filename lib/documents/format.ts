import type { DocumentFormat } from "./types";

const EXTENSIONS: Record<DocumentFormat, string> = {
  txt: ".txt",
  pdf: ".pdf",
  docx: ".docx",
};

const MIME_TYPES: Record<DocumentFormat, string> = {
  txt: "text/plain",
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/** Detect format from a file name. */
export function detectFormat(fileName: string): DocumentFormat | null {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".txt")) {
    return "txt";
  }

  if (lower.endsWith(".pdf")) {
    return "pdf";
  }

  if (lower.endsWith(".docx")) {
    return "docx";
  }

  return null;
}

/** Human-readable labels for UI copy. */
export function formatLabel(format: DocumentFormat): string {
  return format.toUpperCase();
}

/** Build a download filename from the original upload name. */
export function buildAnonymizedFileName(originalName: string): string {
  const format = detectFormat(originalName) ?? "txt";
  return `anonymized-${stripExtension(originalName)}${extensionFor(format)}`;
}

function stripExtension(fileName: string): string {
  return fileName.replace(/\.(txt|pdf|docx)$/i, "");
}

export function extensionFor(format: DocumentFormat): string {
  return EXTENSIONS[format];
}

export function mimeTypeFor(format: DocumentFormat): string {
  return MIME_TYPES[format];
}

/** File picker accept attribute covering all supported formats. */
export const SUPPORTED_FILE_ACCEPT =
  ".txt,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const SUPPORTED_FORMATS_HINT = "TXT, PDF, and DOCX up to 10 MB";

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;