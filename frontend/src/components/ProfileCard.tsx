import { Link } from "react-router-dom";
import type { Profile } from "../lib/types";
import { countryFlag, initials } from "../lib/flag";

export function ProfileCard({ profile }: { profile: Profile }) {
  const display = profile.startup_name || profile.founder_name || "?";

  return (
    <Link
      to={`/directory/${profile.id}`}
      className="card group block overflow-hidden transition hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Logo plate — preserves the logo's natural aspect ratio */}
      <LogoPlate profile={profile} display={display} />

      {/* Body */}
      <div className="p-6">
        <h3 className="truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          {profile.startup_name}
        </h3>
        <div className="truncate text-sm text-slate-600 dark:text-slate-400">{profile.founder_name}</div>

        {profile.tagline && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {profile.tagline}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="pill bg-brand-100 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300">{profile.industry}</span>
          <span className="pill bg-accent-500/10 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400">Class of {profile.cohort_year}</span>
        </div>
      </div>
    </Link>
  );
}

function LogoPlate({ profile, display }: { profile: Profile; display: string }) {
  return (
    <div className="relative aspect-[16/7] overflow-hidden border-b border-slate-100 dark:border-slate-800 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_50%,#eef2ff_100%)] dark:bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_50%,#1e1b4b_100%)]">
      {/* Subtle pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #3730A3 0, transparent 40%), radial-gradient(circle at 80% 70%, #10B981 0, transparent 40%)",
        }}
        aria-hidden
      />

      <div className="absolute inset-0 grid place-items-center p-6">
        {profile.logo_path ? (
          <img
            src={profile.logo_path}
            alt=""
            loading="lazy"
            decoding="async"
            className="max-h-full max-w-full object-contain drop-shadow-sm"
          />
        ) : (
          <div className="select-none text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-400">
            {initials(display)}
          </div>
        )}
      </div>

      {/* Country chip — top-right */}
      <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/85 dark:bg-slate-900/85 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-800 backdrop-blur">
        <span aria-hidden>{countryFlag(profile.country)}</span>
        <span className="hidden sm:inline">{profile.country_name || profile.country}</span>
        <span className="sm:hidden">{profile.country}</span>
      </div>
    </div>
  );
}
