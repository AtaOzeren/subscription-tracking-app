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
      },
      colors: {
        'ios-blue': '#007AFF',
        'ios-blue-dark': '#0056CC',
        'ios-gray': '#8E8E93',
        'ios-light-gray': '#F2F2F7',
        'ios-border': '#C6C6C8',
        'ios-background': '#FFFFFF',
        'ios-text': '#000000',
        'ios-text-secondary': '#3C3C43',
        'ios-text-tertiary': '#3C3C4399',
      },
      boxShadow: {
        'ios-button': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'ios-input': '0 1px 2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'ios': '16px',
        'ios-sm': '12px',
        'ios-lg': '20px',
        'ios-xl': '24px',
      },
    },
  },
  plugins: [],
}
