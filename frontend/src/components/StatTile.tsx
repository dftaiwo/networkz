export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="card p-6">
      <div className="text-3xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-sm font-semibold text-slate-700">{label}</div>
      {hint && <div className="mt-2 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}
