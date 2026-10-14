import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        archive: '#17233A',
        paper: '#F7F8FA',
        mist: '#E5E9ED',
        graphite: '#252A31',
        stamp: '#B84235',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'sans-serif'],
        serif: ['"Noto Serif SC"', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
