/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "brand-dark": "#023C85",
                "brand-mid": "#0172B0",
                "brand-light": "#89D6E8",
                "brand-paper": "#FFFFFF",
                "brand-cream": "#f2ede9",
                "brand-ink": "#242321",
                "photo-wall-overlay": "#FAF6F5",
            },
        },
    },
    plugins: [],
}
