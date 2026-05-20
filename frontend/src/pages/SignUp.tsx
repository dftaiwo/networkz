import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { api } from "../api/client";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/auth/signup", { email }, { auth: false });
      setSent(true);
    } catch (err: any) {
      toast.error(err?.message || "Could not send link");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Join NetworkZ</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Enter your email and we'll send you a one-time magic link to finish setting up.
        </p>

        {sent ? (
          <div className="mt-6 rounded-xl bg-accent-500/10 text-accent-600 p-4 text-sm">
            ✓ We sent a link to <strong>{email}</strong>. Check your inbox (and your spam folder).
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                className="input mt-1"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@startup.co"
                autoFocus
              />
            </div>
            <button className="btn-primary w-full" disabled={submitting}>
              {submitting ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already a member?{" "}
          <Link to="/sign-in" className="text-brand-800 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
