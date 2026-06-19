/**
 * Trigger a browser download for anonymized text content.
 */
export function downloadTextFile(content: string, fileName: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
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

/**
 * Build a download filename from the original upload name.
 */
export function buildAnonymizedFileName(originalName: string): string {
  const baseName = originalName.replace(/\.txt$/i, "");
  return `anonymized-${baseName}.txt`;
}