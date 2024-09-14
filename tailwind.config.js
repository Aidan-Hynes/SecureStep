/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#1E3A8A', // Custom blue color
      },
      backgroundImage: {
        'pattern': "url('https://www.transparenttextures.com/patterns/stripes.png')",
      },
    },
  },
  plugins: [],
}
