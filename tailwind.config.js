/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'SF Pro Display',
          'SF Pro Text',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif'
        ],
        'display': ['SF Pro Display', 'sans-serif'],
        'text': ['SF Pro Text', 'sans-serif'],
      },
      fontSize: {
        // Display & Headings (Semantic Typography)
        'display-lg': ['48px', { lineHeight: '56px', fontWeight: '700', letterSpacing: '-0.5px' }],
        'heading-1': ['30px', { lineHeight: '36px', fontWeight: '700', letterSpacing: '-0.5px' }],
        'heading-2': ['24px', { lineHeight: '32px', fontWeight: '700', letterSpacing: '-0.3px' }],
        'heading-3': ['20px', { lineHeight: '28px', fontWeight: '600', letterSpacing: '-0.2px' }],
        'heading-4': ['18px', { lineHeight: '26px', fontWeight: '600' }],

        // Body Text (Semantic Typography)
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '18px', fontWeight: '400' }],
        'body-xs': ['10px', { lineHeight: '16px', fontWeight: '400' }],
      },
      colors: {
        // iOS Native Colors
        'ios-blue': '#007AFF',
        'ios-blue-dark': '#0056CC',
        'ios-gray': '#8E8E93',
        'ios-light-gray': '#F2F2F7',
        'ios-border': '#C6C6C8',
        'ios-background': '#FFFFFF',
        'ios-text': '#000000',
        'ios-text-secondary': '#3C3C43',
        'ios-text-tertiary': '#3C3C4399',

        // Semantic Text Colors
        text: {
          primary: '#1F2937',    // gray-900 - Main headings, primary content
          secondary: '#374151',  // gray-700 - Secondary content, descriptions
          tertiary: '#6B7280',   // gray-600 - Less important text
          muted: '#9CA3AF',      // gray-500 - Placeholders, disabled text, labels
          subtle: '#D1D5DB',     // gray-400 - Very subtle text
        },

        // Semantic Accent Colors
        accent: {
          DEFAULT: '#3B82F6',    // blue-500 - Links, interactive elements
          hover: '#2563EB',      // blue-600 - Hover state
          success: '#10B981',    // green-600 - Success states
          error: '#EF4444',      // red-600 - Error states
          warning: '#F59E0B',    // amber-500 - Warning states
        },
        'tracking-blue': '#216477',
      },
      boxShadow: {
        'ios-button': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'ios-input': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'button': '0 1px 2px rgba(0, 0, 0, 0.1)',
        'card': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'modal': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'ios': '16px',
        'ios-sm': '12px',
        'ios-lg': '20px',
        'ios-xl': '24px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
