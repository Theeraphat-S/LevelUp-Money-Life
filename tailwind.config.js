/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        panel: "0 8px 24px oklch(24% 0.04 255 / 0.10)",
      },
    },
  },
  plugins: [],
};
