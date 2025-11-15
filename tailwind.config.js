/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        light: {
          bg: '#F7F7F9',
          surface: '#FFFFFF',
          text: '#0F1115',
          border: '#ECECEF',
          accent: '#FF6A55',
          success: '#2DD4BF',
        },
        dark: {
          bg: '#0B0F10',
          surface: '#121519',
          text: '#E9ECEF',
          border: '#1B2026',
          accent: '#38E28C',
          purple: '#7C3AED',
        },
      },
      borderRadius: {
        'card': '22px',
        'button': '12px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'lift': '0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.08)',
      },
      fontVariantNumeric: ['tabular-nums'],
    },
  },
  plugins: [],
}
