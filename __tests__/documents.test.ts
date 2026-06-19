import { describe, expect, it } from "vitest";
import {
  extractTextFromDocumentXml,
  replaceInDocumentXml,
} from "@/lib/documents/docx";
import { applyReplacements, buildReplacements } from "@/lib/documents/replace";
import {
  buildAnonymizedFileName,
  detectFormat,
} from "@/lib/documents/format";
import { buildAnonymizedFileName as downloadAnonymizedName } from "@/lib/download";

const SAMPLE_DOCX_XML = `
<w:document>
  <w:body>
    <w:p>
      <w:r><w:t>SIRET : </w:t></w:r>
      <w:r><w:t>123 456 789 00012</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>Contact : Jean-Pierre Dubois</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

describe("document helpers", () => {
  it("detects supported formats", () => {
    expect(detectFormat("report.txt")).toBe("txt");
    expect(detectFormat("report.PDF")).toBe("pdf");
    expect(detectFormat("report.docx")).toBe("docx");
    expect(detectFormat("report.xlsx")).toBeNull();
  });

  it("builds format-aware output names", () => {
    expect(buildAnonymizedFileName("sample.pdf")).toBe("anonymized-sample.pdf");
    expect(downloadAnonymizedName("sample.docx")).toBe(
      "anonymized-sample.docx",
    );
  });

  it("extracts DOCX text from document.xml", () => {
    const text = extractTextFromDocumentXml(SAMPLE_DOCX_XML);
    expect(text).toContain("SIRET : 123 456 789 00012");
    expect(text).toContain("Contact : Jean-Pierre Dubois");
  });

  it("replaces values inside DOCX text runs only", () => {
    const replacements = buildReplacements(
      [
        {
          tag: "[SIRET_001]",
          type: "siret",
          original: "123 456 789 00012",
        },
        {
          tag: "[PER_001]",
          type: "name",
          original: "Jean-Pierre Dubois",
        },
      ],
      "anonymize",
    );

    const updated = replaceInDocumentXml(SAMPLE_DOCX_XML, replacements);

    expect(updated).toContain("<w:t>SIRET : </w:t>");
    expect(updated).toContain("<w:t>[SIRET_001]</w:t>");
    expect(updated).toContain("<w:t>Contact : [PER_001]</w:t>");
    expect(updated).not.toContain("Jean-Pierre Dubois");
  });

  it("applies ordered replacements sequentially", () => {
    const replacements = buildReplacements(
      [{ tag: "[PER_001]", type: "name", original: "Jean-Pierre Dubois" }],
      "anonymize",
    );
    const result = applyReplacements("Jean-Pierre Dubois", replacements);

    expect(result).toBe("[PER_001]");
  });
});