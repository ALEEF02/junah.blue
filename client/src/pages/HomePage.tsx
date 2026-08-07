import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import stackLogo from '../assets/logos/junah-stack.svg';
import eventPhoto from '../assets/events/junah-live-event.jpeg';
import { PillCTA } from '../components/PillCTA';
import { PlatformLinks } from '../components/PlatformLinks';
import { api } from '../lib/api';
import { ApparelProduct } from '../types/api';
import { heroPhotos } from '../content/junahContent';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [apparel, setApparel] = useState<ApparelProduct[]>([]);

  useEffect(() => {
    let cancelled = false;

    api
      .getApparelProducts()
      .then((response) => {
        if (!cancelled) setApparel(response.products.slice(0, 3));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const photoWallTiles = [...heroPhotos, ...heroPhotos, ...heroPhotos, ...heroPhotos, ...heroPhotos];
  const apparelSlots: Array<ApparelProduct | null> = apparel.length ? apparel : [null, null, null];

  const openMusicPanel = () => onNavigate('/music');

  return (
    <div className="bg-white pb-16">
      <section className="relative overflow-hidden bg-photo-wall-overlay py-12 md:py-16">
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
          <p className="font-[550] text-brand-ink">
            so much music.<br className="md:hidden" /> <span className="hidden md:inline"> </span>
            an oversaturated market.<br className="md:hidden" /> <span className="hidden md:inline"> </span>
            generative art.<br />
            AM I REAL ENOUGH YET?<br />
            or will i be drowned in the noise?
          </p>
          <div className="mt-8 aspect-video w-full max-w-2xl overflow-hidden bg-black">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/YGZNk_RnjuE"
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

      <section className="mx-auto mt-12 grid max-w-7xl gap-4 px-4 md:grid-cols-12 md:px-6">
        <article
          role="link"
          tabIndex={0}
          onClick={openMusicPanel}
          onKeyDown={(event) => {
            if (event.currentTarget !== event.target) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openMusicPanel();
            }
          }}
          className="flex min-h-80 cursor-pointer flex-col items-center justify-center bg-music-blue px-5 py-10 text-white focus-visible:outline-white md:col-span-7"
          aria-label="Open Music"
        >
          <h2 className="text-5xl font-bold md:text-7xl">MUSIC</h2>
          <PlatformLinks
            iconOnly
            className="mt-6 justify-center"
            linkClassName="text-white hover:bg-white/10"
            onLinkClick={(event) => event.stopPropagation()}
          />
        </article>

        <button
          type="button"
          onClick={() => onNavigate('/events')}
          className="group relative min-h-80 overflow-hidden bg-events-yellow text-left md:col-span-5"
        >
          <img
            src={eventPhoto}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center opacity-80 transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <span className="absolute inset-x-0 bottom-0 bg-events-yellow-dark/90 px-5 py-5 text-center text-4xl font-bold text-white md:text-6xl">
            EVENTS
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/apparel')}
          className="group min-h-80 overflow-hidden bg-apparel-red px-5 py-8 text-white md:col-span-12"
        >
          <span className="block text-center text-5xl font-bold md:text-7xl">APPAREL</span>
          <span className="mx-auto mt-7 grid max-w-3xl grid-cols-3 gap-3">
            {apparelSlots.map((product, index) => {
              const imageUrl = product ? product.imageUrl || product.variants[0]?.imageUrl : '';
              return (
                <span key={product?.id || index} className="aspect-square overflow-hidden bg-white/20">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : null}
                </span>
              );
            })}
          </span>
        </button>
      </section>
    </div>
  );
};
