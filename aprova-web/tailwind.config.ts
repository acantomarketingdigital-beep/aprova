import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'aprova-black': '#0A0A0A',
        'aprova-yellow': '#FFD700',
        'aprova-dark': '#111111',
        'aprova-border': '#2A2A2A',
        'aprova-muted': '#888888',
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'neon-yellow': '0 0 24px 4px rgba(255, 215, 0, 0.45)',
        'neon-yellow-sm': '0 0 12px 2px rgba(255, 215, 0, 0.3)',
      },
      borderRadius: {
        '2xl': '16px',
      },
    },
  },
  plugins: [],
};

export default config;
