/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#152420',
          light: '#1F332D',
          soft: '#2A4038',
        },
        paper: {
          DEFAULT: '#EEF1EC',
          card: '#F8F9F5',
        },
        brand: {
          DEFAULT: '#1F5C52',
          dark: '#153F38',
          light: '#2C7A6C',
        },
        gold: {
          DEFAULT: '#C9A24B',
          soft: '#E4CE93',
        },
        income: '#3F7D5C',
        expense: '#B5483D',
        line: '#D8DBD3',
        text: {
          ink: '#1B231F',
          muted: '#5B685F',
          faint: '#8C978E',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'ledger-dash':
          'repeating-linear-gradient(90deg, #D8DBD3 0, #D8DBD3 6px, transparent 6px, transparent 12px)',
      },
    },
  },
  plugins: [],
};
