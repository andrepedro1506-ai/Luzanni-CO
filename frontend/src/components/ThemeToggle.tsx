import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-2">
      <Sun className="size-4 text-text-secondary" />
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? "mudar para tema claro" : "mudar para tema escuro"}
        onClick={toggleTheme}
        className="relative h-6 w-11 shrink-0 rounded-full bg-primary transition-colors"
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
            isDark ? "left-[1.375rem]" : "left-0.5"
          }`}
        />
      </button>
      <Moon className="size-4 text-text-secondary" />
    </div>
  );
}
