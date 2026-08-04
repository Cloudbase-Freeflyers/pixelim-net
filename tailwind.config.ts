import type { Config } from "tailwindcss";

const config: Config = {
  // Scoped to the admin panel only — the public pages use inline styles, not
  // Tailwind, and their Tailwind CSS (incl. preflight) must not load site-wide.
  content: [
    "./app/admin/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/admin/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#DD107B",
        "primary-dark": "#b80d65",
        "primary-light": "#f5d0e4",
        secondary: "#0093DD",
        "secondary-dark": "#0078b5",
        "text-color": "#1a1a2e",
        "text-light": "#64748b",
        "bg-light": "#f8fafc",
        "bg-dark": "#0f0f1a",
        success: "#16a34a",
        "border-color": "#e2e8f0",
        gold: "#f59e0b",
      },
      fontFamily: {
        assistant: ["var(--font-assistant)", "sans-serif"],
      },
      maxWidth: {
        container: "1200px",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        ticker: "ticker 30s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-pattern":
          "linear-gradient(135deg, #DD107B 0%, #0093DD 100%)",
      },
      boxShadow: {
        glow: "0 0 30px rgba(221, 16, 123, 0.25)",
        "glow-blue": "0 0 30px rgba(0, 147, 221, 0.25)",
        card: "0 4px 24px rgba(0,0,0,0.08)",
        "card-hover": "0 12px 40px rgba(0,0,0,0.14)",
      },
    },
  },
  plugins: [],
};
export default config;
