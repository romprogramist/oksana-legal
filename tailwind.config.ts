import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E4D8C",
          light: "#2966B3",
          dark: "#163B6C",
        },
        accent: {
          DEFAULT: "#C9A99B",
          light: "#D9C4B9",
          dark: "#B08A7A",
        },
        background: "#F2F0ED",
        surface: "#FFFFFF",
        text: {
          primary: "#1A1A1A",
          secondary: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 4px 20px -4px rgba(0, 0, 0, 0.08)",
        medium: "0 8px 30px -8px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
