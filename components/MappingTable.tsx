import type { MappingEntry } from "@/lib/mapping";

interface MappingTableProps {
  entries: MappingEntry[];
}

const TYPE_LABELS: Record<MappingEntry["type"], string> = {
  name: "Person",
  organization: "Organization",
  location: "Location",
  phone: "Phone",
  email: "Email",
  postalCode: "Postal code",
  siret: "SIRET",
  siren: "SIREN",
  iban: "IBAN",
  url: "URL",
  date: "Date",
  dateOfBirth: "DOB",
  identifier: "Identifier",
  ssn: "SSN",
  creditCard: "Card",
  address: "Address",
};

/**
 * Display tag ↔ original value correspondences from anonymization.
 */
export function MappingTable({ entries }: MappingTableProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
        Tag mapping ({entries.length} unique value
        {entries.length === 1 ? "" : "s"})
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-white text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Tag</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Original value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map((entry) => (
              <tr key={entry.tag} className="text-slate-700">
                <td className="px-4 py-3 font-mono text-indigo-700">
                  {entry.tag}
                </td>
                <td className="px-4 py-3">{TYPE_LABELS[entry.type]}</td>
                <td className="px-4 py-3 font-mono">{entry.original}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}