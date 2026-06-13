import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'nexus-slate': '#94A3B8', // Made brighter per user request (was #6F7E88)
        'nexus-blue': '#364C5F',
        'nexus-bronze': '#EABC6A',
        'nexus-porcelain': '#FBFCF6',
        'nexus-dark-slate': '#53616A',
      }
    },
  },
  plugins: [typography],
};
