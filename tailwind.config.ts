import type { Config } from "tailwindcss";
import flowbitePlugin from "flowbite/plugin";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      letterSpacing: {
        "ultra-wide": "0.8em",
      },
      fontFamily: {
        'alfa-slab': ['"Alfa Slab One"', 'serif'],
        'roboto-mono': ['"Roboto Mono"', 'monospace'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [
    flowbitePlugin,
  ],
};

export default config;