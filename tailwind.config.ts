import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      letterSpacing: {
        "ultra-wide": "0.8em",
      },
      fontFamily: {
        'alfa-slab': ['"Alfa Slab One"', 'serif'],
        'roboto-mono': ['"Roboto Mono"', 'monospace'],
        'monoton': ['var(--font-monoton)', 'cursive'],
        'tilt-neon': ['var(--font-tilt-neon)', 'cursive'],
        'orbitron': ['var(--font-orbitron)', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};

export default config;