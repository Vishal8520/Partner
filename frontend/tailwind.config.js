import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'partner-slate': '#94A3B8', // Made brighter per user request (was #6F7E88)
        'partner-blue': '#364C5F',
        'partner-bronze': '#EABC6A',
        'partner-porcelain': '#FBFCF6',
        'partner-dark-slate': '#53616A',
      }
    },
  },
  plugins: [typography],
};
