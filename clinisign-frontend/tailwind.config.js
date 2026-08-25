/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sian: {
          50:  "#e6f4f1",
          100: "#c0e4dd",
          200: "#87ccbf",
          300: "#4fb3a1",
          400: "#1f9e88",
          500: "#00897b",  // Verde SIAN SALUD principal
          600: "#007a6d",
          700: "#006860",
          800: "#005751",
          900: "#00403c",
        },
        accent: {
          500: "#26c6da",  // Cian acento
          600: "#00acc1",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
