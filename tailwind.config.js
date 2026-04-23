/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7fb',
          100: '#e1f0f7',
          200: '#c8e2f1',
          300: '#a1cde8',
          400: '#73b1db', 
          500: '#5296cc', // Decent, dusty blue accent
          600: '#3f7db8',
          700: '#346596',
          800: '#2e557c',
          900: '#2a4867',
          950: '#1c2f46',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      }
    },
  },
  plugins: [],
}
