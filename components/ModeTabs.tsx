"use client";

export type AppMode = "anonymize" | "deanonymize";

interface ModeTabsProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

/**
 * Switch between anonymize and de-anonymize workflows.
 */
export function ModeTabs({ mode, onChange }: ModeTabsProps) {
  const tabClass = (active: boolean) =>
    [
      "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
      active
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    ].join(" ");

  return (
    <div
      role="tablist"
      aria-label="Application mode"
      className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "anonymize"}
        className={tabClass(mode === "anonymize")}
        onClick={() => onChange("anonymize")}
      >
        Anonymize
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "deanonymize"}
        className={tabClass(mode === "deanonymize")}
        onClick={() => onChange("deanonymize")}
      >
        De-anonymize
      </button>
    </div>
  );
}