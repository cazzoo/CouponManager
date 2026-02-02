/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors to match MUI theme
        primary: {
          DEFAULT: '#2e7d32', // MUI green primary
          dark: '#1b5e20',
          light: '#66bb6a',
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter"
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
  },
}
