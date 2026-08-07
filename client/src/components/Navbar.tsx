import React, { useState } from 'react';
import { Menu, Search, ShoppingCart, X } from 'lucide-react';
import shapeLogo from '../assets/logos/junah-core-shape.svg';
import { useApparelCart } from '../context/ApparelCartContext';

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
  { label: 'MUSIC', path: '/music' },
  { label: 'EVENTS', path: '/events' },
  { label: 'APPAREL', path: '/apparel' }
];

const mobileColor: Record<string, string> = {
  '/': 'text-brand-ink',
  '/music': 'text-music-blue',
  '/events': 'text-events-yellow-menu',
  '/apparel': 'text-apparel-red'
};

export const Navbar: React.FC<NavbarProps> = ({ path, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartItemCount } = useApparelCart();

  const goToCart = () => {
    onNavigate('/apparel');
    window.setTimeout(() => document.getElementById('cart')?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
        <div className="relative flex items-center justify-between gap-4">
          <button
            onClick={() => onNavigate('/')}
            className="group flex h-12 w-12 items-center justify-center text-left"
            aria-label="Junah home"
          >
            <img
              src={shapeLogo}
              alt="Junah"
              className="h-10 w-10 object-contain transition-transform group-hover:scale-105"
            />
          </button>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex">
            {navItems.map((item) => {
              const active = path === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`py-2 text-base font-semibold transition ${active ? 'text-brand-ink underline decoration-2 underline-offset-8' : 'text-brand-ink/70 hover:text-brand-ink'}`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={() => onNavigate('/apparel')}
              className="flex h-11 w-11 items-center justify-center border border-brand-ink bg-white text-brand-ink transition hover:bg-brand-ink hover:text-white"
              aria-label="Search apparel"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={goToCart}
              className="relative flex h-11 w-11 items-center justify-center border border-apparel-red bg-white text-apparel-red transition hover:bg-apparel-red hover:text-white"
              aria-label={`View apparel cart, ${cartItemCount} items`}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-apparel-red px-1 text-xs font-bold text-white">
                  {cartItemCount}
                </span>
              ) : null}
            </button>
          </div>

          <button
            className="flex h-11 w-11 items-center justify-center text-brand-ink md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="mt-3 space-y-1 bg-brand-gray p-3 md:hidden">
            {navItems.map((item) => {
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    onNavigate(item.path);
                    setMobileOpen(false);
                  }}
                  className={`block min-h-11 w-full px-2 text-left text-xl font-bold ${mobileColor[item.path]}`}
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
                className="flex h-11 w-11 items-center justify-center border border-brand-ink bg-white text-brand-ink"
                aria-label="Search apparel"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  goToCart();
                  setMobileOpen(false);
                }}
                className="flex h-11 w-11 items-center justify-center border border-apparel-red bg-white text-apparel-red"
                aria-label={`View apparel cart, ${cartItemCount} items`}
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
