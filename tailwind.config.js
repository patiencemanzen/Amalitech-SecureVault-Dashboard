export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        vault: {
          950: '#050810',
          900: '#080d1a',
          800: '#0c1225',
          700: '#0f1629',
          600: '#1a2744',
          500: '#243355',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
