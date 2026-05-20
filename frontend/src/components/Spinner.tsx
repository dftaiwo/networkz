export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-slate-500 dark:text-slate-400 text-sm">
      <span className="inline-block h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-brand-600 animate-spin" />
      {label || "Loading…"}
    </div>
  );
}
