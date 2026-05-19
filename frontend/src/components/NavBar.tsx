import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function NavBar() {
  const { me, signOut } = useAuth();
  const navigate = useNavigate();

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium ${isActive ? "text-brand-800" : "text-slate-600 hover:text-slate-900"}`;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-800 to-accent-500 text-white font-bold">
            N
          </span>
          <span className="font-semibold tracking-tight text-slate-900">NetworkZ</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/directory" className={linkCls}>Directory</NavLink>
          {me?.is_admin && <NavLink to="/admin" className={linkCls}>Admin</NavLink>}
          {me ? (
            <>
              <NavLink to="/my-profile" className={linkCls}>My profile</NavLink>
              <button
                className="btn-ghost text-sm"
                onClick={() => { signOut(); navigate("/"); }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/sign-in" className={linkCls}>Sign in</NavLink>
              <Link to="/sign-up" className="btn-primary">Join NetworkZ</Link>
            </>
          )}
        </nav>

        {/* Mobile: condensed CTA */}
        <div className="md:hidden flex items-center gap-3">
          <NavLink to="/directory" className={linkCls}>Directory</NavLink>
          {me ? (
            <NavLink to="/my-profile" className="btn-primary text-xs px-3 py-2">Profile</NavLink>
          ) : (
            <Link to="/sign-up" className="btn-primary text-xs px-3 py-2">Join</Link>
          )}
        </div>
      </div>
    </header>
  );
}
