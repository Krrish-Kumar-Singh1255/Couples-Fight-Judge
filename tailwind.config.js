/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1a1f3c",
        gold: "#f0c040",
      },
      fontFamily: {
        serif: ["serif"],
      },
    },
  },
  plugins: [],
}
