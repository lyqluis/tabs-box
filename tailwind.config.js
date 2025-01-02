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
  plugins: [require("daisyui"), require("tailwindcss-animated")],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#33569a",
          "primary-content": "#e0eef9",
          secondary: "#417dcf",
          "secondary-content": "#e0eef9",
          accent: "#a2ceee",
          "accent-content": "#0a0f14",
          neutral: "#202f4b",
          "neutral-content": "#e0eef9",
          "base-100": "#ffffff",
          "base-200": "#dedede",
          "base-300": "#bebebe",
          "base-content": "#161616",
          info: "#bae6fd",
          "info-content": "#0d1316",
          success: "#d1fae5",
          "success-content": "#101512",
          warning: "#fde68a",
          "warning-content": "#161410",
          error: "#fecaca",
          "error-content": "#160f0f"
        }
      },
      "dark"
    ]
  }
}
