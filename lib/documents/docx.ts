import JSZip from "jszip";
import { DocumentProcessingError } from "./errors";
import { applyReplacements } from "./replace";
import type { Replacement } from "./types";

const TEXT_NODE_PATTERN = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g;

/**
 * Extract visible text from DOCX XML, preserving paragraph breaks.
 */
export function extractTextFromDocumentXml(xml: string): string {
  const paragraphs = xml.split(/<\/w:p>/);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const parts: string[] = [];
    const pattern = new RegExp(TEXT_NODE_PATTERN.source, TEXT_NODE_PATTERN.flags);
    let match = pattern.exec(paragraph);

    while (match !== null) {
      parts.push(decodeXmlEntities(match[1]));
      match = pattern.exec(paragraph);
    }

    if (parts.length > 0) {
      lines.push(parts.join(""));
    }
  }

  return lines.join("\n").trim();
}

/** Replace text only inside Word `<w:t>` nodes so formatting is preserved. */
export function replaceInDocumentXml(xml: string, replacements: Replacement[]): string {
  return xml.replace(TEXT_NODE_PATTERN, (fullMatch, textContent: string) => {
    const openTag = fullMatch.slice(0, fullMatch.indexOf(">") + 1);
    const replaced = applyReplacements(decodeXmlEntities(textContent), replacements);
    return `${openTag}${encodeXmlEntities(replaced)}</w:t>`;
  });
}

/** Extract text from a DOCX archive. */
export async function extractDocxText(bytes: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(bytes);
  const documentXml = await zip.file("word/document.xml")?.async("text");

  if (!documentXml) {
    throw new DocumentProcessingError(
      "Could not find document content. The DOCX file may be corrupted.",
      "docx",
    );
  }

  const text = extractTextFromDocumentXml(documentXml);

  if (!text.trim()) {
    throw new DocumentProcessingError(
      "No readable text was found in the DOCX file.",
      "docx",
    );
  }

  return text;
}

/** Apply mapping replacements and return a new DOCX archive. */
export async function rebuildDocx(
  bytes: Uint8Array,
  replacements: Replacement[],
): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(bytes);
  const documentEntry = zip.file("word/document.xml");

  if (!documentEntry) {
    throw new DocumentProcessingError(
      "Could not update the DOCX file because document.xml is missing.",
      "docx",
    );
  }

  const xml = await documentEntry.async("text");
  const updatedXml = replaceInDocumentXml(xml, replacements);
  zip.file("word/document.xml", updatedXml);

  return zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
  });
}

function decodeXmlEntities(value: string): string {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function encodeXmlEntities(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}