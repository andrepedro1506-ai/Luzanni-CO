import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/Button";
import type { ExpenseGroup, Kind, Status } from "../lib/types";
import { todayIso } from "../lib/format";
import { useStore } from "../context/StoreContext";

interface ExpenseFormProps {
  groups: ExpenseGroup[];
  initialGroupId?: number;
  onClose: () => void;
  onSubmit: (data: {
    kind: Kind;
    description: string;
    amount: number;
    date: string;
    category_id: number;
    expense_group_id: number;
    status: Status;
    store_id: number;
  }) => Promise<void>;
}

export function ExpenseForm({ groups, initialGroupId, onClose, onSubmit }: ExpenseFormProps) {
  const { stores, selectedStoreId } = useStore();
  const [groupId, setGroupId] = useState<number | null>(initialGroupId ?? groups[0]?.id ?? null);
  const [storeId, setStoreId] = useState<number | null>(selectedStoreId ?? stores[0]?.id ?? null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso());
  const [status, setStatus] = useState<Status>("pago");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveStoreId = storeId ?? selectedStoreId ?? stores[0]?.id ?? null;

  if (groups.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold lowercase">nova despesa</h2>
            <button type="button" onClick={onClose} aria-label="fechar">
              <X className="size-5 text-text-secondary" />
            </button>
          </div>
          <p className="text-sm text-text-secondary lowercase">
            cadastre um grupo de despesa antes de lançar.
          </p>
          <div className="mt-5 flex justify-end">
            <Button type="button" variant="ghost" onClick={onClose}>
              fechar
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
    if (!groupId) {
      setError("selecione um grupo de despesa");
      return;
    }
    if (!effectiveStoreId) {
      setError("selecione uma loja");
      return;
    }

    const group = groups.find((g) => g.id === groupId);
    if (!group) {
      setError("grupo inválido");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        kind: "saida",
        description: description.trim(),
        amount: parsedAmount,
        date,
        category_id: group.category_id,
        expense_group_id: group.id,
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
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold lowercase">nova despesa</h2>
          <button type="button" onClick={onClose} aria-label="fechar">
            <X className="size-5 text-text-secondary" />
          </button>
        </div>

        <div className="space-y-3">
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
            <label className="mb-1 block text-xs lowercase text-text-secondary">grupo de despesa</label>
            <select
              value={groupId ?? ""}
              onChange={(e) => setGroupId(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs lowercase text-text-secondary">descrição</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="ex: conta de luz"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs lowercase text-text-secondary">valor (r$)</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="0,00"
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
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
