import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function SignIn() {
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "magic") {
        await api.post("/auth/magic-link/request", { email }, { auth: false });
        setSent(true);
      } else {
        const r = await api.post<{ access_token: string }>(
          "/auth/login",
          { email, password },
          { auth: false }
        );
        await signIn(r.access_token);
        navigate("/my-profile");
      }
    } catch (err: any) {
      toast.error(err?.message || "Sign-in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Welcome back.</p>

        {sent ? (
          <div className="mt-6 rounded-xl bg-accent-500/10 text-accent-600 p-4 text-sm">
            ✓ If <strong>{email}</strong> belongs to a member, we sent a sign-in link.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
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
            {mode === "password" && (
              <div>
                <label className="label">Password</label>
                <input
                  className="input mt-1"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            )}
            <button className="btn-primary w-full" disabled={submitting}>
              {submitting
                ? "Working…"
                : mode === "magic"
                  ? "Send magic link"
                  : "Sign in"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          {mode === "magic" ? (
            <button className="text-slate-500 hover:text-slate-900 underline" onClick={() => setMode("password")}>
              Have a password? Sign in with password
            </button>
          ) : (
            <button className="text-slate-500 hover:text-slate-900 underline" onClick={() => setMode("magic")}>
              Use a magic link instead
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{" "}
          <Link to="/sign-up" className="text-brand-800 font-semibold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
