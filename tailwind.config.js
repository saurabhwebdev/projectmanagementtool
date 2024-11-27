/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#007BFF',
        success: '#34D399',
        error: '#F87171',
        'light-gray': '#F3F4F6',
        'dark-gray': '#374151',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        'roboto-mono': ['Roboto Mono', 'monospace'],
      },
      fontSize: {
        'h1': '32px',
        'h2': '24px',
        'body': '16px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
}
