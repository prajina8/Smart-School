/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "rgb(250, 246, 239)",
        espresso: "rgb(60, 48, 37)",
        sage: "rgb(138, 133, 112)",
        terracotta: {
          50: "rgb(250, 238, 231)",
          100: "rgb(245, 220, 204)",
          200: "rgb(240, 189, 165)",
          300: "rgb(233, 153, 123)",
          400: "rgb(224, 118, 82)",
          500: "rgb(216, 90, 48)",
          600: "rgb(184, 74, 37)",
          700: "rgb(153, 60, 29)",
          800: "rgb(122, 47, 23)",
          900: "rgb(90, 35, 17)",
        },
      
        brand: {
          50: "rgb(250, 238, 231)",
          100: "rgb(245, 220, 204)",
          200: "rgb(240, 189, 165)",
          300: "rgb(233, 153, 123)",
          400: "rgb(224, 118, 82)",
          500: "rgb(216, 90, 48)",
          600: "rgb(184, 74, 37)",
          700: "rgb(153, 60, 29)",
          800: "rgb(122, 47, 23)",
          900: "rgb(90, 35, 17)",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};