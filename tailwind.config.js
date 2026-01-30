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
      {
        light: {
          "primary": "#2e7d32",
          "primary-focus": "#1b5e20",
          "primary-content": "#ffffff",
          "secondary": "#edf2f7",
          "secondary-focus": "#e2e8f0",
          "secondary-content": "#1a202c",
          "accent": "#4c51bf",
          "accent-focus": "#667eea",
          "accent-content": "#ffffff",
          "neutral": "#3d4451",
          "neutral-focus": "#2d313a",
          "neutral-content": "#ffffff",
          "base-100": "#f5f5f5", // MUI light background default
          "base-200": "#e8e8e8", // MUI light background paper
          "base-300": "#c5c5c5",
          "base-content": "#1f2937",
          "info": "#3abff8",
          "success": "#2e7d32",
          "warning": "#f59e0b",
          "error": "#f43f5e",
        },
        dark: {
          "primary": "#66bb6a", // MUI dark theme green
          "primary-focus": "#4caf50",
          "primary-content": "#ffffff",
          "secondary": "#2d3748",
          "secondary-focus": "#1a202c",
          "secondary-content": "#e2e8f0",
          "accent": "#7f9cf5",
          "accent-focus": "#667eea",
          "accent-content": "#ffffff",
          "neutral": "#3d4451",
          "neutral-focus": "#2d313a",
          "neutral-content": "#e5e7eb",
          "base-100": "#303030", // MUI dark background default
          "base-200": "#424242", // MUI dark background paper
          "base-300": "#525252",
          "base-content": "#f3f4f6",
          "info": "#3abff8",
          "success": "#66bb6a",
          "warning": "#fbbf24",
          "error": "#f87171",
        },
      },
    ],
    darkTheme: "dark", // default dark theme
    base: true, // apply base styles
    styled: true, // apply component styles
    utils: true, // apply utility classes
  },
}
