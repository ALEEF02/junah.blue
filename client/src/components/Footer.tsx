import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useApparelCart } from '../context/ApparelCartContext';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { cartItemCount } = useApparelCart();

  const goToCart = () => {
    onNavigate('/apparel');
    window.setTimeout(() => document.getElementById('cart')?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <footer className="bg-white pt-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 py-6 md:gap-8">
          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                  ? 'auto'
                  : 'smooth'
              })
            }
            className="min-h-12 justify-self-start text-base font-semibold text-brand-ink"
          >
            TOP
          </button>

          <div className="flex flex-col items-center gap-3 text-center">
            <button
              type="button"
              onClick={() => onNavigate('/activate')}
              className="min-h-12 rounded-full border border-brand-ink px-6 py-3 text-base font-semibold text-brand-ink transition hover:bg-brand-ink hover:text-white md:px-10"
            >
              ACTIVATE
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/terms')}
              className="text-sm font-semibold text-brand-ink underline underline-offset-4"
            >
              TERMS &amp; CONDITIONS
            </button>
          </div>

          <button
            type="button"
            onClick={goToCart}
            className="flex min-h-12 items-center gap-2 justify-self-end text-base font-semibold text-apparel-red"
            aria-label={`Open cart with ${cartItemCount} items`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">CART</span>({cartItemCount})
          </button>
        </div>

      </div>

      <div className="mt-10 bg-brand-gray py-6">
        <div className="mx-auto max-w-7xl space-y-1 px-4 text-sm font-semibold text-brand-ink md:px-6">
          <p>© 2026 Junah.blue</p>
          <p>(C) 2026 Junah</p>
          <p>(C) 2026 Junahblue</p>
        </div>
      </div>
    </footer>
  );
};
