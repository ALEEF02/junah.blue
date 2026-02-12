import React from 'react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-400/40 bg-stone-100 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3 md:px-6">
        <div>
          <h3 className="text-5xl font-semibold tracking-tight">Junah</h3>
          <p className="mt-3 max-w-sm text-slate-700">
            Producer and artist marketplace for licensing beats, purchasing apparel, and managing creator contracts.
          </p>
        </div>
        <div>
          <h4 className="text-xl font-semibold">Explore</h4>
          <div className="mt-3 space-y-2 text-slate-700">
            <button onClick={() => onNavigate('/beats')} className="block hover:text-violet-600">
              Beat Marketplace
            </button>
            <button onClick={() => onNavigate('/apparel')} className="block hover:text-violet-600">
              Apparel
            </button>
            <button onClick={() => onNavigate('/licensing')} className="block hover:text-violet-600">
              Licensing Hub
            </button>
            <button onClick={() => onNavigate('/dashboard')} className="block hover:text-violet-600">
              Producer Dashboard
            </button>
          </div>
        </div>
        <div>
          <h4 className="text-xl font-semibold">Legal</h4>
          <p className="mt-3 text-slate-700">All purchases require signature and acceptance of licensing terms before payment.</p>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-slate-300 pt-4 px-4 md:px-6 text-sm text-slate-600">
        © {new Date().getFullYear()} Junah.blue
      </div>
    </footer>
  );
};
