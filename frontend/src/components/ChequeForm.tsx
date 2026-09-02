import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/Button";
import type { ChequeKind } from "../lib/types";
import { todayIso } from "../lib/format";
import { useStore } from "../context/StoreContext";

interface ChequeFormProps {
  onClose: () => void;
  onSubmit: (data: {
    kind: ChequeKind;
    numero: string;
    valor: number;
    data_vencimento: string;
    contraparte: string;
    store_id: number;
    notes?: string;
  }) => Promise<void>;
}

export function ChequeForm({ onClose, onSubmit }: ChequeFormProps) {
  const { stores, selectedStoreId } = useStore();
  const [kind, setKind] = useState<ChequeKind>("recebido");
  const [storeId, setStoreId] = useState<number | null>(selectedStoreId ?? stores[0]?.id ?? null);
  const [numero, setNumero] = useState("");
  const [valor, setValor] = useState("");
  const [dataVencimento, setDataVencimento] = useState(todayIso());
  const [contraparte, setContraparte] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveStoreId = storeId ?? selectedStoreId ?? stores[0]?.id ?? null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedValor = Number(valor.replace(",", "."));

    if (!numero.trim()) {
      setError("informe o número do cheque");
      return;
    }
    if (!parsedValor || parsedValor <= 0) {
      setError("informe um valor válido");
      return;
    }
    if (!contraparte.trim()) {
      setError("informe quem emitiu/recebeu o cheque");
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
        numero: numero.trim(),
        valor: parsedValor,
        data_vencimento: dataVencimento,
        contraparte: contraparte.trim(),
        store_id: effectiveStoreId,
        notes: notes.trim() || undefined,
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
          <h2 className="text-lg font-bold lowercase">novo cheque</h2>
          <button type="button" onClick={onClose} aria-label="fechar">
            <X className="size-5 text-text-secondary" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs lowercase text-text-secondary">tipo</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setKind("recebido")}
                className={`rounded-xl border px-4 py-2.5 text-sm lowercase ${
                  kind === "recebido"
                    ? "border-primary bg-primary-dim text-primary"
                    : "border-border text-text-secondary"
                }`}
              >
                recebido
              </button>
              <button
                type="button"
                onClick={() => setKind("emitido")}
                className={`rounded-xl border px-4 py-2.5 text-sm lowercase ${
                  kind === "emitido"
                    ? "border-primary bg-primary-dim text-primary"
                    : "border-border text-text-secondary"
                }`}
              >
                emitido
              </button>
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs lowercase text-text-secondary">
                número do cheque
              </label>
              <input
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="ex: 000123"
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs lowercase text-text-secondary">valor (r$)</label>
              <input
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                inputMode="decimal"
                placeholder="0,00"
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs lowercase text-text-secondary">
              data de vencimento
            </label>
            <input
              type="date"
              value={dataVencimento}
              onChange={(e) => setDataVencimento(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs lowercase text-text-secondary">
              {kind === "recebido" ? "quem emitiu" : "quem vai receber"}
            </label>
            <input
              value={contraparte}
              onChange={(e) => setContraparte(e.target.value)}
              placeholder="nome da pessoa ou empresa"
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs lowercase text-text-secondary">
              observações (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
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
