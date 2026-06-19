"use client";

import { useCallback, useState } from "react";
import { DownloadButton } from "@/components/DownloadButton";
import { FileUpload } from "@/components/FileUpload";
import { TextPreview } from "@/components/TextPreview";
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
  buildRestoredFileName,
  downloadBinaryFile,
  downloadTextFile,
} from "@/lib/download";
import { deanonymizeText, parseMappingFile, type MappingFile } from "@/lib/mapping";

/**
 * Restore original values from anonymized documents using a mapping JSON file.
 */
export function DeanonymizePanel() {
  const [processedText, setProcessedText] = useState<string | null>(null);
  const [processedFileName, setProcessedFileName] = useState<string | null>(null);
  const [processedFormat, setProcessedFormat] = useState<DocumentFormat | null>(
    null,
  );
  const [processedArtifact, setProcessedArtifact] = useState<DocumentArtifact | null>(
    null,
  );
  const [mappingFile, setMappingFile] = useState<MappingFile | null>(null);
  const [mappingFileName, setMappingFileName] = useState<string | null>(null);
  const [restoredText, setRestoredText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const tryRestoreText = useCallback(
    (
      text: string,
      mapping: MappingFile,
      fileName: string,
      format: DocumentFormat,
      artifact: DocumentArtifact | null,
    ) => {
      try {
        const restored = deanonymizeText(text, mapping);
        setRestoredText(restored);
        setProcessedText(text);
        setProcessedFileName(fileName);
        setProcessedFormat(format);
        setProcessedArtifact(artifact);
        setMappingFile(mapping);
        setError(null);
      } catch (caught) {
        setRestoredText(null);
        setError(
          caught instanceof Error
            ? caught.message
            : "Failed to de-anonymize the document.",
        );
      }
    },
    [],
  );

  const handleProcessedFile = useCallback(
    async (file: File) => {
      setError(null);
      setRestoredText(null);

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
        const { extracted, artifact } = await extractDocument(file);

        if (mappingFile) {
          tryRestoreText(
            extracted.text,
            mappingFile,
            file.name,
            extracted.format,
            artifact,
          );
        } else {
          setProcessedText(extracted.text);
          setProcessedFileName(file.name);
          setProcessedFormat(extracted.format);
          setProcessedArtifact(artifact);
        }
      } catch (caught) {
        setError(
          caught instanceof DocumentProcessingError || caught instanceof Error
            ? caught.message
            : "Could not read the processed document.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [mappingFile, tryRestoreText],
  );

  const handleMappingFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!file.name.toLowerCase().endsWith(".json")) {
        setError("Mapping file must be a .json document.");
        return;
      }

      if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
        setError("Mapping file exceeds the 10 MB limit.");
        return;
      }

      try {
        const content = await file.text();
        const mapping = parseMappingFile(content);
        setMappingFile(mapping);
        setMappingFileName(file.name);

        if (processedText && processedFileName && processedFormat) {
          tryRestoreText(
            processedText,
            mapping,
            processedFileName,
            processedFormat,
            processedArtifact,
          );
        }
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Invalid mapping JSON file.",
        );
      }
    },
    [
      processedArtifact,
      processedFileName,
      processedFormat,
      processedText,
      tryRestoreText,
    ],
  );

  const handleDownload = useCallback(async () => {
    if (!restoredText || !processedFileName || !processedFormat || !mappingFile) {
      return;
    }

    const outputName = buildRestoredFileName(processedFileName);

    if (processedFormat === "txt") {
      downloadTextFile(restoredText, outputName);
      return;
    }

    if (!processedArtifact) {
      setError("Processed document data is missing. Please upload the file again.");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const bytes = await rebuildFromArtifact(
        processedArtifact,
        mappingFile.entries,
        "deanonymize",
      );
      downloadBinaryFile(bytes, outputName, processedFormat);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Failed to export the restored document.",
      );
    } finally {
      setIsExporting(false);
    }
  }, [
    mappingFile,
    processedArtifact,
    processedFileName,
    processedFormat,
    restoredText,
  ]);

  const exportLabel =
    processedFormat === "txt"
      ? "Download restored .txt"
      : `Download restored .${processedFormat ?? "txt"}`;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Upload the anonymized document (.txt, .pdf, or .docx) and the mapping
        JSON generated during anonymization to restore original values.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <FileUpload
          inputId="processed-upload"
          accept={SUPPORTED_FILE_ACCEPT}
          label="Drop the anonymized document"
          hint={SUPPORTED_FORMATS_HINT}
          onFileSelect={handleProcessedFile}
          disabled={isLoading || isExporting}
        />
        <FileUpload
          inputId="mapping-upload"
          accept=".json,application/json"
          label="Drop the mapping .json file"
          hint="JSON mapping from anonymization"
          onFileSelect={handleMappingFile}
          disabled={isLoading || isExporting}
        />
      </div>

      {(processedFileName || mappingFileName) && (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          {processedFileName && processedFormat && (
            <p>
              <span className="font-semibold text-slate-800">Document:</span>{" "}
              {processedFileName} ({formatLabel(processedFormat)})
            </p>
          )}
          {mappingFileName && (
            <p>
              <span className="font-semibold text-slate-800">Mapping:</span>{" "}
              {mappingFileName}
            </p>
          )}
        </div>
      )}

      {isLoading && (
        <p className="text-sm font-medium text-indigo-600">
          Extracting text from document...
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

      {restoredText && processedText && (
        <>
          <TextPreview
            original={processedText}
            anonymized={restoredText}
            originalTitle="Processed text"
            anonymizedTitle="Restored text"
          />

          <div className="flex justify-end">
            <DownloadButton
              label={exportLabel}
              onClick={handleDownload}
              disabled={isExporting}
            />
          </div>
        </>
      )}

      {processedText && mappingFile && !restoredText && !error && (
        <p className="text-sm text-slate-500">
          Both files are loaded. Waiting for a valid mapping to restore text.
        </p>
      )}
    </div>
  );
}