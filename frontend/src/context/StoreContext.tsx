import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../lib/api";
import type { Store } from "../lib/types";

const STORAGE_KEY = "luzanni-fin:selected-store";

interface StoreContextValue {
  stores: Store[];
  loading: boolean;
  selectedStoreId: number | null;
  selectedStore: Store | null;
  setSelectedStoreId: (id: number | null) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStoreId, setSelectedStoreIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? Number(stored) : null;
  });

  useEffect(() => {
    api.stores.list().then((data) => {
      setStores(data);
      setLoading(false);
    });
  }, []);

  function setSelectedStoreId(id: number | null) {
    setSelectedStoreIdState(id);
    if (id) localStorage.setItem(STORAGE_KEY, String(id));
    else localStorage.removeItem(STORAGE_KEY);
  }

  const selectedStore = stores.find((s) => s.id === selectedStoreId) ?? null;

  return (
    <StoreContext.Provider value={{ stores, loading, selectedStoreId, selectedStore, setSelectedStoreId }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore deve ser usado dentro de StoreProvider");
  return ctx;
}
