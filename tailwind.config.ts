import type { Config } from 'tailwindcss'

export default {
  theme: {
    extend: {
      colors: {
        'green-brand': '#1D9E75',
        'green-light': '#E1F5EE',
        'green-dark': '#0F6E56',
        'red-brand': '#E24B4A',
        'red-light': '#FCEBEB',
        'text-dark': '#1a1a18',
        'text-muted': '#5F5E5A',
        'text-hint': '#888780',
        'border-light': 'rgba(0,0,0,0.09)',
        background: '#FAFAF8',
        surface: '#F1EFE8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
} satisfies Config
