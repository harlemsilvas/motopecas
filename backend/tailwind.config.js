// tailwind.config.js
module.exports = {
  content: [
    "./admin/**/*.html",
    "./admin/**/*.js",
    "./admin/components/*.js",
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
