import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { DocumentProcessingError } from "./errors";
import { applyReplacements } from "./replace";
import type { PdfPageLayout, PdfTextItem, Replacement } from "./types";

let pdfJsModule: typeof import("pdfjs-dist") | null = null;

/** Lazy-load PDF.js in the browser and configure its worker once. */
async function getPdfJs() {
  if (pdfJsModule) {
    return pdfJsModule;
  }

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  pdfJsModule = pdfjs;
  return pdfjs;
}

/** Extract text and layout metadata from a PDF. */
export async function extractPdfContent(
  bytes: Uint8Array,
): Promise<{ text: string; pages: PdfPageLayout[] }> {
  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({ data: bytes.slice() });

  let pdf;
  try {
    pdf = await loadingTask.promise;
  } catch {
    throw new DocumentProcessingError(
      "Could not open the PDF. The file may be encrypted or corrupted.",
      "pdf",
    );
  }

  const pages: PdfPageLayout[] = [];
  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();
    const items: PdfTextItem[] = [];

    for (const rawItem of textContent.items) {
      if (!("str" in rawItem)) {
        continue;
      }

      const text = rawItem.str;
      if (!text) {
        continue;
      }

      const transform = rawItem.transform;
      const fontSize = Math.max(
        Math.hypot(transform[0], transform[1]),
        Math.hypot(transform[2], transform[3]),
        8,
      );

      items.push({
        text,
        x: transform[4],
        y: transform[5],
        width: rawItem.width ?? text.length * fontSize * 0.55,
        height: rawItem.height ?? fontSize,
        fontSize,
      });
    }

    const pageText = items.map((item) => item.text).join(" ").trim();
    pages.push({
      pageIndex: pageNumber - 1,
      pageWidth: viewport.width,
      pageHeight: viewport.height,
      items,
    });
    pageTexts.push(pageText);
  }

  const text = pageTexts.filter(Boolean).join("\n\n").trim();

  if (!text) {
    throw new DocumentProcessingError(
      "No extractable text was found in the PDF. It may be image-only.",
      "pdf",
    );
  }

  return { text, pages };
}

/**
 * Overlay anonymized text on top of the original PDF pages.
 * White rectangles mask the original glyphs before redraw.
 */
export async function rebuildPdf(
  bytes: Uint8Array,
  pages: PdfPageLayout[],
  replacements: Replacement[],
): Promise<Uint8Array> {
  let pdfDoc: PDFDocument;

  try {
    pdfDoc = await PDFDocument.load(bytes);
  } catch {
    throw new DocumentProcessingError(
      "Could not load the PDF for export.",
      "pdf",
    );
  }

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pdfPages = pdfDoc.getPages();

  for (const pageLayout of pages) {
    const page = pdfPages[pageLayout.pageIndex];
    if (!page) {
      continue;
    }

    for (const item of pageLayout.items) {
      const nextText = applyReplacements(item.text, replacements);
      if (nextText === item.text) {
        continue;
      }

      const baselineY = item.y;
      const rectY = baselineY - item.height * 0.15;
      const rectHeight = Math.max(item.height * 1.25, item.fontSize * 1.2);
      const rectWidth = Math.max(item.width, nextText.length * item.fontSize * 0.55);

      page.drawRectangle({
        x: item.x - 1,
        y: rectY,
        width: rectWidth + 2,
        height: rectHeight,
        color: rgb(1, 1, 1),
        borderWidth: 0,
      });

      page.drawText(nextText, {
        x: item.x,
        y: baselineY,
        size: Math.min(item.fontSize, 12),
        font,
        color: rgb(0, 0, 0),
      });
    }
  }

  return pdfDoc.save();
}