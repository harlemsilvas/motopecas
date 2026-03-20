/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ff4500",
        dark: "#121212",
        "card-bg": "#1e1e1e",
        "text-light": "#f5f5f5",
        "text-gray": "#a0a0a0",
      },
    },
  },
  plugins: [],
};
