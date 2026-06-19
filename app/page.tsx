"use client";

import { useState } from "react";
import { AnonymizePanel } from "@/components/AnonymizePanel";
import { DeanonymizePanel } from "@/components/DeanonymizePanel";
import { ModeTabs, type AppMode } from "@/components/ModeTabs";

export default function Home() {
  const [mode, setMode] = useState<AppMode>("anonymize");

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Document Anonymizer
            </h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Detect and replace personal data with numbered tags, export a
              reversible mapping file, and restore values later. All processing
              runs locally in your browser.
            </p>
          </div>
          <ModeTabs mode={mode} onChange={setMode} />
        </header>

        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {mode === "anonymize" ? (
            <>
              Regex-based detection may miss context-dependent PII or produce
              false positives. Keep the mapping JSON secure — it contains the
              original values.
            </>
          ) : (
            <>
              De-anonymization requires the exact mapping JSON produced during
              anonymization. Never share the mapping file with untrusted parties.
            </>
          )}
        </div>

        {mode === "anonymize" ? <AnonymizePanel /> : <DeanonymizePanel />}
      </div>
    </div>
  );
}