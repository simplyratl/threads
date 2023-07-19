import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  daisyui: {
    themes: false,
  },
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        accent: "hsl(var(--accent))",
        background_overlay: "hsla(var(--background), 0.8)",
        border_color: "hsl(var(--border-color))",
        button_bg: "hsl(var(--button-bg))",
      },
    },
  },
  plugins: [require("daisyui")],
} satisfies Config;
