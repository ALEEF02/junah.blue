import React from 'react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-brand-mid/30 bg-brand-cream py-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3 md:px-6">
        <div>
          <h3 className="text-5xl tracking-tight">Junah</h3>
          <p className="mt-3 max-w-sm text-brand-ink">
            Singer, songwriter, and artist apparel from Los Angeles.
          </p>
        </div>
        <div>
          <h4 className="text-xl font-semibold">Explore</h4>
          <div className="mt-3 space-y-2 text-brand-mid">
            <button onClick={() => onNavigate('/')} className="block hover:text-brand-dark">
              Home
            </button>
            <button onClick={() => onNavigate('/about')} className="block hover:text-brand-dark">
              About
            </button>
            <button onClick={() => onNavigate('/apparel')} className="block hover:text-brand-dark">
              Apparel
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-brand-mid pt-4 px-4 md:px-6 text-sm text-brand-dark">
        © {new Date().getFullYear()} Junah.blue
      </div>
    </footer>
  );
};
