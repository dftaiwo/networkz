import { useEffect, useState } from "react";
import type { Reference } from "../lib/types";

export type Filters = {
  q: string;
  country: string;
  year: string;
  industry: string;
};

export function FilterBar({
  reference,
  value,
  onChange,
}: {
  reference: Reference | null;
  value: Filters;
  onChange: (next: Filters) => void;
}) {
  // Debounce the free-text input so we don't fire a request per keystroke
  const [q, setQ] = useState(value.q);
  useEffect(() => setQ(value.q), [value.q]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (q !== value.q) onChange({ ...value, q });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="card p-4 md:p-5">
      <div className="grid gap-3 md:grid-cols-12">
        <div className="md:col-span-5">
          <label className="label">Search</label>
          <input
            className="input mt-1"
            placeholder="Search startups, founders, taglines…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="md:col-span-3">
          <label className="label">Country</label>
          <select
            className="input mt-1"
            value={value.country}
            onChange={(e) => onChange({ ...value, country: e.target.value })}
          >
            <option value="">All countries</option>
            {reference?.countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="label">Cohort</label>
          <select
            className="input mt-1"
            value={value.year}
            onChange={(e) => onChange({ ...value, year: e.target.value })}
          >
            <option value="">Any year</option>
            {reference?.cohort_years.slice().reverse().map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="label">Industry</label>
          <select
            className="input mt-1"
            value={value.industry}
            onChange={(e) => onChange({ ...value, industry: e.target.value })}
          >
            <option value="">All industries</option>
            {reference?.industries.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>
      {(value.q || value.country || value.year || value.industry) && (
        <div className="mt-3 flex justify-end">
          <button
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline"
            onClick={() => onChange({ q: "", country: "", year: "", industry: "" })}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
