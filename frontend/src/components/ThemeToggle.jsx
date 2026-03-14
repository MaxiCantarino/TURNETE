import { useState, useEffect } from "react";

const THEMES = ["system", "light", "dark"];
const icons = { system: "💻", light: "☀️", dark: "🌙" };
const labels = { system: "Sistema", light: "Claro", dark: "Oscuro" };

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const next = () => {
    const idx = THEMES.indexOf(theme);
    const nextTheme = THEMES[(idx + 1) % THEMES.length];
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      onClick={next}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 text-xs font-semibold"
      style={{
        background: "rgba(124,58,237,0.2)",
        border: "1px solid rgba(124,58,237,0.35)",
        color: "rgba(180,158,255,0.9)",
      }}
    >
      <span>{icons[theme]}</span>
      <span>{labels[theme]}</span>
    </button>
  );
}
