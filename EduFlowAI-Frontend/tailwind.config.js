// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    // Tell Tailwind to scan all HTML and TS files in the src folder
    content: [
      "./src/**/*.{html,ts}",
    ],
    theme: {
      extend: {
        // Define the custom colors from the Stitch design
        colors: {
          "primary": "#022448",
          "primary-container": "#1e3a5f",
          "on-primary": "#ffffff",
          "secondary": "#505f76",
          "secondary-container": "#d0e1fb",
          "surface": "#f7f9fb",
          "surface-container-high": "#e6e8ea",
          "on-surface-variant": "#43474e",
          "on-background": "#191c1e",
          "outline-variant": "#c4c6cf",
        },
        // Define the custom font family
        fontFamily: {
          "label-sm": ["IBM Plex Sans", "sans-serif"],
          "headline-lg": ["IBM Plex Sans", "sans-serif"],
          "label-md": ["IBM Plex Sans", "sans-serif"],
          "headline-md": ["IBM Plex Sans", "sans-serif"],
          "body-sm": ["IBM Plex Sans", "sans-serif"],
        }
      },
    },
    plugins: [],
}