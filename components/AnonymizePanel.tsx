"use client";

import { useCallback, useState } from "react";
import { DownloadButton } from "@/components/DownloadButton";
import { FileUpload } from "@/components/FileUpload";
import { MappingTable } from "@/components/MappingTable";
import { StatsBar } from "@/components/StatsBar";
import { TextPreview } from "@/components/TextPreview";
import { anonymizeText, type AnonymizeResult } from "@/lib/anonymize";
import {
  type DocumentArtifact,
  type DocumentFormat,
  DocumentProcessingError,
  extractDocument,
  formatLabel,
  MAX_DOCUMENT_SIZE_BYTES,
  rebuildFromArtifact,
  SUPPORTED_FILE_ACCEPT,
  SUPPORTED_FORMATS_HINT,
} from "@/lib/documents";
import {
  buildAnonymizedFileName,
  buildMappingFileName,
  downloadBinaryFile,
  downloadMappingFile,
  downloadTextFile,
} from "@/lib/download";
import { createMappingFile } from "@/lib/mapping";

/**
 * Upload, anonymize, preview, and export text plus mapping files.
 */
export function AnonymizePanel() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [documentFormat, setDocumentFormat] = useState<DocumentFormat | null>(
    null,
  );
  const [artifact, setArtifact] = useState<DocumentArtifact | null>(null);
  const [result, setResult] = useState<AnonymizeResult | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    setFileName(null);
    setFileSize(null);
    setDocumentFormat(null);
    setArtifact(null);
    setWarnings([]);

    if (file.size === 0) {
      setError("The selected file is empty.");
      return;
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      setError("File exceeds the 10 MB limit.");
      return;
    }

    setIsLoading(true);

    try {
      const { extracted, artifact: loadedArtifact } = await extractDocument(file);
      const anonymized = anonymizeText(extracted.text, file.name);

      setResult(anonymized);
      setArtifact(loadedArtifact);
      setDocumentFormat(extracted.format);
      setWarnings(extracted.warnings);
      setFileName(file.name);
      setFileSize(file.size);
    } catch (caught) {
      setError(
        caught instanceof DocumentProcessingError || caught instanceof Error
          ? caught.message
          : "Could not process the selected file.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDownloadOutput = useCallback(async () => {
    if (!result || !fileName || !documentFormat) {
      return;
    }

    const outputName = buildAnonymizedFileName(fileName);

    if (documentFormat === "txt") {
      downloadTextFile(result.anonymized, outputName);
      return;
    }

    if (!artifact) {
      setError("Source document data is missing. Please upload the file again.");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const bytes = await rebuildFromArtifact(
        artifact,
        result.mapping,
        "anonymize",
      );
      downloadBinaryFile(bytes, outputName, documentFormat);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Failed to export the anonymized document.",
      );
    } finally {
      setIsExporting(false);
    }
  }, [artifact, documentFormat, fileName, result]);

  const handleDownloadMapping = useCallback(() => {
    if (!result || !fileName) {
      return;
    }

    downloadMappingFile(
      createMappingFile(result.mapping, fileName),
      buildMappingFileName(fileName),
    );
  }, [fileName, result]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const exportLabel =
    documentFormat === "txt"
      ? "Download .txt"
      : `Download .${documentFormat ?? "txt"}`;

  return (
    <div className="space-y-4">
      <FileUpload
        onFileSelect={handleFileSelect}
        disabled={isLoading || isExporting}
        accept={SUPPORTED_FILE_ACCEPT}
        label="Drop a document here or click to browse"
        hint={SUPPORTED_FORMATS_HINT}
      />

      {isLoading && (
        <p className="text-sm font-medium text-indigo-600">
          Extracting text and anonymizing document...
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {warnings.length > 0 && result && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          {warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      )}

      {result && fileName && fileSize !== null && documentFormat && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{fileName}</span>
              <span className="mx-2 text-slate-300">·</span>
              {formatLabel(documentFormat)}
              <span className="mx-2 text-slate-300">·</span>
              {formatFileSize(fileSize)}
              <span className="mx-2 text-slate-300">·</span>
              {result.stats.total} redaction
              {result.stats.total === 1 ? "" : "s"}
              <span className="mx-2 text-slate-300">·</span>
              {result.mapping.length} unique tag
              {result.mapping.length === 1 ? "" : "s"}
            </div>
            <div className="flex flex-wrap gap-2">
              <DownloadButton
                label={exportLabel}
                onClick={handleDownloadOutput}
                disabled={isExporting}
              />
              <DownloadButton
                label="Download mapping .json"
                variant="secondary"
                onClick={handleDownloadMapping}
              />
            </div>
          </div>

          <StatsBar stats={result.stats} />
          <TextPreview
            original={result.original}
            anonymized={result.anonymized}
          />
          <MappingTable entries={result.mapping} />

          <div className="flex flex-wrap justify-end gap-2">
            <DownloadButton
              label={exportLabel}
              onClick={handleDownloadOutput}
              disabled={isExporting}
            />
            <DownloadButton
              label="Download mapping .json"
              variant="secondary"
              onClick={handleDownloadMapping}
            />
          </div>
        </>
      )}
    </div>
  );
}