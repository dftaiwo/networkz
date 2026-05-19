import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { api } from "../api/client";
import type { ProfileOwnerView } from "../lib/types";
import { Spinner } from "../components/Spinner";

export default function Admin() {
  const [rows, setRows] = useState<ProfileOwnerView[] | null>(null);
  const [q, setQ] = useState("");

  async function load() {
    const data = await api.get<ProfileOwnerView[]>("/admin/profiles");
    setRows(data);
  }

  useEffect(() => { load().catch(() => setRows([])); }, []);

  async function hide(id: number) {
    await api.post(`/admin/profiles/${id}/hide`);
    toast.success("Hidden");
    load();
  }
  async function unhide(id: number) {
    await api.post(`/admin/profiles/${id}/unhide`);
    toast.success("Restored");
    load();
  }
  async function remove(id: number) {
    if (!confirm("Permanently delete this profile?")) return;
    await api.del(`/admin/profiles/${id}`);
    toast.success("Deleted");
    load();
  }

  const filtered = useMemo(() => {
    if (!rows) return null;
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter(
      (r) =>
        r.startup_name.toLowerCase().includes(t) ||
        r.founder_name.toLowerCase().includes(t) ||
        (r.tagline || "").toLowerCase().includes(t)
    );
  }, [rows, q]);

  if (!filtered) return <Spinner />;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Moderation</h1>
          <p className="text-slate-600 mt-1">Hide spam profiles or restore them.</p>
        </div>
        <input
          className="input max-w-xs"
          placeholder="Filter…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Startup</th>
              <th className="px-4 py-3 font-semibold">Founder</th>
              <th className="px-4 py-3 font-semibold">Country</th>
              <th className="px-4 py-3 font-semibold">Year</th>
              <th className="px-4 py-3 font-semibold">Industry</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No profiles.</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <Link to={`/directory/${r.id}`} className="font-medium text-slate-900 hover:underline">
                    {r.startup_name || <span className="text-slate-400">(empty)</span>}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{r.founder_name}</td>
                <td className="px-4 py-3 text-slate-600">{r.country_name}</td>
                <td className="px-4 py-3 text-slate-600">{r.cohort_year || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{r.industry}</td>
                <td className="px-4 py-3">
                  {r.is_hidden
                    ? <span className="pill bg-rose-100 text-rose-700">Hidden</span>
                    : <span className="pill bg-accent-500/10 text-accent-600">Visible</span>}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {r.is_hidden ? (
                    <button onClick={() => unhide(r.id)} className="text-xs font-semibold text-brand-800 hover:underline">Restore</button>
                  ) : (
                    <button onClick={() => hide(r.id)} className="text-xs font-semibold text-slate-700 hover:underline">Hide</button>
                  )}
                  <button onClick={() => remove(r.id)} className="text-xs font-semibold text-rose-700 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
