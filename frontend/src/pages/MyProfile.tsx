import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { ProfileOwnerView, Reference } from "../lib/types";
import { LogoUploader } from "../components/LogoUploader";
import { Spinner } from "../components/Spinner";

type FormState = {
  founder_name: string;
  startup_name: string;
  tagline: string;
  website: string;
  country: string;
  cohort_year: string;
  industry: string;
  linkedin_url: string;
  twitter_url: string;
  contact_email: string;
  contact_phone: string;
  logo_path: string | null;
};

function toForm(p: ProfileOwnerView): FormState {
  return {
    founder_name: p.founder_name || "",
    startup_name: p.startup_name || "",
    tagline: p.tagline || "",
    website: p.website || "",
    country: p.country || "",
    cohort_year: p.cohort_year ? String(p.cohort_year) : "",
    industry: p.industry || "",
    linkedin_url: p.linkedin_url || "",
    twitter_url: p.twitter_url || "",
    contact_email: p.contact_email || "",
    contact_phone: p.contact_phone || "",
    logo_path: p.logo_path || null,
  };
}

const STEP_1_REQUIRED: (keyof FormState)[] = ["founder_name", "startup_name"];
const STEP_2_REQUIRED: (keyof FormState)[] = ["country", "cohort_year", "industry"];

export default function MyProfile() {
  const { me, refresh, signOut } = useAuth();
  const navigate = useNavigate();
  const [reference, setReference] = useState<Reference | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [settingPw, setSettingPw] = useState(false);

  useEffect(() => {
    api.get<Reference>("/reference", { auth: false }).then(setReference).catch(() => {});
    api
      .get<ProfileOwnerView>("/profiles/me")
      .then((p) => {
        setForm(toForm(p));
        setProfileId(p.id);
      })
      .catch(() => {});
  }, []);

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [k]: v } : prev));
  }

  function step1Valid(f: FormState): boolean {
    return STEP_1_REQUIRED.every((k) => String(f[k] ?? "").trim().length > 0);
  }
  function step2Valid(f: FormState): boolean {
    return STEP_2_REQUIRED.every((k) => String(f[k] ?? "").trim().length > 0);
  }

  function goToStep2() {
    if (!form) return;
    if (!step1Valid(form)) {
      toast.error("Please fill in your name and your startup name.");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    if (!form) return;
    if (!step1Valid(form)) {
      toast.error("Some required basics are missing.");
      setStep(1);
      return;
    }
    if (!step2Valid(form)) {
      toast.error("Please complete country, cohort year, and industry.");
      return;
    }
    setSaving(true);
    try {
      const payload: any = { ...form };
      payload.cohort_year = form.cohort_year ? parseInt(form.cohort_year, 10) : null;
      for (const k of [
        "tagline",
        "website",
        "linkedin_url",
        "twitter_url",
        "contact_email",
        "contact_phone",
      ] as const) {
        if (!payload[k]) payload[k] = null;
      }
      const saved = await api.patch<ProfileOwnerView>("/profiles/me", payload);
      await refresh();
      toast.success("Profile saved");
      navigate(`/directory/${saved.id}`);
    } catch (err: any) {
      toast.error(err?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSettingPw(true);
    try {
      await api.post("/auth/password", { password });
      setPassword("");
      await refresh();
      toast.success("Password updated");
    } catch (err: any) {
      toast.error(err?.message || "Could not update password");
    } finally {
      setSettingPw(false);
    }
  }

  async function deleteProfile() {
    if (!confirm("Delete your NetworkZ profile and account? This cannot be undone.")) return;
    try {
      await api.del("/profiles/me");
      signOut();
      navigate("/", { replace: true });
      toast.success("Profile deleted");
    } catch (err: any) {
      toast.error(err?.message || "Could not delete");
    }
  }

  if (!form) return <Spinner />;

  const s1Done = step1Valid(form);
  const s2Done = step2Valid(form);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your profile</h1>
          <p className="text-slate-600 mt-1">Signed in as {me?.email}</p>
        </div>
        {profileId && me?.profile_complete && (
          <a
            href={`/directory/${profileId}`}
            className="btn-ghost text-xs"
            onClick={(e) => { e.preventDefault(); navigate(`/directory/${profileId}`); }}
          >
            View public profile →
          </a>
        )}
      </div>

      {/* Stepper */}
      <Stepper step={step} onStep={setStep} s1Done={s1Done} s2Done={s2Done} />

      {/* Not a <form> on purpose: we don't want Enter or any conditional
          button to ever trigger an implicit submit. All actions are explicit. */}
      <div className="card p-6 sm:p-8 space-y-6">
        {step === 1 ? (
          <Step1 form={form} update={update} />
        ) : (
          <Step2 form={form} update={update} reference={reference} />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div>
            {step === 2 && (
              <button
                key="back"
                type="button"
                className="btn-ghost text-sm"
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {step === 1 ? (
              <button
                key="continue"
                type="button"
                className="btn-primary"
                onClick={goToStep2}
              >
                Continue →
              </button>
            ) : (
              <button
                key="save"
                type="button"
                className="btn-primary"
                onClick={save}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save profile"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Password card */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900">
          {me?.has_password ? "Update your password" : "Set a password for faster sign-in"}
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Optional. You can always sign in with a magic link.
        </p>
        <form onSubmit={savePassword} className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            className="input flex-1"
            type="password"
            value={password}
            placeholder="New password (min 8 chars)"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn-ghost" disabled={settingPw || !password}>
            {settingPw ? "Updating…" : me?.has_password ? "Update password" : "Set password"}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="card p-6 border border-rose-200/60">
        <h2 className="font-semibold text-rose-700">Danger zone</h2>
        <p className="text-sm text-slate-600 mt-1">Remove your profile and account from NetworkZ.</p>
        <button onClick={deleteProfile} className="mt-4 btn-ghost border-rose-200 text-rose-700 hover:bg-rose-50">
          Delete my profile
        </button>
      </div>
    </div>
  );
}

/* ─── Stepper ────────────────────────────────────────────────────────── */

function Stepper({
  step,
  onStep,
  s1Done,
  s2Done,
}: {
  step: 1 | 2;
  onStep: (s: 1 | 2) => void;
  s1Done: boolean;
  s2Done: boolean;
}) {
  const Item = ({
    n, label, active, done, onClick,
  }: { n: number; label: string; active: boolean; done: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center gap-3 rounded-xl px-4 py-3 text-left transition
        ${active ? "bg-brand-50 ring-1 ring-brand-200" : "bg-white hover:bg-slate-50"}`}
    >
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-semibold
          ${active ? "bg-brand-800 text-white"
                  : done ? "bg-accent-500/20 text-accent-600"
                          : "bg-slate-100 text-slate-500"}`}
      >
        {done && !active ? "✓" : n}
      </span>
      <div className="min-w-0">
        <div className={`text-xs font-semibold uppercase tracking-wide ${active ? "text-brand-800" : "text-slate-500"}`}>
          Step {n}
        </div>
        <div className="text-sm font-medium text-slate-900 truncate">{label}</div>
      </div>
    </button>
  );

  return (
    <div className="card p-2 flex gap-2">
      <Item n={1} label="About your startup"   active={step === 1} done={s1Done} onClick={() => onStep(1)} />
      <Item n={2} label="Program & contact"    active={step === 2} done={s2Done} onClick={() => onStep(2)} />
    </div>
  );
}

/* ─── Step bodies ────────────────────────────────────────────────────── */

function Step1({
  form, update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">About your startup</h2>
        <p className="text-sm text-slate-600 mt-1">The basics shown on your directory card.</p>
      </div>

      <LogoUploader value={form.logo_path} onChange={(p) => update("logo_path", p)} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name *">
          <input className="input" required value={form.founder_name}
            onChange={(e) => update("founder_name", e.target.value)} placeholder="Ada Lovelace" />
        </Field>
        <Field label="Startup name *">
          <input className="input" required value={form.startup_name}
            onChange={(e) => update("startup_name", e.target.value)} placeholder="Analytical Engine" />
        </Field>
      </div>

      <Field label="Tagline">
        <input
          className="input"
          placeholder="A short one-liner about what you do"
          value={form.tagline}
          onChange={(e) => update("tagline", e.target.value)}
          maxLength={280}
        />
        <p className="mt-1 text-xs text-slate-500">{form.tagline.length}/280</p>
      </Field>
    </>
  );
}

function Step2({
  form, update, reference,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  reference: Reference | null;
}) {
  return (
    <>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Program & contact</h2>
        <p className="text-sm text-slate-600 mt-1">Cohort details, links, and how members can reach you.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Primary country *">
          <select className="input" required value={form.country}
            onChange={(e) => update("country", e.target.value)}>
            <option value="">Select…</option>
            {reference?.countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Cohort year *">
          <select className="input" required value={form.cohort_year}
            onChange={(e) => update("cohort_year", e.target.value)}>
            <option value="">Select…</option>
            {reference?.cohort_years.slice().reverse().map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Industry *">
        <select className="input" required value={form.industry}
          onChange={(e) => update("industry", e.target.value)}>
          <option value="">Select…</option>
          {reference?.industries.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Website">
          <input className="input" placeholder="https://" inputMode="url"
            value={form.website} onChange={(e) => update("website", e.target.value)} />
        </Field>
        <Field label="LinkedIn">
          <input className="input" placeholder="https://linkedin.com/in/…"
            value={form.linkedin_url} onChange={(e) => update("linkedin_url", e.target.value)} />
        </Field>
        <Field label="X / Twitter">
          <input className="input" placeholder="https://x.com/…"
            value={form.twitter_url} onChange={(e) => update("twitter_url", e.target.value)} />
        </Field>
      </div>

      <fieldset className="rounded-2xl bg-slate-50 ring-1 ring-slate-100 p-5">
        <legend className="px-2 -ml-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Contact info (members-only)
        </legend>
        <p className="text-xs text-slate-500 -mt-1 mb-4">
          Hidden from the public directory. Only signed-in NetworkZ members see these.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Contact email">
            <input className="input" type="email" placeholder="hello@startup.co"
              value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className="input" placeholder="+1 555 0000"
              value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} />
          </Field>
        </div>
      </fieldset>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
