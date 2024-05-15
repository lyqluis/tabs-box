/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: ["./**/*.tsx"],
  theme: {
    extend: {
      colors: {
        danube: {
          50: "#f1f7fd",
          100: "#e0eef9",
          200: "#c8e1f5",
          300: "#a2ceee",
          400: "#76b3e4",
          500: "#639fde",
          600: "#417dcf",
          700: "#3869bd",
          800: "#33569a",
          900: "#2d497b",
          950: "#202f4b"
        }
      }
    }
  },
  plugins: []
}
