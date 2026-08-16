import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/Button";
import type { Category, Kind, Status } from "../lib/types";
import { todayIso } from "../lib/format";
import { useStore } from "../context/StoreContext";

interface TransactionFormProps {
  categories: Category[];
  onClose: () => void;
  onSubmit: (data: {
    kind: Kind;
    description: string;
    amount: number;
    date: string;
    category_id: number;
    status: Status;
    store_id: number;
  }) => Promise<void>;
}

export function TransactionForm({ categories, onClose, onSubmit }: TransactionFormProps) {
  const { stores, selectedStoreId } = useStore();
  const [kind, setKind] = useState<Kind>("entrada");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso());
  const [status, setStatus] = useState<Status>("pago");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [storeId, setStoreId] = useState<number | null>(selectedStoreId ?? stores[0]?.id ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCategories = categories.filter((c) => c.kind === kind);
  const effectiveCategoryId = categoryId ?? filteredCategories[0]?.id ?? null;
  const effectiveStoreId = storeId ?? selectedStoreId ?? stores[0]?.id ?? null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsedAmount = Number(amount.replace(",", "."));
    if (!description.trim()) {
      setError("informe uma descrição");
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setError("informe um valor válido");
      return;
    }
    if (!effectiveCategoryId) {
      setError("selecione uma categoria");
      return;
    }
    if (!effectiveStoreId) {
      setError("selecione uma loja");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        kind,
        description: description.trim(),
        amount: parsedAmount,
        date,
        category_id: effectiveCategoryId,
        status,
        store_id: effectiveStoreId,
      });
      onClose();
    } catch {
      setError("erro ao salvar. tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold lowercase">nova transação</h2>
          <button type="button" onClick={onClose} aria-label="fechar">
            <X className="size-5 text-text-secondary" />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setKind("entrada");
              setCategoryId(null);
            }}
            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold lowercase ${
              kind === "entrada"
                ? "border-primary bg-primary-dim text-primary"
                : "border-border text-text-secondary"
            }`}
          >
            entrada
          </button>
          <button
            type="button"
            onClick={() => {
              setKind("saida");
              setCategoryId(null);
            }}
            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold lowercase ${
              kind === "saida"
                ? "border-danger bg-[#3a1414] text-danger"
                : "border-border text-text-secondary"
            }`}
          >
            saída
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs lowercase text-text-secondary">descrição</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="ex: venda loja 01"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs lowercase text-text-secondary">valor (r$)</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs lowercase text-text-secondary">data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs lowercase text-text-secondary">loja</label>
            <select
              value={effectiveStoreId ?? ""}
              onChange={(e) => setStoreId(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs lowercase text-text-secondary">categoria</label>
            <select
              value={effectiveCategoryId ?? ""}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs lowercase text-text-secondary">status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus("pago")}
                className={`rounded-xl border px-4 py-2 text-sm lowercase ${
                  status === "pago" ? "border-primary text-primary" : "border-border text-text-secondary"
                }`}
              >
                pago
              </button>
              <button
                type="button"
                onClick={() => setStatus("pendente")}
                className={`rounded-xl border px-4 py-2 text-sm lowercase ${
                  status === "pendente" ? "border-warning text-warning" : "border-border text-text-secondary"
                }`}
              >
                pendente
              </button>
            </div>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-danger lowercase">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "salvando..." : "salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
