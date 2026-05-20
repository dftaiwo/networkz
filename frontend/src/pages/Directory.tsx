import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { api } from "../api/client";
import type { ProfileListResponse, Reference } from "../lib/types";
import { ProfileCard } from "../components/ProfileCard";
import { FilterBar, type Filters } from "../components/FilterBar";
import { Spinner } from "../components/Spinner";
import { EmptyState } from "../components/EmptyState";

const PAGE_SIZE = 24;

export default function Directory() {
  const [params, setParams] = useSearchParams();
  const [reference, setReference] = useState<Reference | null>(null);
  const [data, setData] = useState<ProfileListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const filters: Filters = useMemo(
    () => ({
      q: params.get("q") || "",
      country: params.get("country") || "",
      year: params.get("year") || "",
      industry: params.get("industry") || "",
    }),
    [params]
  );
  const page = Math.max(1, parseInt(params.get("page") || "1", 10));

  useEffect(() => {
    api.get<Reference>("/reference", { auth: false }).then(setReference).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (filters.q) qs.set("q", filters.q);
    if (filters.country) qs.set("country", filters.country);
    if (filters.year) qs.set("year", filters.year);
    if (filters.industry) qs.set("industry", filters.industry);
    qs.set("page", String(page));
    qs.set("page_size", String(PAGE_SIZE));

    api
      .get<ProfileListResponse>(`/profiles?${qs.toString()}`)
      .then(setData)
      .catch(() => setData({ items: [], total: 0, page, page_size: PAGE_SIZE }))
      .finally(() => setLoading(false));
  }, [filters.q, filters.country, filters.year, filters.industry, page]);

  function updateFilters(next: Filters) {
    const np = new URLSearchParams();
    if (next.q) np.set("q", next.q);
    if (next.country) np.set("country", next.country);
    if (next.year) np.set("year", next.year);
    if (next.industry) np.set("industry", next.industry);
    setParams(np);
  }

  function setPage(p: number) {
    const np = new URLSearchParams(params);
    if (p <= 1) np.delete("page");
    else np.set("page", String(p));
    setParams(np);
  }

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Alumni directory</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Browse startups that went through the Google for Startups Accelerator.
        </p>
      </div>

      <FilterBar reference={reference} value={filters} onChange={updateFilters} />

      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <div>{total > 0 ? `${total} startup${total === 1 ? "" : "s"}` : ""}</div>
        <div>{totalPages > 1 ? `Page ${page} of ${totalPages}` : ""}</div>
      </div>

      {loading && !data ? (
        <Spinner />
      ) : data?.items.length === 0 ? (
        <EmptyState
          title="No startups match those filters"
          description="Try removing a filter or searching for something broader."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((p) => (
            <ProfileCard key={p.id} profile={p} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            className="btn-ghost text-xs disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>
          <button
            className="btn-ghost text-xs disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
