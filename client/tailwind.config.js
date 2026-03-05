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
                "brand-cream": "#efefec",
            },
        },
    },
    plugins: [],
}
