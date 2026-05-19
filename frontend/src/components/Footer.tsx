export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/50 mt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 grid gap-6 md:grid-cols-3 text-sm text-slate-600">
        <div>
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand-800 to-accent-500 text-white font-bold text-xs">N</span>
            NetworkZ
          </div>
          <p className="mt-3 text-slate-600 leading-relaxed">
            A community-built alumni directory of startups from the Google for Startups Accelerator.
          </p>
        </div>
        <div>
          <div className="label mb-3">For members</div>
          <ul className="space-y-2">
            <li><a href="/directory" className="hover:text-slate-900">Browse directory</a></li>
            <li><a href="/sign-up" className="hover:text-slate-900">Join the network</a></li>
            <li><a href="/sign-in" className="hover:text-slate-900">Sign in</a></li>
          </ul>
        </div>
        <div>
          <div className="label mb-3">Disclaimer</div>
          <p className="text-slate-500 leading-relaxed">
            NetworkZ is an independent community project. It is not affiliated with, endorsed by, or sponsored by Google.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} NetworkZ
      </div>
    </footer>
  );
}
