import React from 'react';
import coreShapeLogo from '../assets/logos/junah-core-shape.svg';
import { PillCTA } from '../components/PillCTA';
import { PlatformLinks } from '../components/PlatformLinks';
import { SectionHeader } from '../components/SectionHeader';
import { aboutFacts, coreModelCopy, homeBio } from '../content/junahContent';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 md:px-6">
      <SectionHeader eyebrow="About" title="Junah" />

      <section className="border border-brand-mid bg-brand-paper p-5 md:p-6">
        <p className="max-w-3xl text-lg leading-relaxed text-brand-ink">{homeBio}</p>
        <PlatformLinks className="mt-6" showLabels />
      </section>

      <section className="grid gap-3 md:grid-cols-5">
        {aboutFacts.map((fact) => (
          <article key={fact.label} className="border border-brand-mid bg-brand-paper p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-brand-mid">{fact.label}</p>
            <p className="mt-2 text-brand-ink">{fact.value}</p>
          </article>
        ))}
      </section>

      <section className="border border-brand-mid bg-brand-paper p-5 md:p-6">
        <div className="mb-4 flex items-center gap-3">
          <img src={coreShapeLogo} alt="" className="h-14 w-14 object-contain" />
          <h2 className="font-mono text-4xl leading-none text-brand-dark md:text-5xl">The Core Model</h2>
        </div>
        <div className="space-y-4 text-lg leading-relaxed text-brand-ink">
          {coreModelCopy.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <PillCTA label="Explore Apparel" onClick={() => onNavigate('/apparel')} />
      </div>
    </div>
  );
};
