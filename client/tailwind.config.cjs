/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false,
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#f46a25",
        "primary-dark": "#d14e10",
        "background-light": "#f8f6f5",
        "background-dark": "#221610",
        azulejo: "#2c4c6e",
        "azulejo-light": "#eef4fa",
        // "surface-light": "#ffffff",
        // "surface-dark": "#2d1e17",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
