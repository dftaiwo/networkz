import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { Profile } from "../lib/types";
import { countryFlag, initials } from "../lib/flag";
import { Spinner } from "../components/Spinner";

export default function ProfileDetail() {
  const { id } = useParams();
  const { me } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get<Profile>(`/profiles/${id}`)
      .then(setProfile)
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Profile not found</h1>
        <Link to="/directory" className="mt-4 inline-flex btn-primary">Back to directory</Link>
      </div>
    );
  }
  if (!profile) return <Spinner />;

  const isOwner = !!me && me.id === profile.user_id;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between">
        <Link to="/directory" className="text-sm text-slate-500 hover:text-slate-900">← Directory</Link>
        {isOwner && (
          <Link to="/my-profile" className="btn-ghost text-xs">Edit your profile</Link>
        )}
      </div>

      <div className="mt-4 card overflow-hidden">
        {/* Hero logo plate — natural aspect, large */}
        <div className="relative aspect-[16/6] overflow-hidden border-b border-slate-100 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_50%,#eef2ff_100%)]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, #3730A3 0, transparent 40%), radial-gradient(circle at 80% 70%, #10B981 0, transparent 40%)",
            }}
            aria-hidden
          />
          <div className="absolute inset-0 grid place-items-center p-10">
            {profile.logo_path ? (
              <img
                src={profile.logo_path}
                alt=""
                className="max-h-full max-w-full object-contain drop-shadow"
              />
            ) : (
              <div className="select-none text-5xl font-bold tracking-tight text-brand-800">
                {initials(profile.startup_name || profile.founder_name)}
              </div>
            )}
          </div>
        </div>

        <div className="p-8 md:p-10">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {profile.startup_name}
          </h1>
          <p className="mt-1 text-slate-600">{profile.founder_name}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="pill">
              <span aria-hidden>{countryFlag(profile.country)}</span>
              {profile.country_name || profile.country}
            </span>
            <span className="pill bg-brand-100 text-brand-800">{profile.industry}</span>
            <span className="pill bg-accent-500/10 text-accent-600">Class of {profile.cohort_year}</span>
          </div>

          {profile.tagline && (
            <p className="mt-6 text-slate-700 leading-relaxed">{profile.tagline}</p>
          )}

        <hr className="my-7 border-slate-100" />

        <dl className="grid gap-5 sm:grid-cols-2 text-sm">
          {profile.website && (
            <Row label="Website">
              <a className="text-brand-800 hover:underline" href={profile.website} target="_blank" rel="noreferrer">
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            </Row>
          )}
          {profile.linkedin_url && (
            <Row label="LinkedIn">
              <a className="text-brand-800 hover:underline" href={profile.linkedin_url} target="_blank" rel="noreferrer">
                {profile.linkedin_url.replace(/^https?:\/\//, "")}
              </a>
            </Row>
          )}
          {profile.twitter_url && (
            <Row label="X / Twitter">
              <a className="text-brand-800 hover:underline" href={profile.twitter_url} target="_blank" rel="noreferrer">
                {profile.twitter_url.replace(/^https?:\/\//, "")}
              </a>
            </Row>
          )}
        </dl>

        <hr className="my-7 border-slate-100" />

        {me ? (
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <Row label="Email">
              {profile.contact_email ? (
                <a className="text-brand-800 hover:underline" href={`mailto:${profile.contact_email}`}>
                  {profile.contact_email}
                </a>
              ) : (
                <span className="text-slate-400">Not shared</span>
              )}
            </Row>
            <Row label="Phone">
              {profile.contact_phone ? (
                <span className="text-slate-700">{profile.contact_phone}</span>
              ) : (
                <span className="text-slate-400">Not shared</span>
              )}
            </Row>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
            <p className="text-sm text-slate-700">
              Contact info is shared with NetworkZ members.{" "}
              <Link to="/sign-in" className="text-brand-800 font-semibold hover:underline">
                Sign in to view
              </Link>
              .
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="label">{label}</dt>
      <dd className="mt-1 text-slate-700">{children}</dd>
    </div>
  );
}
