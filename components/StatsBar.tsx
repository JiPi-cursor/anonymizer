import type { AnonymizeStats, PiiType } from "@/lib/anonymize";

interface StatsBarProps {
  stats: AnonymizeStats;
}

const TYPE_LABELS: Record<PiiType, string> = {
  ssn: "SSNs",
  email: "emails",
  phone: "phones",
  dateOfBirth: "dates of birth",
  address: "addresses",
  name: "names",
};

/**
 * Summarize how many items were redacted, grouped by PII type.
 */
export function StatsBar({ stats }: StatsBarProps) {
  const entries = (Object.entries(stats.byType) as [PiiType, number][]).filter(
    ([, count]) => count > 0,
  );

  if (stats.total === 0) {
    return (
      <p className="text-sm text-slate-500">
        No personal information detected.
      </p>
    );
  }

  return (
    <p className="text-sm text-slate-600">
      <span className="font-semibold text-slate-800">
        {stats.total} item{stats.total === 1 ? "" : "s"} redacted:
      </span>{" "}
      {entries
        .map(([type, count]) => `${count} ${TYPE_LABELS[type]}`)
        .join(" · ")}
    </p>
  );
}