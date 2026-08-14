/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tjpa: {
          navy: '#002B5C',
          'navy-dark': '#001E42',
          'navy-light': '#0B3B73',
          gold: '#C59B27',
          'gold-light': '#DFC168',
          'gold-dark': '#A4801B',
          surface: '#F1F3F6',
          'surface-card': '#FFFFFF',
          'surface-hover': '#E8ECF1',
          red: '#ED1C24',
          'red-dark': '#C0131A',
          'red-light': '#FEE2E2',
          text: '#1E293B',
          'text-muted': '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 43, 92, 0.05), 0 1px 2px -1px rgba(0, 43, 92, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 43, 92, 0.1), 0 2px 4px -2px rgba(0, 43, 92, 0.1)',
        'modal': '0 20px 25px -5px rgba(0, 43, 92, 0.2), 0 8px 10px -6px rgba(0, 43, 92, 0.15)',
      },
    },
  },
  plugins: [],
}
