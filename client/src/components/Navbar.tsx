import React, { useMemo, useState } from 'react';
import { Menu, X, Search, Sparkles } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
}

interface NavbarProps {
  path: string;
  onNavigate: (path: string) => void;
  isOwnerAuthed: boolean;
  onLogout: () => void;
}

const navItems: NavItem[] = [
  { label: 'HOME', path: '/' },
  { label: 'BEATS', path: '/beats' },
  { label: 'APPAREL', path: '/apparel' },
  { label: 'LICENSING', path: '/licensing' },
  { label: 'DASHBOARD', path: '/dashboard' }
];

export const Navbar: React.FC<NavbarProps> = ({ path, onNavigate, isOwnerAuthed, onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const ctaLabel = useMemo(() => (isOwnerAuthed ? 'Logout' : 'Login'), [isOwnerAuthed]);

  const handleCta = () => {
    if (isOwnerAuthed) {
      onLogout();
      return;
    }

    onNavigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-400/40 bg-stone-100/95 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => onNavigate('/')} className="group flex items-center gap-2 text-left" aria-label="Junah blue home">
            <div className="border border-slate-700 bg-white px-2 py-1">
              <div className="font-mono text-2xl leading-none text-violet-600">junah</div>
              <div className="font-sans text-xl leading-none tracking-wide text-slate-700">.blue</div>
            </div>
            <Sparkles className="hidden h-5 w-5 text-violet-500 transition-transform group-hover:rotate-12 md:block" />
          </button>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => {
              const active = path === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`text-sm tracking-[0.2em] transition ${active ? 'text-violet-600' : 'text-slate-700 hover:text-slate-950'}`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={() => onNavigate('/beats')}
              className="flex h-10 w-10 items-center justify-center border border-slate-400 text-violet-600 transition hover:bg-violet-50"
              aria-label="Search beats"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={handleCta}
              className="rounded-full border border-slate-400 bg-lime-300 px-6 py-2 text-lg text-slate-800 transition hover:-translate-y-0.5 hover:bg-lime-200"
            >
              {ctaLabel}
            </button>
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center border border-slate-400 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="mt-3 space-y-2 border-t border-slate-300 pt-3 md:hidden">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  onNavigate(item.path);
                  setMobileOpen(false);
                }}
                className={`block w-full text-left text-sm tracking-[0.2em] ${path === item.path ? 'text-violet-600' : 'text-slate-800'}`}
              >
                {item.label}
              </button>
            ))}
            <button onClick={handleCta} className="mt-2 w-full rounded-full bg-lime-300 px-4 py-2 text-slate-900">
              {ctaLabel}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
