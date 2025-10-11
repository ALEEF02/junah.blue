import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import BeatCard from '../components/BeatCard';
import { getBiography, getBeats } from '../api';

export interface Beat {
  _id: string;
  title: string;
  description?: string;
  previewUrl: string;
  fullUrl?: string;
  price: number;
  isAvailable: boolean;
  artworkUrl?: string;
}

type Bio = { biography: string };

/**
 * LiveAbout-like editorial layout for the homepage
 */
const HomePage = () => {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [bio, setBio] = useState<Bio | null>(null);
  const [loadingBeats, setLoadingBeats] = useState(true);
  const [loadingBio, setLoadingBio] = useState(true);

  useEffect(() => {
    getBiography()
      .then((data) => setBio(data))
      .catch((err) => console.error('Failed to load biography:', err))
      .finally(() => setLoadingBio(false));

    getBeats()
      .then((data) => setBeats(data))
      .catch((err) => console.error('Failed to load beats:', err))
      .finally(() => setLoadingBeats(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {/* Top intro section */}
      <header className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-black">Fresh Beats and Apparel</h1>
          <p className="mt-3 text-lg text-gray-700 max-w-2xl">
            Explore new instrumentals, shop merch, and learn how to license tracks. Crafted by Junah.
          </p>
        </div>
      </header>

      {/* Category tiles */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Beats', href: '/beats', bg: 'from-rose-100 to-rose-200' },
              { label: 'Apparel', href: '/apparel', bg: 'from-emerald-100 to-emerald-200' },
              { label: 'Licensing', href: '/legal', bg: 'from-sky-100 to-sky-200' },
              { label: 'About', href: '/#bio', bg: 'from-amber-100 to-amber-200' },
            ].map((tile) => (
              <a
                key={tile.label}
                href={tile.href}
                className={`relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br ${tile.bg} aspect-[4/3] flex items-end p-4`}
                aria-label={tile.label}
              >
                <span className="text-xl font-bold text-gray-900">{tile.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Biography */}
      <section id="bio" className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-black">Biography</h2>
          <div className="mt-4">
            {loadingBio && <p>Loading biography…</p>}
            {!loadingBio && bio && (
              <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-line">{bio.biography}</p>
            )}
          </div>
        </div>
      </section>

      {/* Featured beats */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-black">Featured Beats</h2>
          {loadingBeats ? (
            <p className="mt-4">Loading beats…</p>
          ) : (
            <>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {beats.slice(0, 3).map((beat) => (
                  <BeatCard key={beat._id} beat={beat} />
                ))}
              </div>
              <div className="mt-8">
                <a href="/beats" className="text-link hover:underline">Explore all beats →</a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Licensing overview */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-black">Licensing & Contracts</h2>
          <p className="mt-3 text-gray-800">
            Learn how our licensing works and how you can collaborate with Junah. We offer both
            exclusive and non-exclusive options with clear terms so you know exactly what you’re getting.
          </p>
          <div className="mt-6">
            <a href="/legal" className="inline-block px-5 py-2.5 rounded-md bg-black text-white visited:text-white hover:bg-gray-900">Learn More</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-700">
          <p>&copy; {new Date().getFullYear()} Junah. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            <a href="/terms" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
