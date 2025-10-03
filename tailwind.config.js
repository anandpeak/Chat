/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        custom: "2px 2px 40px 0px rgba(0, 0, 0, 0.07)",
      },
      keyframes: {
        "dot-bounce-high": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "dot-bounce-high": "dot-bounce-high 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
