/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF0000',
          dark: '#CC0000',
        },
        surface: {
          DEFAULT: '#0F0F0F',
          elevated: '#1A1A1A',
          card: '#212121',
        },
      },
    },
  },
  plugins: [],
};
