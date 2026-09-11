/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#7c3aed',
      },
    },
  },
  daisyui: {
    themes: ['light', 'dark'],
    styled: true,
    base: true,
  },
  plugins: [require('daisyui')],
}
