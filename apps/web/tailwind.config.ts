import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Fuente DM Sans usando next/font/local (variable CSS)
        'dm-sans': ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        'dm-regular': '400',   // DM Sans Regular
        'dm-medium': '500',    // DM Sans Medium  
        'dm-black': '900',     // DM Sans Black
      },
      colors: {
        // Colores originales de CrediAuto
        'credi-blue': '#2e3192',
        'credi-yellow': '#ffc20e',
        
        // Colores de la nueva landing page
        'landing-blue': '#1E2480',
        'landing-yellow': '#FFC107',
        
        // Colores adicionales para compatibilidad
        primary: {
          DEFAULT: '#2e3192',
          50: '#f0f0ff',
          100: '#e0e0ff',
          500: '#2e3192',
          600: '#252780',
          700: '#1c1d60',
        },
        secondary: {
          DEFAULT: '#ffc20e',
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#ffc20e',
          600: '#d69e0b',
          700: '#b7791f',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
