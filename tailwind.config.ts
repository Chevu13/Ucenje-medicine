import type { Config } from 'tailwindcss';

/**
 * Design system — "Učenje medicine"
 * Source of truth: brand presentation (electric blue ECG pulse + light blue wordmark).
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary electric blue (logo "UČENJE" + ECG line)
        brand: {
          50: '#EBF2FF',
          100: '#D6E4FF',
          200: '#ADC9FF',
          300: '#85ADFF',
          400: '#4D86FF',
          500: '#1F63FF',
          600: '#0052FF',
          700: '#0041CC',
          800: '#003199',
          900: '#062066',
        },
        // Light blue accent (logo "MEDICINE")
        skyblue: {
          DEFAULT: '#9CC3FF',
          soft: '#C7DBFF',
        },
        // Dark navy text
        ink: {
          DEFAULT: '#0B1B3B',
          soft: '#3A4A6B',
          muted: '#69769B',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F5F8FF',
          blue: '#EBF2FF',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11, 27, 59, 0.06), 0 8px 24px rgba(11, 27, 59, 0.08)',
        lift: '0 2px 4px rgba(0, 82, 255, 0.08), 0 12px 32px rgba(0, 82, 255, 0.16)',
      },
      keyframes: {
        'ekg-draw': {
          '0%': { strokeDashoffset: '600' },
          '60%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        'ekg-draw': 'ekg-draw 3.2s ease-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
