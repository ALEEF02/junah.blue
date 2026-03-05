import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { ArtistProfile } from '../types/api';
import { SectionHeader } from '../components/SectionHeader';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getPublicProfile();
        if (!cancelled) {
          setProfile(response);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load biography');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasSocialLinks = useMemo(() => {
    if (!profile) return false;
    return Boolean(profile.socialLinks.instagram || profile.socialLinks.youtube || profile.socialLinks.spotify);
  }, [profile]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 md:px-6">
      <SectionHeader
        eyebrow="Biography"
        title={profile?.headline || 'About Junah'}
        description="Full artist background and story."
      />

      {error ? <p className="rounded border border-red-300 bg-red-50 p-3 text-red-700">{error}</p> : null}
      {loading ? <p className="text-brand-mid">Loading biography...</p> : null}

      {profile ? (
        <section className="border border-brand-mid bg-brand-light/10 p-5 md:p-6">
          <h3 className="text-2xl text-brand-dark">{profile.name}</h3>
          <p className="mt-4 whitespace-pre-wrap text-brand-mid">{profile.bio}</p>

          {hasSocialLinks ? (
            <div className="mt-6 border-t border-brand-mid pt-4">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-mid">Connect</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {profile.socialLinks.instagram ? (
                  <a
                    href={profile.socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-brand-mid px-4 py-2 text-brand-mid hover:bg-brand-light/20"
                  >
                    Instagram
                  </a>
                ) : null}
                {profile.socialLinks.youtube ? (
                  <a
                    href={profile.socialLinks.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-brand-mid px-4 py-2 text-brand-mid hover:bg-brand-light/20"
                  >
                    YouTube
                  </a>
                ) : null}
                {profile.socialLinks.spotify ? (
                  <a
                    href={profile.socialLinks.spotify}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-brand-mid px-4 py-2 text-brand-mid hover:bg-brand-light/20"
                  >
                    Spotify
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button onClick={() => onNavigate('/beats')} className="border border-brand-mid px-4 py-2 text-brand-mid hover:bg-brand-light/20">
          Browse Beats
        </button>
        <button onClick={() => onNavigate('/apparel')} className="border border-brand-mid px-4 py-2 text-brand-mid hover:bg-brand-light/20">
          Explore Apparel
        </button>
      </div>
    </div>
  );
};
