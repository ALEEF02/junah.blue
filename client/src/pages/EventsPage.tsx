import React from 'react';
import eventPhoto from '../assets/events/junah-live-event.jpeg';

export const EventsPage: React.FC = () => (
  <div className="bg-white pb-20">
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-16">
      <h1 className="text-5xl font-bold text-events-yellow-dark md:text-7xl">EVENTS</h1>
      <p className="mt-3 text-xl font-semibold text-events-yellow-dark md:text-2xl">
        Click on the photo to see upcoming events
      </p>
      <a
        href="https://linktr.ee/junahblue"
        target="_blank"
        rel="noreferrer"
        className="mt-8 block overflow-hidden bg-events-yellow focus-visible:outline-events-yellow-dark"
        aria-label="See Junah's upcoming events on Linktree"
      >
        <img
          src={eventPhoto}
          alt="Junah performing live under purple stage lights"
          className="mx-auto max-h-[78vh] w-full object-contain transition-transform duration-300 hover:scale-[1.01]"
        />
      </a>
    </div>
  </div>
);
