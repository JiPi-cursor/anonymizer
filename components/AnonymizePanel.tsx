"use client";

import { useCallback, useState } from "react";
import { DownloadButton } from "@/components/DownloadButton";
import { FileUpload } from "@/components/FileUpload";
import { MappingTable } from "@/components/MappingTable";
import { StatsBar } from "@/components/StatsBar";
import { TextPreview } from "@/components/TextPreview";
import { anonymizeText, type AnonymizeResult } from "@/lib/anonymize";
import {
  buildAnonymizedFileName,
  buildMappingFileName,
  downloadMappingFile,
  downloadTextFile,
} from "@/lib/download";
import { createMappingFile } from "@/lib/mapping";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Upload, anonymize, preview, and export text plus mapping files.
 */
export function AnonymizePanel() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [result, setResult] = useState<AnonymizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    setResult(null);
    setFileName(null);
    setFileSize(null);

    if (!file.name.toLowerCase().endsWith(".txt")) {
      setError("Only .txt files are supported.");
      return;
    }

    if (file.size === 0) {
      setError("The selected file is empty.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("File exceeds the 5 MB limit.");
      return;
    }

    setIsLoading(true);

    const reader = new FileReader();

    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";

      if (!text.trim()) {
        setError("The selected file contains no readable text.");
        setIsLoading(false);
        return;
      }

      setResult(anonymizeText(text, file.name));
      setFileName(file.name);
      setFileSize(file.size);
      setIsLoading(false);
    };

    reader.onerror = () => {
      setError("Could not read the selected file.");
      setIsLoading(false);
    };

    reader.readAsText(file);
  }, []);

  const handleDownloadText = useCallback(() => {
    if (!result || !fileName) {
      return;
    }

    downloadTextFile(result.anonymized, buildAnonymizedFileName(fileName));
  }, [fileName, result]);

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

  return (
    <div className="space-y-4">
      <FileUpload onFileSelect={handleFileSelect} disabled={isLoading} />

      {isLoading && (
        <p className="text-sm font-medium text-indigo-600">
          Reading and anonymizing file...
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

      {result && fileName && fileSize !== null && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{fileName}</span>
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
                label="Download .txt"
                onClick={handleDownloadText}
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
            <DownloadButton label="Download .txt" onClick={handleDownloadText} />
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