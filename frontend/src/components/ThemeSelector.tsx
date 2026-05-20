import { useEffect, useRef, useState } from "react";
import { useTheme, Theme } from "./ThemeContext";

export function ThemeSelector({ size = "md" }: { size?: "sm" | "md" }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderThemeIcon = (t: Theme) => {
    switch (t) {
      case "light":
        return (
          <svg className="h-4 w-4 text-amber-500 transition-transform group-hover:rotate-45 duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
          </svg>
        );
      case "dark":
        return (
          <svg className="h-4 w-4 text-indigo-500 dark:text-indigo-400 transition-transform group-hover:-rotate-12 duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
          </svg>
        );
      case "system":
        return (
          <svg className="h-4 w-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>
          </svg>
        );
    }
  };

  const btnCls = size === "sm"
    ? "group flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200 focus:outline-none"
    : "group flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200 focus:outline-none";

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={btnCls}
        title="Choose theme"
        aria-label="Choose theme"
      >
        {renderThemeIcon(theme)}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-xl bg-white dark:bg-slate-900 p-1.5 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50 backdrop-blur-md bg-white/95 dark:bg-slate-900/95">
          {(["light", "dark", "system"] as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTheme(t);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                theme === t
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="opacity-80 group-hover:opacity-100 transition-opacity">
                {renderThemeIcon(t)}
              </span>
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
