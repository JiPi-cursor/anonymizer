interface TextPreviewProps {
  original: string;
  anonymized: string;
  originalTitle?: string;
  anonymizedTitle?: string;
}

/**
 * Side-by-side panels showing original and anonymized document text.
 */
export function TextPreview({
  original,
  anonymized,
  originalTitle = "Original",
  anonymizedTitle = "Anonymized",
}: TextPreviewProps) {
  return (
    <div className="grid min-h-[420px] grid-cols-1 gap-4 md:grid-cols-2">
      <PreviewPanel title={originalTitle} text={original} />
      <PreviewPanel title={anonymizedTitle} text={anonymized} accent />
    </div>
  );
}

interface PreviewPanelProps {
  title: string;
  text: string;
  accent?: boolean;
}

function PreviewPanel({ title, text, accent = false }: PreviewPanelProps) {
  return (
    <section className="flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header
        className={[
          "border-b px-4 py-3 text-sm font-semibold",
          accent
            ? "border-indigo-100 bg-indigo-50 text-indigo-900"
            : "border-slate-100 bg-slate-50 text-slate-800",
        ].join(" ")}
      >
        {title}
      </header>
      <pre className="flex-1 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-sm leading-relaxed text-slate-800">
        {text || (
          <span className="text-slate-400">No content to display.</span>
        )}
      </pre>
    </section>
  );
}