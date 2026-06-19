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

/** Build a download filename from the original upload name. */
export function buildAnonymizedFileName(originalName: string): string {
  const baseName = originalName.replace(/\.txt$/i, "");
  return `anonymized-${baseName}.txt`;
}

/** Build a mapping filename from the original upload name. */
export function buildMappingFileName(originalName: string): string {
  const baseName = originalName.replace(/\.txt$/i, "");
  return `mapping-${baseName}.json`;
}

/** Build a restored filename from the processed upload name. */
export function buildRestoredFileName(originalName: string): string {
  const baseName = originalName.replace(/\.txt$/i, "");
  return `restored-${baseName}.txt`;
}