/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'neon-green': '#00FF41',
        'neon-green-dark': '#00CC34',
        'dark-bg': '#0a0e27',
        'dark-card': '#1a1f3a',
        'dark-border': '#2d3748',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 255, 65, 0.3)',
        'neon-strong': '0 0 20px rgba(0, 255, 65, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
