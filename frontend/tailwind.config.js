/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Bright Blue
          600: '#1d4ed8', // Royal / Deep Blue (from "Biz" & arrow)
          700: '#1e40af', // Deep Blue Hover
          800: '#1e3a8a', // Navy Accent
          900: '#172554',
          950: '#0f172a',
        },
        flow: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488', // Teal (from "Flow")
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        surface: '#FFFFFF',
        canvas: '#FAFAFA',
        subtle: '#E4E4E7',
        ink: {
          primary: '#18181B',
          secondary: '#71717A',
          tertiary: '#A1A1AA',
        },
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        'card': '12px',
      },
    },
  },
  plugins: [],
}
