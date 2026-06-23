/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6C63FF",

        backgroundLight: "#F4F6FA",
        backgroundDark: "#1E1E1E",

        blue: "#3882F6",
        green: "#9AD872",
        pink: "#FF689D",

        grey: "#8A8A8A",
        white: "#FFFFFF",

        textPrimaryLight: "#2A2A2A",
        textPrimaryDark: "#FFFFFF",
        textSecondary: "#B0B0B0",

        surface: "#2A2A2A",
        border: "#3A3A3A",
      },
    },
  },
  plugins: [],
};
