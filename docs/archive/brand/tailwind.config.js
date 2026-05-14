/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      colors: {
        aqliya: {
          deep: '#0A0F24',
          indigo: '#1E3A8A',
          blue: '#2563EB',
          cyan: '#0EA5E9',
        },
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E3A8A',
          800: '#1E3A8A',
          900: '#0A0F24',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'IBM Plex Sans Arabic',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        heading: [
          'Plus Jakarta Sans',
          'Cairo',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'monospace',
        ],
      },
      fontSize: {
        'display': ['3.052rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'h1': ['2.441rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        'h2': ['1.953rem', { lineHeight: '1.2' }],
        'h3': ['1.563rem', { lineHeight: '1.3' }],
        'h4': ['1.25rem', { lineHeight: '1.4' }],
        'h5': ['1rem', { lineHeight: '1.4' }],
        'h6': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.05em', textTransform: 'uppercase' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'aqliya-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'aqliya-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'aqliya-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'aqliya-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      transitionDuration: {
        'instant': '0ms',
        'fast': '100ms',
        'base': '150ms',
        'slow': '250ms',
        'slower': '350ms',
        'slowest': '500ms',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      zIndex: {
        'dropdown': '100',
        'sticky': '200',
        'overlay': '300',
        'modal': '400',
        'popover': '500',
        'tooltip': '600',
        'toast': '700',
      },
      keyframes: {
        'skeleton-loading': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'spin': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        'pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fade-in-up': {
          'from': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'slide-in-right': {
          'from': {
            opacity: '0',
            transform: 'translateX(100%)',
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
      animation: {
        'skeleton': 'skeleton-loading 1.5s ease-in-out infinite',
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 300ms ease-out',
        'slide-in-right': 'slide-in-right 250ms ease-out',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0A0F24 0%, #1E3A8A 50%, #2563EB 100%)',
        'gradient-ai': 'linear-gradient(135deg, #1E3A8A 0%, #0EA5E9 100%)',
        'gradient-trust': 'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)',
        'gradient-subtle': 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
      },
    },
  },
  plugins: [],
}
