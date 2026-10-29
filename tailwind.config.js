/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        advait: {
          dark: '#14513A',
          hover: '#0E3B2A',
          accent: '#1E9E5A',
          navy: '#14233F',
          body: '#4B5563',
          muted: '#8A94A0',
          amber: '#F5B335',
          red: '#D64545',
          blue: '#2F6FDB',
          mint: '#F4F8F6',
          border: '#E3EAE6',
          'border-input': '#D1DCD6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        hindi: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px 0 rgba(20, 81, 58, 0.05)',
        'card-hover': '0 8px 24px 0 rgba(20, 81, 58, 0.09)',
        'auth': '0 8px 30px -4px rgba(20, 81, 58, 0.08)',
      },
      borderRadius: {
        'card': '14px',
      }
    },
  },
  plugins: [],
}
