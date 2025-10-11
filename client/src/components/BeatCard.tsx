import React from 'react';

export interface Beat {
  _id: string;
  title: string;
  description?: string;
  previewUrl: string;
  fullUrl?: string;
  price: number;         // dollars
  isAvailable: boolean;
  artworkUrl?: string;
}

interface BeatCardProps {
  beat: Beat;
}

const formatUSD = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const BeatCard: React.FC<BeatCardProps> = ({ beat }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-shadow hover:shadow-md">
      {/* Media/Artwork area */}
      <div className="relative w-full aspect-[16/9] bg-gray-100">
        {beat.artworkUrl ? (
          <img src={beat.artworkUrl} alt="Beat artwork"
               className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No artwork</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {beat.title}
        </h3>
        {beat.description && (
          <p className="mt-1 text-gray-600 text-sm line-clamp-2">
            {beat.description}
          </p>
        )}
        <audio controls preload="metadata" className="w-full mt-3" src={beat.previewUrl}>
          Your browser does not support the audio element.
        </audio>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-gray-900 font-semibold">{formatUSD(beat.price)}</span>
          <a
            href={`/beats/${beat._id}`}
            aria-disabled={!beat.isAvailable}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition
              ${beat.isAvailable
                ? 'bg-black text-white visited:text-white hover:bg-gray-900'
                : 'pointer-events-none opacity-50 bg-gray-200 text-gray-600'}`}
            title={beat.isAvailable ? 'Buy Now' : 'Not available'}
          >
            {beat.isAvailable ? 'Buy Now' : 'Unavailable'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default BeatCard;
