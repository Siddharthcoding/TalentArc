/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Baloo 2"', 'cursive', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        cursive: ['Caveat', 'cursive'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        'lime-field': '#D7F27A',
        'lime-deep': '#C9EA5E',
        'lime-neon': '#C6FF3D',
        'cream': '#F6E9D2',
        'kiit-green': '#0FA34E',
        'deep-green': '#0B7C3C',
        'soft-green': '#DFF5E6',
        'marigold': '#E8A33D',
        'vermillion': '#E1584A',
        'magenta': '#C74A86',
      },
      animation: {
        'spin-slow': 'spin 30s linear infinite',
        'marquee': 'marquee 25s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s ease-in-out infinite alternate',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
      },
    },
  },
  plugins: [],
};
