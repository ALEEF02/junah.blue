/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "brand-dark": "#030A3F",
                "brand-mid": "#406995",
                "brand-light": "#7FC6EB",
                "brand-cream": "#efefec",
            },
        },
    },
    plugins: [],
}
