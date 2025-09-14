import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import BeatCard from '../components/BeatCard';
import { getBiography, getBeats } from '../api';

/**
 * The landing page for the Junah site. It fetches real data from the backend
 * and lays out multiple sections: hero, biography, featured beats, a brief
 * licensing overview and a footer. All sections are responsive and adapt
 * gracefully to different screen sizes.
 */
const HomePage = () => {
  const [bio, setBio] = useState(null);
  const [beats, setBeats] = useState([]);
  const [loadingBio, setLoadingBio] = useState(true);
  const [loadingBeats, setLoadingBeats] = useState(true);

  useEffect(() => {
    // Fetch biography from the backend
    getBiography()
      .then((data) => {
        setBio(data);
      })
      .catch((err) => {
        console.error('Failed to load biography:', err);
      })
      .finally(() => setLoadingBio(false));

    // Fetch beats from the backend
    getBeats()
      .then((data) => {
        setBeats(data);
      })
      .catch((err) => {
        console.error('Failed to load beats:', err);
      })
      .finally(() => setLoadingBeats(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation bar */}
      <NavBar />
      {/* Hero section */}
      <header className="relative text-white">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/hero.png"
            alt="Abstract music background"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/30 to-gray-900"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 flex flex-col items-start">
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4">
            Discover Junah's Sound
          </h1>
          <p className="text-lg sm:text-xl mb-8 max-w-xl text-gray-200">
            Experience unique beats crafted from a fusion of jazz, R&B and modern hip‑hop rhythms.
          </p>
          <div className="flex space-x-4">
            <a
              href="/beats"
              className="px-6 py-3 rounded-full bg-primary-light text-white font-medium shadow-md hover:bg-primary-dark transition"
            >
              Browse Beats
            </a>
            <a
              href="/apparel"
              className="px-6 py-3 rounded-full bg-white text-primary-dark font-medium shadow-md hover:bg-gray-100 transition"
            >
              Shop Apparel
            </a>
          </div>
        </div>
      </header>
      {/* Biography section */}
      <section className="py-16 bg-white dark:bg-gray-900 flex-1">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
            Biography
          </h2>
          {loadingBio && <p className="text-center">Loading biography…</p>}
          {!loadingBio && bio && (
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {bio.biography}
            </p>
          )}
        </div>
      </section>
      {/* Featured beats section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
            Featured Beats
          </h2>
          {loadingBeats ? (
            <p className="text-center">Loading beats…</p>
          ) : (
            <>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {beats.slice(0, 3).map((beat) => (
                  <BeatCard key={beat._id} beat={beat} />
                ))}
              </div>
              <div className="mt-12 text-center">
                <a href="/beats" className="text-primary-dark dark:text-primary-light hover:underline">
                  Explore all beats &rarr;
                </a>
              </div>
            </>
          )}
        </div>
      </section>
      {/* Licensing overview section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Licensing & Contracts</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Learn how our licensing works and how you can collaborate with Junah. We offer both
            exclusive and non‑exclusive options with clear terms so you know exactly what you’re
            getting.
          </p>
          <a
            href="/legal"
            className="px-6 py-3 rounded-full bg-primary-light text-white font-medium shadow-md hover:bg-primary-dark transition"
          >
            Learn More
          </a>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-8 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} Junah. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="/privacy" className="hover:underline">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:underline">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;