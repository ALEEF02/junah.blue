import React from 'react';
import coreShape from '../assets/logos/junah-core-shape.svg';
import { PlatformLinks } from '../components/PlatformLinks';
import { coreModelCopy, homeBio, musicReleases } from '../content/junahContent';

export const MusicPage: React.FC = () => (
  <div className="bg-white pb-20">
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
      <h1 className="text-5xl font-bold text-music-blue md:text-7xl">MUSIC</h1>

      <section className="mt-8 bg-music-blue px-5 py-10 text-white md:px-10 md:py-14">
        <p className="max-w-3xl text-lg text-white leading-relaxed md:text-xl">{homeBio}</p>
        <PlatformLinks
          iconOnly
          className="mt-7"
          linkClassName="text-white hover:bg-white/10"
        />
      </section>

      <div className="mt-14 grid gap-12 md:grid-cols-2 md:gap-8">
        {musicReleases.map((release) => (
          <article key={release.title}>
            <div className="relative aspect-square overflow-hidden bg-brand-gray">
              <img
                src={release.artwork}
                alt={release.artworkAlt}
                className="h-full w-full object-cover"
              />
              <h2
                className={`absolute inset-x-0 top-0 bg-white/80 px-4 py-3 text-2xl font-bold md:text-3xl ${release.titleClassName}`}
              >
                {release.title}
              </h2>
            </div>
            <PlatformLinks
              links={release.links}
              iconOnly
              className="mt-3"
              linkClassName={release.linkClassName}
            />
          </article>
        ))}
      </div>

      <section className="mt-16 bg-brand-gray px-5 py-10 md:px-10 md:py-14">
        <div className="grid gap-8 md:grid-cols-[160px_1fr] md:items-start">
          <img src={coreShape} alt="" className="h-28 w-28 object-contain md:h-36 md:w-36" />
          <div>
            <h2 className="text-3xl font-bold text-black md:text-5xl">THE CORE MODEL</h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-brand-ink md:text-lg">
              {coreModelCopy.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
);
