import { buildReplacements } from "./replace";
import { extractDocxText, rebuildDocx } from "./docx";
import { DocumentProcessingError } from "./errors";
import { detectFormat } from "./format";
import { extractPdfContent, rebuildPdf } from "./pdf";
import type { DocumentArtifact, ExtractedDocument } from "./types";
import type { MappingEntry } from "@/lib/mapping";

export {
  detectFormat,
  extensionFor,
  formatLabel,
  mimeTypeFor,
  MAX_DOCUMENT_SIZE_BYTES,
  SUPPORTED_FILE_ACCEPT,
  SUPPORTED_FORMATS_HINT,
} from "./format";
export { DocumentProcessingError } from "./errors";
export type {
  DocumentArtifact,
  DocumentFormat,
  ExtractedDocument,
} from "./types";

/** Read bytes from a browser File object. */
export async function readFileBytes(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

/** Extract plain text from TXT, PDF, or DOCX sources. */
export async function extractDocument(
  file: File,
): Promise<{ extracted: ExtractedDocument; artifact: DocumentArtifact }> {
  const format = detectFormat(file.name);

  if (!format) {
    throw new DocumentProcessingError(
      "Unsupported file type. Please upload a .txt, .pdf, or .docx file.",
    );
  }

  const bytes = await readFileBytes(file);
  const warnings: string[] = [];

  if (bytes.byteLength === 0) {
    throw new DocumentProcessingError("The selected file is empty.", format);
  }

  let text = "";

  if (format === "txt") {
    text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);

    if (!text.trim()) {
      throw new DocumentProcessingError(
        "The text file contains no readable content.",
        "txt",
      );
    }
  } else if (format === "pdf") {
    const pdfContent = await extractPdfContent(bytes);
    text = pdfContent.text;
    return {
      extracted: { format, text, warnings },
      artifact: {
        format,
        fileName: file.name,
        bytes,
        pdfItems: pdfContent.pages,
      },
    };
  } else {
    text = await extractDocxText(bytes);
    warnings.push(
      "DOCX formatting is preserved by updating text runs in place.",
    );
  }

  return {
    extracted: { format, text, warnings },
    artifact: {
      format,
      fileName: file.name,
      bytes,
    },
  };
}

/** Build an anonymized or restored binary document from an artifact. */
export async function rebuildFromArtifact(
  artifact: DocumentArtifact,
  mapping: MappingEntry[],
  mode: "anonymize" | "deanonymize",
): Promise<Uint8Array> {
  if (artifact.format === "txt") {
    throw new DocumentProcessingError(
      "Text exports are handled as plain text downloads.",
      "txt",
    );
  }

  if (artifact.format === "pdf") {
    if (!artifact.pdfItems) {
      throw new DocumentProcessingError(
        "PDF layout metadata is missing. Re-upload the source file.",
        "pdf",
      );
    }

    return rebuildPdf(
      artifact.bytes,
      artifact.pdfItems,
      buildReplacements(mapping, mode),
    );
  }

  return rebuildDocx(artifact.bytes, buildReplacements(mapping, mode));
}