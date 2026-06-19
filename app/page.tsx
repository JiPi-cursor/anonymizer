"use client";

import { useCallback, useState } from "react";
import { DownloadButton } from "@/components/DownloadButton";
import { FileUpload } from "@/components/FileUpload";
import { StatsBar } from "@/components/StatsBar";
import { TextPreview } from "@/components/TextPreview";
import { anonymizeText, type AnonymizeResult } from "@/lib/anonymize";
import { buildAnonymizedFileName, downloadTextFile } from "@/lib/download";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export default function Home() {
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
      setError("Only .txt files are supported in v1.");
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

      const anonymized = anonymizeText(text);
      setResult(anonymized);
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

  const handleDownload = useCallback(() => {
    if (!result || !fileName) {
      return;
    }

    downloadTextFile(result.anonymized, buildAnonymizedFileName(fileName));
  }, [fileName, result]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Document Anonymizer
          </h1>
          <p className="max-w-2xl text-sm text-slate-600">
            Upload a text file to automatically detect and mask personal
            information. All processing happens locally in your browser.
          </p>
        </header>

        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Regex-based detection may miss context-dependent PII or produce false
          positives. Review the anonymized output before sharing sensitive
          documents.
        </div>

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
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{fileName}</span>
                <span className="mx-2 text-slate-300">·</span>
                {formatFileSize(fileSize)}
                <span className="mx-2 text-slate-300">·</span>
                {result.stats.total} redaction
                {result.stats.total === 1 ? "" : "s"}
              </div>
              <DownloadButton onClick={handleDownload} />
            </div>

            <StatsBar stats={result.stats} />
            <TextPreview
              original={result.original}
              anonymized={result.anonymized}
            />

            <div className="flex justify-end">
              <DownloadButton onClick={handleDownload} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}