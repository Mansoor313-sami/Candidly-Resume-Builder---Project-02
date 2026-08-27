import type { Config } from "tailwindcss";

/**
 * Tailwind theme for Candidly.
 *
 * Colors are driven by CSS variables (defined in globals.css) so the whole UI
 * can flip between light and dark by toggling the `.dark` class on <html>.
 * Each token is stored as an "R G B" triplet and consumed with
 * `rgb(var(--token) / <alpha-value>)`, which keeps Tailwind opacity modifiers
 * working (e.g. `bg-brand/10`, `text-ink/70`).
 */
const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      colors: {
        // App chrome tokens (theme-aware)
        surface: withAlpha("--surface"),
        card: withAlpha("--card"),
        line: withAlpha("--border"),
        ink: withAlpha("--text"),
        muted: withAlpha("--muted"),
        // Brand accents (theme-aware for correct contrast in each mode)
        brand: {
          DEFAULT: withAlpha("--brand"),
          soft: withAlpha("--brand-soft"),
        },
        brand2: withAlpha("--brand-2"),
        brand3: withAlpha("--brand-3"),
      },
      boxShadow: {
        soft: "0 14px 45px -12px rgb(var(--shadow) / 0.5)",
        glow: "0 0 0 1px rgb(var(--brand) / 0.25), 0 18px 50px -12px rgb(var(--brand) / 0.45)",
        card: "0 1px 2px rgb(var(--shadow) / 0.35), 0 22px 60px -30px rgb(var(--shadow) / 0.7)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float-slow": {
          "0%,100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-26px) translateX(14px)" },
        },
        "gradient-pan": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up .6s cubic-bezier(.2,.7,.3,1) both",
        "float-slow": "float-slow 14s ease-in-out infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
        shimmer: "shimmer 1.6s infinite",
        "spin-slow": "spin-slow 1s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
