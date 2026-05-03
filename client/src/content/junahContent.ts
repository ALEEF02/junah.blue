import heroPhoto1 from '../assets/photos/image14.jpg';
import heroPhoto2 from '../assets/photos/image15.jpg';
import heroPhoto3 from '../assets/photos/image16.jpg';
import heroPhoto4 from '../assets/photos/image17.jpg';
import heroPhoto6 from '../assets/photos/image19.jpg';
import heroPhoto7 from '../assets/photos/image20.jpg';
import heroPhoto8 from '../assets/photos/image21.jpg';
import heroPhoto9 from '../assets/photos/image22.jpg';

export type PlatformKind = 'music' | 'social';

export interface PlatformLink {
  label: string;
  shortLabel: string;
  href: string;
  kind: PlatformKind;
}

export const homeBio =
  'Junah is a singer/songwriter based in Los Angeles, CA. He mixes creative poetry with a masterful skill of melody to bring a refreshing and modern spin on R&B and Pop music.';

export const aboutFacts = [
  { label: 'Who', value: 'Junah (aka Junah Blue)' },
  { label: 'What', value: 'Singer / Songwriter / Producer' },
  { label: 'Where', value: 'Los Angeles' },
  { label: 'When', value: 'Right here in the present all namaste and shit.' },
  { label: 'How', value: 'Motivational YouTube lifting videos and some Pranayama breathing.' }
];

export const coreModelCopy = [
  'My logo is the Core Model. The Core Model is a fundamental pattern of nature that first entered literature in the 1970s by permaculture researchers Bill Mollison and David Holmgren. In short, permaculture is a system of design principles that reflect the patterns of the natural world. Where this becomes useful is in agriculture. Permaculture systems have allowed farming to take new forms in which local ecosystems are less disrupted, maintenance is reduced, and crops are able to flourish easier.',
  "I'm not claiming to be a permaculturist. At least not yet. Still, I can't help but draw inspiration from what the Core Model represents. Stopping to observe yields clarity in the underlying patterns. And there are patterns in everything. Human behavior, the branches of science, the flow of traffic, chess, economics. The same way I've listened to music, figured out the patterns, and replicated them to create great art myself, I also seek to find the underlying patterns and understand the basic principles in all aspects of life, including life itself. This is what the core model is. A foundational pattern that can be used to create prosperity and nourishment."
];

export const platformLinks: PlatformLink[] = [
  {
    label: 'YouTube Music',
    shortLabel: 'YT MUSIC',
    href: 'https://music.youtube.com/channel/UCFC7pUWxzq8jLzsE6mHhFgQ?si=3r2k4TSOOKroDuNI',
    kind: 'music'
  },
  {
    label: 'Apple Music',
    shortLabel: 'APPLE MUSIC',
    href: 'https://music.apple.com/us/artist/junah/1609366375',
    kind: 'music'
  },
  {
    label: 'Amazon Music',
    shortLabel: 'AMAZON MUSIC',
    href: 'https://music.amazon.com/artists/B002COTGY8/junah?marketplaceId=ATVPDKIKX0DER&musicTerritory=US&ref=dm_sh_d2R2DeK4MAjis3FHzeVsdr1eN',
    kind: 'music'
  },
  {
    label: 'Bandcamp',
    shortLabel: 'BANDCAMP',
    href: 'https://junahblue.bandcamp.com/',
    kind: 'music'
  },
  {
    label: 'Tidal',
    shortLabel: 'TIDAL',
    href: 'https://tidal.com/artist/16722464/u',
    kind: 'music'
  },
  {
    label: 'Spotify',
    shortLabel: 'SPOTIFY',
    href: 'https://open.spotify.com/artist/6JL8YY8LM3QGNE9ooind3u?si=vkQl7vSTT2CHop-zPzVNrg',
    kind: 'music'
  },
  {
    label: 'Instagram',
    shortLabel: 'INSTAGRAM',
    href: 'https://www.instagram.com/junahblue/',
    kind: 'social'
  },
  {
    label: 'YouTube',
    shortLabel: 'YOUTUBE',
    href: 'https://www.youtube.com/@Junahblue',
    kind: 'social'
  }
];

export const heroPhotos = [
  heroPhoto1,
  heroPhoto2,
  heroPhoto3,
  heroPhoto4,
  heroPhoto6,
  heroPhoto7,
  heroPhoto8,
  heroPhoto9
];
