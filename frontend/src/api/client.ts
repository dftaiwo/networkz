const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export type ApiError = { status: number; message: string };

function getToken(): string | null {
  return localStorage.getItem("networkz_jwt");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("networkz_jwt", token);
  else localStorage.removeItem("networkz_jwt");
}

async function request<T>(
  path: string,
  opts: RequestInit = {},
  { auth = true }: { auth?: boolean } = {}
): Promise<T> {
  const headers = new Headers(opts.headers || {});
  if (!headers.has("Content-Type") && opts.body && !(opts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const body = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;
  if (!res.ok) {
    const message =
      (body && typeof body === "object" && (body.detail || body.message)) || res.statusText;
    throw { status: res.status, message: String(message) } as ApiError;
  }
  return body as T;
}

export const api = {
  get:    <T>(p: string, o?: { auth?: boolean }) => request<T>(p, { method: "GET" }, o),
  post:   <T>(p: string, b?: any, o?: { auth?: boolean }) =>
            request<T>(p, { method: "POST", body: b !== undefined ? JSON.stringify(b) : undefined }, o),
  patch:  <T>(p: string, b: any, o?: { auth?: boolean }) =>
            request<T>(p, { method: "PATCH", body: JSON.stringify(b) }, o),
  del:    <T>(p: string, o?: { auth?: boolean }) => request<T>(p, { method: "DELETE" }, o),
  upload: <T>(p: string, file: File) => {
            const fd = new FormData();
            fd.append("file", file);
            return request<T>(p, { method: "POST", body: fd });
          },
};
