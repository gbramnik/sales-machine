/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'from-primary-50',
    'via-white',
    'to-white',
    'bg-primary-600',
    'text-primary-600',
    'bg-purple-600',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#1E3A8A',
        },
        success: {
          50: '#ECFDF5',
          500: '#10B981',
          600: '#059669',
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
        },
        error: {
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
        },
        vip: {
          50: '#FFFBEB',
          500: '#D97706',
          600: '#B45309',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '56px', fontWeight: '700' }],
        'h1': ['36px', { lineHeight: '44px', fontWeight: '700' }],
        'h2': ['30px', { lineHeight: '38px', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px' }],
        'body': ['16px', { lineHeight: '24px' }],
        'body-sm': ['14px', { lineHeight: '20px' }],
        'caption': ['12px', { lineHeight: '16px' }],
      },
      spacing: {
        '18': '72px',
        '22': '88px',
      },
      boxShadow: {
        'focus': '0 0 0 4px rgba(37, 99, 235, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-down': 'slideDown 200ms ease-out',
        'fade-in': 'fadeIn 200ms ease-out',
      },
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
}

