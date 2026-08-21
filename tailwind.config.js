/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  // Preflight is disabled on purpose: this project already ships a hand-built
  // global stylesheet (src/styles/index.css) with its own reset + design
  // tokens for the existing pages. Tailwind's preflight would fight it.
  // Utility classes still work everywhere, including inside src/styles/tailwind.css.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          green: '#95ff8a',
          greenDim: '#6fe07f',
          violet: '#8b6cff',
        },
      },
    },
  },
  plugins: [],
};
