/** @type {import('tailwindcss').Config} */
module.exports = {
   plugins: [
    require('tailwind-scrollbar-hide')
  ],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // include all source files
  ],
  theme: { extend: {} },
  plugins: [],
};
