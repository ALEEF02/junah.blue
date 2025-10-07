import React from 'react';

export interface Beat {
  _id: string;
  title: string;
  description?: string;
  previewUrl: string;
  fullUrl?: string;
  price: number;         // dollars
  isAvailable: boolean;
}

interface BeatCardProps {
  beat: Beat;
}

const formatUSD = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const BeatCard: React.FC<BeatCardProps> = ({ beat }) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm transition-transform hover:shadow-md hover:-translate-y-1">
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          {beat.title}
        </h3>

        {beat.description && (
          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
            {beat.description}
          </p>
        )}

        <audio controls preload="metadata" className="w-full mt-4" src={beat.previewUrl}>
          Your browser does not support the audio element.
        </audio>

        <div className="mt-4 flex justify-between items-center">
          <span className="text-primary-dark dark:text-primary-light font-bold text-lg">
            {formatUSD(beat.price)}
          </span>

          {/* Link to marketplace/detail page */}
          <a
            href={`/beats/${beat._id}`}
            aria-disabled={!beat.isAvailable}
            className={`px-4 py-2 rounded-md text-sm font-medium transition
              ${beat.isAvailable
                ? 'bg-primary-dark dark:bg-primary-light text-white dark:text-gray-900 hover:bg-primary-light hover:text-gray-900 dark:hover:bg-primary-dark dark:hover:text-white'
                : 'pointer-events-none opacity-50 bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
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
