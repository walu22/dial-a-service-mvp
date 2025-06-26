/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(59 130 246)',
          light: 'rgb(100 163 255)',
          dark: 'rgb(14 116 234)',
          hover: 'rgb(37 99 235)',
        },
        background: 'rgb(249 250 252)',
        surface: 'rgb(255 255 255)',
        text: {
          primary: 'rgb(31 41 55)',
          secondary: 'rgb(75 85 99)',
        },
        border: 'rgb(229 231 235)',
        shadow: 'rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'primary': '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
        'primary-lg': '0 10px 15px -3px rgba(59, 130, 246, 0.1)',
      },
    },
  },
  plugins: [],
}
