import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import type { Profile, ProfileListResponse, Stats } from "../lib/types";
import { StatTile } from "../components/StatTile";
import { ProfileCard } from "../components/ProfileCard";

export default function Landing() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [featured, setFeatured] = useState<Profile[]>([]);

  useEffect(() => {
    api.get<Stats>("/stats", { auth: false }).then(setStats).catch(() => {});
    api
      .get<ProfileListResponse>("/profiles?page_size=6", { auth: false })
      .then((r) => setFeatured(r.items))
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-accent-500/10 dark:from-slate-900 dark:via-slate-950 dark:to-accent-900/20" />
        <div className="absolute -top-24 -right-24 -z-10 h-80 w-80 rounded-full bg-brand-200/40 dark:bg-brand-900/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 -z-10 h-80 w-80 rounded-full bg-accent-500/20 dark:bg-accent-900/20 blur-3xl" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-12 md:pt-24 md:pb-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <span className="pill bg-brand-100 text-brand-800">Alumni community · independent project</span>
              <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.1]">
                The alumni network for <span className="bg-gradient-to-r from-brand-800 to-accent-500 bg-clip-text text-transparent">Google for Startups Accelerator</span> founders.
              </h1>
              <p className="mt-5 text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Find peers from your cohort, discover startups from across the world, and stay in
                touch with the people who graduated alongside you.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/sign-up" className="btn-primary">Join NetworkZ</Link>
                <Link to="/directory" className="btn-ghost">Browse directory →</Link>
              </div>
            </div>

            {/* Decorative card stack */}
            <div className="relative hidden md:block">
              <div className="card absolute -top-4 left-6 w-72 p-5 rotate-[-3deg]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500" />
                  <div>
                    <div className="font-semibold">PayWave</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Lagos · Fintech</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">"Mobile-first payments across West Africa."</div>
              </div>
              <div className="card absolute top-16 right-0 w-72 p-5 rotate-[2deg]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-500 to-brand-700" />
                  <div>
                    <div className="font-semibold">MedDash</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Nairobi · Healthtech</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">"Telemedicine at scale."</div>
              </div>
              <div className="card absolute top-40 left-2 w-72 p-5 rotate-[-1deg]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-800 to-brand-400" />
                  <div>
                    <div className="font-semibold">VectorAI</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">São Paulo · AI/ML</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">"ML infrastructure for builders."</div>
              </div>
              <div className="h-72" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          <StatTile label="Alumni startups" value={stats?.total_alumni ?? "—"} hint="Profiles in the directory" />
          <StatTile label="Countries" value={stats?.countries ?? "—"} hint="Represented" />
          <StatTile label="Cohort years" value={stats?.cohort_years ?? "—"} hint="From 2016 onwards" />
          <StatTile label="Industries" value={stats?.industries ?? "—"} hint="Sectors covered" />
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Latest in the network</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">A handful of startups recently added to the directory.</p>
          </div>
          <Link to="/directory" className="text-sm font-semibold text-brand-800 hover:underline">View all →</Link>
        </div>
        {featured.length === 0 ? (
          <div className="card p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
            No profiles yet — be the first to <Link className="text-brand-800 font-semibold underline" to="/sign-up">join NetworkZ</Link>.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProfileCard key={p.id} profile={p} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="card relative overflow-hidden p-10 md:p-14 bg-gradient-to-br from-brand-900 to-brand-700 text-white ring-0">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent-500/30 blur-3xl" />
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
            Add your startup. Make the network stronger.
          </h3>
          <p className="mt-3 text-brand-100 max-w-xl">
            It takes about a minute. Sign in with your email — we'll send a magic link.
          </p>
          <Link to="/sign-up" className="mt-6 inline-flex btn-accent">Join NetworkZ →</Link>
        </div>
      </section>
    </>
  );
}
