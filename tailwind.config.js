/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'fadeIn': 'fadeIn 1s ease-out',
        'pulse-neon': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at center, rgba(14, 165, 233, 0.15), transparent 60%)',
        'glass-gradient': 'linear-gradient(to right bottom, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.3))'
      },
      colors: {
        'primary': '#8B5CF6',
        'secondary': '#A78BFA',
        'accent': '#C4B5FD',
        'light': '#F8FAFC',
        'light-darker': '#E2E8F0',
        'dark': '#1E293B',
        'accent-1': '#7C3AED',
        'accent-2': '#6D28D9',
        'accent-3': '#5B21B6',
        'slate-blue': '#64748B',
        'slate-purple': '#6B7280',
        'slate-green': '#4B5563'
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'medium': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.25)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.5)'
      },
      backgroundSize: {
        '200': '200% 100%'
      },
      backgroundPosition: {
        '100': '100% 0%'
      },
      dropShadow: {
        'soft': '0 1px 2px rgb(0 0 0 / 0.1)',
        'medium': '0 4px 3px rgb(0 0 0 / 0.07)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.25)'
      },
      backdropBlur: {
        'glass': '16px'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}