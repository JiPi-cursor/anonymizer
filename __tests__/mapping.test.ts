import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { anonymizeText } from "@/lib/anonymize";
import {
  createMappingFile,
  deanonymizeText,
  parseMappingFile,
} from "@/lib/mapping";

const SAMPLE_PATH = join(process.cwd(), "samples", "test1.txt");

describe("mapping and de-anonymization", () => {
  it("assigns sequential typed tags", () => {
    const result = anonymizeText("Email: a@test.com and phone 06 12 34 56 78");

    expect(result.anonymized).toMatch(/\[EMAIL_001\]/);
    expect(result.anonymized).toMatch(/\[TEL_001\]/);
    expect(result.mapping).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tag: "[EMAIL_001]", original: "a@test.com" }),
        expect.objectContaining({
          tag: "[TEL_001]",
          original: "06 12 34 56 78",
        }),
      ]),
    );
  });

  it("reuses the same tag for identical values", () => {
    const result = anonymizeText("Jean Dupont called Jean Dupont.");

    expect(result.anonymized).toBe("[PER_001] called [PER_001].");
    expect(result.mapping).toHaveLength(1);
  });

  it("round-trips samples/test1.txt through de-anonymization", () => {
    const original = readFileSync(SAMPLE_PATH, "utf-8");
    const result = anonymizeText(original, "test1.txt");
    const mapping = createMappingFile(result.mapping, "test1.txt");
    const restored = deanonymizeText(result.anonymized, mapping);

    expect(restored).toBe(original);
  });

  it("parses and validates mapping JSON", () => {
    const mapping = createMappingFile(
      [{ tag: "[PER_001]", type: "name", original: "Jean Dupont" }],
      "demo.txt",
    );

    const parsed = parseMappingFile(JSON.stringify(mapping));
    expect(parsed.entries).toHaveLength(1);
    expect(parsed.entries[0].tag).toBe("[PER_001]");
  });

  it("rejects invalid mapping files", () => {
    expect(() => parseMappingFile("{")).toThrow(/Invalid JSON/i);
    expect(() => parseMappingFile('{"entries":[]}')).not.toThrow();
  });
});