/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sih: {
          blue: "#0072BC",
          darkBlue: "#005A9C",
          orange: "#F58220",
          lightOrange: "#F9A65A",
          dark: "#1F2937",
          gray: "#F3F5F7",
        }
      },
      fontFamily: {
        display: ['var(--font-anton)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      transitionTimingFunction: {
        'emil': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      spacing: {
        // UI-UX Pro Max spacing & touch targets
        'touch': '44px',
      }
    },
  },
  plugins: [],
};
export default config;
