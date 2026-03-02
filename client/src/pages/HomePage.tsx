import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EditorialCard } from '../components/EditorialCard';
import { PillCTA } from '../components/PillCTA';
import { SectionHeader } from '../components/SectionHeader';
import { api, formatCurrency } from '../lib/api';
import { ApparelProduct, ArtistProfile, Beat } from '../types/api';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [apparel, setApparel] = useState<ApparelProduct[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [beatsLoading, setBeatsLoading] = useState(true);
  const [apparelLoading, setApparelLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [beatsError, setBeatsError] = useState<string | null>(null);
  const [apparelError, setApparelError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError(null);
        const profileRes = await api.getPublicProfile();
        if (!cancelled) {
          setProfile(profileRes);
        }
      } catch (err) {
        if (!cancelled) {
          setProfileError(err instanceof Error ? err.message : 'Unable to load biography');
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    };

    const loadBeats = async () => {
      try {
        setBeatsLoading(true);
        setBeatsError(null);
        const beatsRes = await api.getPublicBeats();
        if (!cancelled) {
          setBeats(beatsRes.beats.slice(0, 4));
        }
      } catch (err) {
        if (!cancelled) {
          setBeatsError(err instanceof Error ? err.message : 'Unable to load beats');
        }
      } finally {
        if (!cancelled) {
          setBeatsLoading(false);
        }
      }
    };

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

    loadProfile();
    loadBeats();
    loadApparel();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-16 pb-20">
      <section className="relative overflow-hidden border-b border-brand-mid/30 bg-brand-cream py-20">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="relative mx-auto max-w-6xl px-4 md:px-6">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl text-center text-5xl font-semibold leading-tight tracking-tight text-brand-dark md:text-8xl"
          >
            Junah beats, artist merchandise, and contracts.
          </motion.h1>
          <p className="mx-auto mt-5 max-w-2xl text-center text-xl text-brand-mid">
            Preview tracks, sign licensing agreements, checkout securely, and receive beats automatically.
          </p>
          <div className="mt-8 flex justify-center">
            <PillCTA label="Get started now" onClick={() => onNavigate('/beats')} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeader
          eyebrow="Biography"
          title={profile?.headline || 'Junah'}
          description={profileLoading ? 'Loading biography...' : profile?.bio}
        />
        {profileError ? <p className="text-red-600">{profileError}</p> : null}
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeader eyebrow="Beat Marketplace" title="Featured Beats" />
        {beatsError ? <p className="text-red-600">{beatsError}</p> : null}
        {beatsLoading ? <p className="text-brand-mid">Loading beats...</p> : null}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {beats.map((beat, index) => (
            <EditorialCard
              key={beat.id}
              category={beat.isAvailable ? 'Available' : 'Sold'}
              title={beat.title}
              description={`${formatCurrency(beat.pricing.nonExclusivePriceCents)} non-exclusive / ${formatCurrency(beat.pricing.exclusivePriceCents)} exclusive`}
              accent={index % 2 === 0 ? 'text-brand-mid' : 'text-brand-light'}
              onArrowClick={() => onNavigate('/beats')}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeader eyebrow="Apparel" title="Latest Drops" />
        {apparelError ? <p className="text-red-600">{apparelError}</p> : null}
        {apparelLoading ? <p className="text-brand-mid">Loading apparel...</p> : null}
        <div className="grid gap-6 md:grid-cols-3">
          {apparel.map((product, index) => (
            <EditorialCard
              key={product.id}
              category="Product"
              title={product.title}
              description={
                product.variants[0]
                  ? `${formatCurrency(product.variants[0].priceCents)} starting`
                  : 'Pricing unavailable'
              }
              imageUrl={product.imageUrl}
              accent={index === 1 ? 'text-brand-light' : 'text-brand-mid'}
              onArrowClick={() => onNavigate('/apparel')}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
