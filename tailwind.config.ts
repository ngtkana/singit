import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // OKLCHカラーを使用（原則に従う）
        primary: 'oklch(0.65 0.25 260)',
        secondary: 'oklch(0.75 0.15 180)',
        accent: 'oklch(0.70 0.20 330)',
      },
    },
  },
  plugins: [],
} satisfies Config;
