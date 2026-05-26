/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#085041',
          mid:  '#1D9E75',
          light: '#5BC89A',
        },
        warn:   '#EF9F27',
        danger: '#E24B4A',
      },
      maxWidth: {
        mobile: '390px',
      },
    },
  },
  plugins: [],
}
