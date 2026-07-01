/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#09090b",
        panel: "#131316",
        line: "#27272a",
        wave: "#1ed760",
        coral: "#fb7185",
        azure: "#38bdf8"
      },
      boxShadow: {
        glow: "0 16px 40px rgba(30, 215, 96, 0.16)"
      }
    }
  },
  plugins: []
};
