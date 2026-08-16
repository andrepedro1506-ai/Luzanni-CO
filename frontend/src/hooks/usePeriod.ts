import { useMemo, useState } from "react";
import { daysAgoIso, startOfMonthIso, todayIso } from "../lib/format";

export type PeriodOption = "hoje" | "7dias" | "mes";

export function usePeriod() {
  const [period, setPeriod] = useState<PeriodOption>("mes");

  const range = useMemo(() => {
    const to = todayIso();
    switch (period) {
      case "hoje":
        return { from: to, to };
      case "7dias":
        return { from: daysAgoIso(7), to };
      case "mes":
      default:
        return { from: startOfMonthIso(), to };
    }
  }, [period]);

  return { period, setPeriod, range };
}
