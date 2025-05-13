/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0ff',
          100: '#cce0ff',
          200: '#99c2ff',
          300: '#66a3ff',
          400: '#3385ff',
          500: '#0066ff',
          600: '#005FB3', // SLA Blue
          700: '#004A8F',
          800: '#003666',
          900: '#002347',
        },
        secondary: {
          50: '#fff8e6',
          100: '#fff1cc',
          200: '#ffe499',
          300: '#ffd666',
          400: '#ffc933',
          500: '#FFBB00', // SLA Yellow
          600: '#cc9600',
          700: '#997000',
          800: '#664b00',
          900: '#332500',
        },
        accent: {
          50: '#e6ffe6',
          100: '#ccffcc',
          200: '#99ff99',
          300: '#66ff66',
          400: '#33ff33',
          500: '#00B140', // SLA Green
          600: '#008d33',
          700: '#006a26',
          800: '#00471a',
          900: '#00230d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};