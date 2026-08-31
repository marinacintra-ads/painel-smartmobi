/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mobi: {
          primary: '#0878E5',
          secondary: '#0066CC',
          purple: '#32146F',
          purpleLight: '#442080',
          orange: '#FF7900',
          gray: '#55565A',
          bg: '#F5F6F8',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}