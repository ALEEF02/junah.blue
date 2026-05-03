import React, { useState } from 'react';
import { Menu, Search, ShoppingCart, X } from 'lucide-react';
import horizontalLogo from '../assets/logos/junah-horizontal.svg';

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
  { label: 'ABOUT', path: '/about' },
  { label: 'APPAREL', path: '/apparel' }
];

export const Navbar: React.FC<NavbarProps> = ({ path, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-mid bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => onNavigate('/')}
            className="group h-14 w-36 overflow-hidden text-left md:w-44"
            aria-label="Junah home"
          >
            <img
              src={horizontalLogo}
              alt="Junah"
              className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
            />
          </button>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => {
              const active = path === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`text-sm tracking-[0.2em] transition ${active ? 'font-semibold text-brand-dark' : 'text-brand-mid hover:text-brand-dark'}`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={() => onNavigate('/apparel')}
              className="flex h-10 w-10 items-center justify-center border border-brand-mid bg-brand-paper text-brand-mid transition hover:bg-brand-light/25"
              aria-label="Search apparel"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => onNavigate('/apparel')}
              className="flex h-10 w-10 items-center justify-center border border-brand-mid bg-brand-paper text-brand-mid transition hover:bg-brand-light/25"
              aria-label="View apparel cart"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center border border-brand-mid md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="mt-3 space-y-2 border-t border-brand-mid pt-3 md:hidden">
            {navItems.map((item) => {
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    onNavigate(item.path);
                    setMobileOpen(false);
                  }}
                  className={`block w-full text-left text-sm tracking-[0.2em] ${path === item.path ? 'text-brand-mid' : 'text-brand-dark'}`}
                >
                  {item.label}
                </button>
              );
            })}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onNavigate('/apparel');
                  setMobileOpen(false);
                }}
                className="flex h-10 w-10 items-center justify-center border border-brand-mid bg-brand-paper text-brand-mid"
                aria-label="Search apparel"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  onNavigate('/apparel');
                  setMobileOpen(false);
                }}
                className="flex h-10 w-10 items-center justify-center border border-brand-mid bg-brand-paper text-brand-mid"
                aria-label="View apparel cart"
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
