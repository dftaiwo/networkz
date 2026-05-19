import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setToken } from "../api/client";

export type Me = {
  id: number;
  email: string;
  is_admin: boolean;
  has_password: boolean;
  email_verified: boolean;
  profile_complete: boolean;
};

type AuthState = {
  me: Me | null;
  loading: boolean;
  signIn: (token: string) => Promise<Me>;
  signOut: () => void;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    const token = localStorage.getItem("networkz_jwt");
    if (!token) {
      setMe(null);
      setLoading(false);
      return;
    }
    try {
      const m = await api.get<Me>("/auth/me");
      setMe(m);
    } catch {
      setToken(null);
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { hydrate(); }, [hydrate]);

  const signIn = useCallback(async (token: string) => {
    setToken(token);
    const m = await api.get<Me>("/auth/me");
    setMe(m);
    return m;
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setMe(null);
  }, []);

  const value = useMemo(() => ({ me, loading, signIn, signOut, refresh: hydrate }), [me, loading, signIn, signOut, hydrate]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
