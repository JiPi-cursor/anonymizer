import type { DocumentFormat } from "@/lib/documents";
import { detectFormat, extensionFor, mimeTypeFor } from "@/lib/documents";
import type { MappingFile } from "@/lib/mapping";
import { serializeMappingFile } from "@/lib/mapping";

/**
 * Trigger a browser download for text content.
 */
export function downloadTextFile(content: string, fileName: string): void {
  downloadBlob(
    new Blob([content], { type: "text/plain;charset=utf-8" }),
    fileName,
  );
}

/**
 * Trigger a browser download for a binary document.
 */
export function downloadBinaryFile(
  bytes: Uint8Array,
  fileName: string,
  format: DocumentFormat,
): void {
  const copy = new Uint8Array(bytes);
  downloadBlob(new Blob([copy], { type: mimeTypeFor(format) }), fileName);
}

/**
 * Trigger a browser download for a mapping JSON file.
 */
export function downloadMappingFile(mapping: MappingFile, fileName: string): void {
  downloadBlob(
    new Blob([serializeMappingFile(mapping)], {
      type: "application/json;charset=utf-8",
    }),
    fileName,
  );
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();

  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function stripExtension(fileName: string): string {
  return fileName.replace(/\.(txt|pdf|docx)$/i, "");
}

/** Build a download filename from the original upload name. */
export function buildAnonymizedFileName(originalName: string): string {
  const format = detectFormat(originalName) ?? "txt";
  return `anonymized-${stripExtension(originalName)}${extensionFor(format)}`;
}

/** Build a mapping filename from the original upload name. */
export function buildMappingFileName(originalName: string): string {
  return `mapping-${stripExtension(originalName)}.json`;
}

/** Build a restored filename from the processed upload name. */
export function buildRestoredFileName(originalName: string): string {
  const format = detectFormat(originalName) ?? "txt";
  return `restored-${stripExtension(originalName)}${extensionFor(format)}`;
}