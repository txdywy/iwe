/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'micro': ['11px', '14px'],
        'tiny': ['12px', '16px'],
      },
      letterSpacing: {
        'super-wide': '0.15em',
      }
    },
  },
  plugins: [],
}

