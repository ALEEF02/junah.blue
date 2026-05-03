import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import stackLogo from '../assets/logos/junah-stack.svg';
import { EditorialCard } from '../components/EditorialCard';
import { PillCTA } from '../components/PillCTA';
import { PlatformLinks } from '../components/PlatformLinks';
import { api, formatCurrency } from '../lib/api';
import { ApparelProduct } from '../types/api';
import { heroPhotos, homeBio } from '../content/junahContent';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [apparel, setApparel] = useState<ApparelProduct[]>([]);
  const [apparelLoading, setApparelLoading] = useState(true);
  const [apparelError, setApparelError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadApparel = async () => {
      try {
        setApparelLoading(true);
        setApparelError(null);
        const apparelRes = await api.getApparelProducts();
        if (!cancelled) {
          setApparel(apparelRes.products.slice(0, 3));
        }
      } catch (err) {
        if (!cancelled) {
          setApparelError(err instanceof Error ? err.message : 'Unable to load apparel');
        }
      } finally {
        if (!cancelled) {
          setApparelLoading(false);
        }
      }
    };

    loadApparel();

    return () => {
      cancelled = true;
    };
  }, []);

  const featuredProduct = apparel[0];
  const featuredVariant = featuredProduct?.variants[0];
  const photoWallTiles = [...heroPhotos, ...heroPhotos, ...heroPhotos, ...heroPhotos, ...heroPhotos];

  return (
    <div className="space-y-14 pb-20">
      <section className="relative overflow-hidden border-b border-brand-mid bg-photo-wall-overlay py-12 md:py-16">
        <div className="pointer-events-none absolute -inset-x-8 -inset-y-10 opacity-20">
          <div className="grid min-h-full grid-cols-3 [grid-auto-rows:34vw] sm:grid-cols-4 sm:[grid-auto-rows:25vw] md:grid-cols-6 md:[grid-auto-rows:16.666vw]">
            {photoWallTiles.map((photo, index) => (
              <div key={`${photo}-${index}`} className="overflow-hidden">
                <img
                  src={photo}
                  alt=""
                  className={`h-full w-full object-cover ${index % 2 === 0 ? 'scale-110' : 'scale-125 rotate-2'}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 text-center md:px-6">
          <motion.img
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            src={stackLogo}
            alt="Junah"
            className="h-64 w-full max-w-md object-contain md:h-80"
          />
          <PlatformLinks className="mt-4 justify-center" />
          <div className="mt-8 aspect-video w-full max-w-2xl overflow-hidden border border-brand-mid bg-brand-paper">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/pwQE6jD1tKU"
              title="Junah video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="mt-8 flex justify-center">
            <PillCTA label="Browse Apparel" onClick={() => onNavigate('/apparel')} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-6">
        <EditorialCard
          category="About"
          title="Junah"
          description={homeBio}
          accent="text-brand-dark"
          onArrowClick={() => onNavigate('/about')}
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-6">
        {apparelError ? <p className="mb-4 text-red-600">{apparelError}</p> : null}
        {apparelLoading ? <p className="text-brand-mid">Loading apparel...</p> : null}
        {!apparelLoading && featuredProduct ? (
          <EditorialCard
            category="Apparel"
            title={featuredProduct.title}
            description={
              featuredVariant
                ? `${formatCurrency(featuredVariant.priceCents)} starting. Browse Junah merch.`
                : 'Browse Junah merch.'
            }
            imageUrl={featuredVariant?.imageUrl || featuredProduct.imageUrl}
            accent="text-brand-dark"
            onArrowClick={() => onNavigate('/apparel')}
            actions={
              apparel.length > 1 ? (
                <div className="grid grid-cols-3 gap-3">
                  {apparel.map((product) => (
                    <div key={product.id} className="aspect-square overflow-hidden border border-brand-mid/40 bg-brand-cream">
                      {product.imageUrl || product.variants[0]?.imageUrl ? (
                        <img
                          src={product.imageUrl || product.variants[0]?.imageUrl}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null
            }
          />
        ) : null}
      </section>
    </div>
  );
};
