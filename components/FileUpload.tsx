"use client";

import { useCallback, useRef, useState } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

/**
 * Drag-and-drop zone and file picker for .txt uploads.
 */
export function FileUpload({ onFileSelect, disabled = false }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);

      if (disabled) {
        return;
      }

      handleFile(event.dataTransfer.files[0]);
    },
    [disabled, handleFile],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFile(event.target.files?.[0]);
      event.target.value = "";
    },
    [handleFile],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload a text file"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
        isDragging
          ? "border-indigo-500 bg-indigo-50"
          : "border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50",
        disabled ? "pointer-events-none opacity-60" : "",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,text/plain"
        className="hidden"
        disabled={disabled}
        onChange={handleInputChange}
      />

      <svg
        className="mb-3 h-10 w-10 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>

      <p className="text-sm font-medium text-slate-700">
        Drop a .txt file here or click to browse
      </p>
      <p className="mt-1 text-xs text-slate-500">TXT files only in v1</p>
    </div>
  );
}