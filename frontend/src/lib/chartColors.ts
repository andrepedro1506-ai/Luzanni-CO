import { useTheme } from "../context/ThemeContext";

const CHART_COLORS = {
  light: {
    tooltipBg: "#ffffff",
    tooltipBorder: "#e1e6da",
    text: "#14180f",
    tick: "#656f5c",
    grid: "#e1e6da",
    cursor: "#eef1e8",
    primary: "#0d9488",
  },
  dark: {
    tooltipBg: "#111815",
    tooltipBorder: "#1f2a24",
    text: "#f5f7f6",
    tick: "#8b958f",
    grid: "#1f2a24",
    cursor: "#161f1b",
    primary: "#2dd4bf",
  },
};

export function useChartColors() {
  const { theme } = useTheme();
  return CHART_COLORS[theme];
}
