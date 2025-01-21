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
        default: {
          primary: "#447dee",
          "primary-focus": "#3960d5",
          "primary-content": "#f0f0ff",
          secondary: "#4aabe8",
          "secondary-focus": "#3c8ecd",
          "secondary-content": "#f5fbff",
          accent: "#2edcff",
          "accent-focus": "#2cbfdd",
          "accent-content": "#424242",
          neutral: "#1a1a1a",
          "neutral-focus": "#000000",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f5f5f5",
          "base-300": "#ebebeb",
          "base-content": "#000000",
          info: "#4a77bf",
          success: "#348f32",
          warning: "#ed7635",
          error: "#e83d30",
          "--rounded-box": "1rem",
          "--rounded-btn": ".5rem",
          "--rounded-badge": "1.9rem",
          "--animation-btn": ".25s",
          "--animation-input": ".2s",
          "--btn-text-case": "uppercase",
          "--navbar-padding": ".5rem",
          "--border-btn": "1px"
        }
      },
      "light",
      "dark"
    ]
  }
}
