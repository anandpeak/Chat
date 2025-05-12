/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        custom: "2px 2px 40px 0px rgba(0, 0, 0, 0.07)",
      },
    },
  },
  plugins: [],
};
