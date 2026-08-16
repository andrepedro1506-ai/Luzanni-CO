import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { useStore } from "../context/StoreContext";

export function StoreSelector() {
  const { stores, selectedStoreId, selectedStore, setSelectedStoreId } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium lowercase text-text-primary hover:bg-surface-hover"
      >
        <MapPin className="size-4 text-text-secondary" />
        {selectedStore ? selectedStore.name : "todas as lojas"}
        <ChevronDown className="size-4 text-text-secondary" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-56 rounded-xl border border-border bg-surface p-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setSelectedStoreId(null);
              setOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm lowercase text-text-primary hover:bg-surface-hover"
          >
            todas as lojas
            {selectedStoreId === null && <Check className="size-4 text-primary" />}
          </button>
          {stores.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setSelectedStoreId(s.id);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm lowercase text-text-primary hover:bg-surface-hover"
            >
              {s.name}
              {selectedStoreId === s.id && <Check className="size-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
