/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        surface: {
          DEFAULT: "#0f172a",
          card: "#1e293b",
          elevated: "#334155",
        },
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        accent: "#a855f7",
      },
      fontFamily: {
        sans: ["Inter", "system-ui"],
        mono: ["JetBrainsMono", "monospace"],
      },
    },
  },
  plugins: [],
};
