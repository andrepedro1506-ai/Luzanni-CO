import { useMemo, useState } from "react";
import { daysAgoIso, startOfMonthIso, todayIso } from "../lib/format";
import { useStore } from "../context/StoreContext";

export type PeriodOption = "hoje" | "7dias" | "mes";

export function usePeriod() {
  const [period, setPeriod] = useState<PeriodOption>("mes");
  const { selectedStoreId } = useStore();

  const range = useMemo(() => {
    const to = todayIso();
    const base = (() => {
      switch (period) {
        case "hoje":
          return { from: to, to };
        case "7dias":
          return { from: daysAgoIso(7), to };
        case "mes":
        default:
          return { from: startOfMonthIso(), to };
      }
    })();
    return { ...base, storeId: selectedStoreId };
  }, [period, selectedStoreId]);

  return { period, setPeriod, range };
}
