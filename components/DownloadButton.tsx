"use client";

interface DownloadButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  variant?: "primary" | "secondary";
}

/**
 * Download action button with configurable label and style.
 */
export function DownloadButton({
  onClick,
  disabled = false,
  label,
  variant = "primary",
}: DownloadButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 disabled:bg-slate-300"
      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-slate-400 disabled:bg-slate-100";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${styles}`}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
        />
      </svg>
      {label}
    </button>
  );
}