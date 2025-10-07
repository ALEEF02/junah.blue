import React, { useState } from 'react';

/**
 * A responsive navigation bar. On mobile it collapses into a menu button.
 * The styling draws inspiration from modern SaaS sites with clear typography
 * and subtle hover effects.
 */
const NavBar = () => {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => {
    setOpen((prev) => !prev);
  };

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Beats', href: '/beats' },
    { label: 'Apparel', href: '/apparel' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Licensing', href: '/legal' },
  ];

  return (
    <nav className="bg-white/70 backdrop-blur dark:bg-gray-900/70 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="text-2xl font-extrabold text-primary-dark dark:text-primary-light">
              Junah<span className="text-primary-light dark:text-primary-dark">.blue</span>
            </a>
          </div>
          {/* Desktop menu */}
          <div className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-700 dark:text-gray-200 hover:text-primary-dark dark:hover:text-primary-light transition font-medium"
              >
                {item.label}
              </a>
            ))}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-primary-dark dark:hover:text-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark"
            >
              {/* Simple hamburger icon */}
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {open ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu items */}
      {open && (
        <div className="md:hidden bg-white dark:bg-gray-900 px-2 pt-2 pb-3 space-y-1 shadow-md">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default NavBar;