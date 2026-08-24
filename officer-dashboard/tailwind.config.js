/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rail: {
          dark: "#0a0e17",
          panel: "#121826",
          border: "#1f293d",
          accent: "#0ea5e9", // Teal/Cyan Electric
          amber: "#f59e0b",
          danger: "#ef4444",
          success: "#10b981",
          text: "#f1f5f9",
          muted: "#94a3b8"
        }
      }
    },
  },
  plugins: [],
}
