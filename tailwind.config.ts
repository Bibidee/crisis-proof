import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "crisis-black": "#07090D",
        redline: "#E11D48",
        "emergency-amber": "#F59E0B",
        "legal-blue": "#2563EB",
        "cold-white": "#F8FAFC",
        "evidence-grey": "#64748B",
        "panel-charcoal": "#111827",
        "deep-slate": "#1E293B",
        "trust-green": "#16A34A",
        "warning-rose": "#BE123C",
        "border-steel": "#334155",
        "muted-text": "#94A3B8",
      },
      fontFamily: {
        grotesk: ["Space Grotesk", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
