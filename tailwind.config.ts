import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        bevel: "inset 0 2px 0 rgba(255,255,255,.35), inset 0 -4px 0 rgba(0,0,0,.22), 0 4px 0 rgba(0,0,0,.35)",
        panel: "0 14px 28px rgba(0,0,0,.28)",
      },
      fontFamily: {
        display: ["Trebuchet MS", "Verdana", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
