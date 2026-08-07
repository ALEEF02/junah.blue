/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "brand-dark": "#092E61",
                "brand-mid": "#1164B4",
                "brand-light": "#69BEEF",
                "brand-paper": "#FFFFFF",
                "brand-cream": "#FFFFFF",
                "brand-ink": "#232323",
                "brand-black": "#111111",
                "brand-gray": "#B5B7BB",
                "music-blue": "#092E61",
                "music-blue-dark": "#0D1126",
                "apparel-red": "#770610",
                "apparel-red-dark": "#57050C",
                "events-yellow": "#F2D249",
                "events-yellow-dark": "#D8AC11",
                "events-yellow-menu": "#796006",
                "release-purple": "#68466F",
                "photo-wall-overlay": "#FAF6F5",
            },
        },
    },
    plugins: [],
}
