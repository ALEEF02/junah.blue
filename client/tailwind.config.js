/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
      },
      colors: {
        primary: {
          light: '#2563EB',
          DEFAULT: '#1D4ED8',
          dark: '#1E3A8A'
        },
        link: {
          DEFAULT: '#0b0b0b',
          visited: 'rgba(0,0,0,0.95)'
        },
        focus: {
          ring: '#014ecb'
        },
        redundertone: '#f9f4f4'
      }
    }
  },
  plugins: []
};
