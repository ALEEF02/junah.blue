import React from 'react';

/**
 * Displays a single beat with its title, description, audio preview and price.
 * The card subtly lifts on hover to draw the user's attention.
 *
 * @param {{ beat: { _id: string, title: string, description: string, previewUrl: string, fullUrl: string, price: number, isAvailable: boolean } }} props
 */
const BeatCard = ({ beat }) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-1">
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          {beat.title}
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
          {beat.description}
        </p>
        <audio controls className="w-full mt-4">
          <source src={beat.previewUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-primary-dark dark:text-primary-light font-bold text-lg">
            ${beat.price.toFixed(2)}
          </span>
          {/* Link to marketplace or details page */}
          <a
            href="/beats"
            className="px-4 py-2 bg-primary-dark dark:bg-primary-light text-white dark:text-gray-900 rounded-md text-sm font-medium hover:bg-primary-light hover:text-gray-900 dark:hover:bg-primary-dark dark:hover:text-white transition"
          >
            Buy Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default BeatCard;