/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#022448',
        'primary-container': '#1e3a5f',
        'on-primary': '#ffffff',
        secondary: '#505f76',
        'secondary-container': '#d0e1fb',
        background: '#f7f9fb',
        surface: '#f7f9fb',
        'surface-low': '#f2f4f6',
        'surface-container': '#eceef0',
        'surface-container-high': '#e6e8ea',
        'on-surface': '#191c1e',
        'on-surface-variant': '#43474e',
        'on-background': '#191c1e',
        outline: '#74777f',
        'outline-variant': '#c4c6cf',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        success: '#065f46',
        'success-container': '#d1fae5',
        warning: '#d8953a',
        'warning-container': '#ffddb8',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'Arial', 'sans-serif'],
        'label-sm': ['IBM Plex Sans', 'Arial', 'sans-serif'],
        'headline-lg': ['IBM Plex Sans', 'Arial', 'sans-serif'],
        'label-md': ['IBM Plex Sans', 'Arial', 'sans-serif'],
        'headline-md': ['IBM Plex Sans', 'Arial', 'sans-serif'],
        'body-sm': ['IBM Plex Sans', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        control: '0.25rem',
        card: '0.5rem',
        panel: '0.75rem',
      },
      boxShadow: {
        card: '0 2px 8px rgb(2 36 72 / 8%)',
      },
    },
  },
  plugins: [],
};
