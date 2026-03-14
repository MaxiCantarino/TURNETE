/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f0ff",
          100: "#e9e3ff",
          200: "#d4c9ff",
          300: "#b49eff",
          400: "#9066ff",
          500: "#7c3aed",
          600: "#6d28d9",
          700: "#5b21b6",
          800: "#4c1d95",
          900: "#3b0764",
          950: "#2e0550",
        },
        dark: {
          50: "#f8f7ff",
          100: "#f0eeff",
          200: "#e2deff",
          300: "#c9c2f5",
          400: "#a89fd4",
          500: "#7b72a8",
          600: "#564e80",
          700: "#3d3660",
          800: "#272050",
          900: "#15103a",
          950: "#0a0820",
        },
        surface: {
          DEFAULT: "#1a1535",
          card: "#211c42",
          hover: "#2a2456",
          border: "#332d6e",
          input: "#1e1940",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neu: "6px 6px 14px #0d0b26, -4px -4px 10px #221d4a",
        "neu-sm": "3px 3px 8px #0d0b26, -2px -2px 6px #221d4a",
        "neu-in": "inset 4px 4px 10px #0d0b26, inset -3px -3px 8px #221d4a",
        "neu-light": "4px 4px 10px #d1cbf0, -4px -4px 10px #ffffff",
        glow: "0 0 24px rgba(124,58,237,0.45)",
        "glow-sm": "0 0 12px rgba(124,58,237,0.3)",
        card: "0 4px 24px rgba(0,0,0,0.35)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.35s ease-out",
        "scale-in": "scaleIn 0.25s ease-out",
        "glow-pulse": "glowPulse 2.5s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: { "0%": { transform: "scale(0.96)", opacity: "0" }, "100%": { transform: "scale(1)", opacity: "1" } },
        glowPulse: {
          "0%,100%": { boxShadow: "0 0 12px rgba(124,58,237,0.3)" },
          "50%": { boxShadow: "0 0 28px rgba(124,58,237,0.6)" },
        },
        shimmer: { "0%": { backgroundPosition: "-1000px 0" }, "100%": { backgroundPosition: "1000px 0" } },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
    },
  },
  plugins: [],
};
