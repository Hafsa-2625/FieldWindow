import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#E9ECE3",
        ink: "#1B2B1E",
        canopy: "#2F5233",
        moss: "#3F6B44",
        soil: "#4A3A2C",
        ochre: "#B7852E",
        sky: "#5B84A6",
        frost: "#C7D6DC",
        alert: "#B5472B",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-plex)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
