import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function MagicLinkLand() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const token = params.get("token");
    if (!token) {
      setError("This link is missing a token.");
      return;
    }
    (async () => {
      try {
        const r = await api.post<{ access_token: string }>(
          "/auth/magic-link/consume",
          { token },
          { auth: false }
        );
        const me = await signIn(r.access_token);
        navigate(me.profile_complete ? "/directory" : "/my-profile", { replace: true });
      } catch (err: any) {
        setError(err?.message || "We couldn't sign you in with that link.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      {error ? (
        <>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Sign-in failed</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{error}</p>
          <a href="/sign-in" className="mt-6 inline-flex btn-primary">Request a new link</a>
        </>
      ) : (
        <div className="flex items-center justify-center gap-3 text-slate-600 dark:text-slate-400">
          <span className="inline-block h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-brand-600 animate-spin" />
          Signing you in…
        </div>
      )}
    </div>
  );
}
