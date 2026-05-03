import React from 'react';
import { ExternalLink, Instagram, Music2, Youtube } from 'lucide-react';
import { PlatformLink, platformLinks } from '../content/junahContent';

interface PlatformLinksProps {
  links?: PlatformLink[];
  className?: string;
  showLabels?: boolean;
}

const AmazonIcon = () => (
  <span
    aria-hidden="true"
    className="relative inline-flex h-4 w-4 items-center justify-center font-sans text-[15px] font-bold leading-none"
  >
    a
    <span className="absolute bottom-[-1px] left-[3px] h-2 w-2.5 rounded-b-full border-b-2 border-current" />
  </span>
);

const AppleMusicIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
    <path
      d="M16 4v10.1a3 3 0 1 1-1.4-2.5V6.7L8.5 8v8.1a3 3 0 1 1-1.4-2.5V6.5L16 4Z"
      fill="currentColor"
    />
  </svg>
);

const BandcampIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
    <path d="M7.2 6h11.6l-5.9 12H1.3L7.2 6Z" fill="currentColor" />
  </svg>
);

const SpotifyIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M7.5 9.2c3.1-.9 6.4-.6 9.2.8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    <path d="M8.2 12c2.5-.6 5-.4 7.2.7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
    <path d="M9 14.7c1.8-.4 3.6-.2 5.2.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
  </svg>
);

const TidalIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
    <path
      d="m6 5 3 3-3 3-3-3 3-3Zm6 0 3 3-3 3-3-3 3-3Zm6 0 3 3-3 3-3-3 3-3Zm-6 6 3 3-3 3-3-3 3-3Z"
      fill="currentColor"
    />
  </svg>
);

const getIcon = (link: PlatformLink) => {
  if (link.label === 'Instagram') return <Instagram className="h-4 w-4" />;
  if (link.label === 'YouTube' || link.label === 'YouTube Music') return <Youtube className="h-4 w-4" />;
  if (link.label === 'Apple Music') return <AppleMusicIcon />;
  if (link.label === 'Amazon Music') return <AmazonIcon />;
  if (link.label === 'Bandcamp') return <BandcampIcon />;
  if (link.label === 'Spotify') return <SpotifyIcon />;
  if (link.label === 'Tidal') return <TidalIcon />;
  if (link.kind === 'music') return <Music2 className="h-4 w-4" />;
  return <ExternalLink className="h-4 w-4" />;
};

export const PlatformLinks: React.FC<PlatformLinksProps> = ({
  links = platformLinks,
  className = '',
  showLabels = false
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${link.label}`}
          title={link.label}
          className="inline-flex min-h-11 items-center gap-2 border border-brand-mid bg-brand-paper px-3 py-2 text-sm font-semibold text-brand-dark transition hover:-translate-y-0.5 hover:bg-brand-light/25 hover:text-brand-mid"
        >
          {getIcon(link)}
          <span>{showLabels ? link.label : link.shortLabel}</span>
        </a>
      ))}
    </div>
  );
};
