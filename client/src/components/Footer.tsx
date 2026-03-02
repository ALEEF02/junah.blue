import React from 'react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-brand-mid/40 bg-brand-cream py-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3 md:px-6">
        <div>
          <h3 className="text-5xl font-semibold tracking-tight">Junah</h3>
          <p className="mt-3 max-w-sm text-brand-mid">
            Producer and artist marketplace for licensing beats, purchasing apparel, and managing creator contracts.
          </p>
        </div>
        <div>
          <h4 className="text-xl font-semibold">Explore</h4>
          <div className="mt-3 space-y-2 text-brand-mid">
            <button onClick={() => onNavigate('/beats')} className="block hover:text-brand-dark">
              Beat Marketplace
            </button>
            <button onClick={() => onNavigate('/apparel')} className="block hover:text-brand-dark">
              Apparel
            </button>
            <button onClick={() => onNavigate('/licensing')} className="block hover:text-brand-dark">
              Licensing Hub
            </button>
            <button onClick={() => onNavigate('/dashboard')} className="block hover:text-brand-dark">
              Producer Dashboard
            </button>
          </div>
        </div>
        <div>
          <h4 className="text-xl font-semibold">Legal</h4>
          <p className="mt-3 text-brand-mid">All purchases require signature and acceptance of licensing terms before payment.</p>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-brand-mid pt-4 px-4 md:px-6 text-sm text-brand-mid">
        © {new Date().getFullYear()} Junah.blue
      </div>
    </footer>
  );
};
