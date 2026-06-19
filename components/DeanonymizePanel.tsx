"use client";

import { useCallback, useState } from "react";
import { DownloadButton } from "@/components/DownloadButton";
import { FileUpload } from "@/components/FileUpload";
import { TextPreview } from "@/components/TextPreview";
import { buildRestoredFileName, downloadTextFile } from "@/lib/download";
import { deanonymizeText, parseMappingFile } from "@/lib/mapping";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Restore original values from anonymized text using a mapping JSON file.
 */
export function DeanonymizePanel() {
  const [processedText, setProcessedText] = useState<string | null>(null);
  const [processedFileName, setProcessedFileName] = useState<string | null>(null);
  const [mappingLoaded, setMappingLoaded] = useState(false);
  const [mappingFileName, setMappingFileName] = useState<string | null>(null);
  const [restoredText, setRestoredText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mappingJson, setMappingJson] = useState<string | null>(null);

  const readFile = useCallback(
    (file: File, onLoad: (content: string) => void) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError("File exceeds the 5 MB limit.");
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const content = typeof reader.result === "string" ? reader.result : "";
        onLoad(content);
      };

      reader.onerror = () => {
        setError("Could not read the selected file.");
      };

      reader.readAsText(file);
    },
    [],
  );

  const tryRestore = useCallback(
    (text: string, mappingRaw: string, textFileName: string | null) => {
      try {
        const mapping = parseMappingFile(mappingRaw);
        const restored = deanonymizeText(text, mapping);
        setRestoredText(restored);
        setError(null);
        setProcessedFileName(textFileName);
        setMappingLoaded(true);
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
    (file: File) => {
      setError(null);

      if (!file.name.toLowerCase().endsWith(".txt")) {
        setError("Processed file must be a .txt document.");
        return;
      }

      readFile(file, (content) => {
        if (!content.trim()) {
          setError("The processed file is empty.");
          return;
        }

        setProcessedText(content);
        setProcessedFileName(file.name);

        if (mappingJson) {
          tryRestore(content, mappingJson, file.name);
        }
      });
    },
    [mappingJson, readFile, tryRestore],
  );

  const handleMappingFile = useCallback(
    (file: File) => {
      setError(null);

      if (!file.name.toLowerCase().endsWith(".json")) {
        setError("Mapping file must be a .json document.");
        return;
      }

      readFile(file, (content) => {
        setMappingJson(content);
        setMappingFileName(file.name);

        if (processedText) {
          tryRestore(processedText, content, processedFileName);
        } else {
          setMappingLoaded(true);
        }
      });
    },
    [processedText, processedFileName, readFile, tryRestore],
  );

  const handleDownload = useCallback(() => {
    if (!restoredText || !processedFileName) {
      return;
    }

    downloadTextFile(
      restoredText,
      buildRestoredFileName(processedFileName),
    );
  }, [processedFileName, restoredText]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Upload the AI-processed text and the mapping JSON generated during
        anonymization to restore original values.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <FileUpload
          inputId="processed-upload"
          label="Drop the processed .txt file"
          hint="Anonymized or AI-edited text"
          onFileSelect={handleProcessedFile}
        />
        <FileUpload
          inputId="mapping-upload"
          accept=".json,application/json"
          label="Drop the mapping .json file"
          hint="JSON mapping from anonymization"
          onFileSelect={handleMappingFile}
        />
      </div>

      {(processedFileName || mappingFileName) && (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          {processedFileName && (
            <p>
              <span className="font-semibold text-slate-800">Text:</span>{" "}
              {processedFileName}
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
              label="Download restored .txt"
              onClick={handleDownload}
            />
          </div>
        </>
      )}

      {processedText && mappingLoaded && !restoredText && !error && (
        <p className="text-sm text-slate-500">
          Both files are loaded. Waiting for a valid mapping to restore text.
        </p>
      )}
    </div>
  );
}