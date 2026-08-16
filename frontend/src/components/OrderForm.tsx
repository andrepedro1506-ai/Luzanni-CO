import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/Button";
import type { PaymentMethod, Supplier } from "../lib/types";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_OPTIONS } from "../lib/paymentMethods";
import { todayIso } from "../lib/format";

interface OrderFormProps {
  suppliers: Supplier[];
  onClose: () => void;
  onSubmit: (data: {
    supplier_id: number;
    order_date: string;
    amount: number;
    pairs_quantity: number;
    has_invoice: boolean;
    payment_method: PaymentMethod;
    notes?: string;
  }) => Promise<void>;
}

export function OrderForm({ suppliers, onClose, onSubmit }: OrderFormProps) {
  const [supplierId, setSupplierId] = useState<number | null>(suppliers[0]?.id ?? null);
  const [orderDate, setOrderDate] = useState(todayIso());
  const [amount, setAmount] = useState("");
  const [pairsQuantity, setPairsQuantity] = useState("");
  const [hasInvoice, setHasInvoice] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(amount.replace(",", "."));
    const parsedPairs = Number(pairsQuantity);

    if (!supplierId) {
      setError("selecione um fornecedor");
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setError("informe um valor válido");
      return;
    }
    if (!parsedPairs || parsedPairs <= 0) {
      setError("informe a quantidade de pares");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        supplier_id: supplierId,
        order_date: orderDate,
        amount: parsedAmount,
        pairs_quantity: parsedPairs,
        has_invoice: hasInvoice,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch {
      setError("erro ao salvar. tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (suppliers.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold lowercase">novo pedido</h2>
            <button type="button" onClick={onClose} aria-label="fechar">
              <X className="size-5 text-text-secondary" />
            </button>
          </div>
          <p className="text-sm text-text-secondary lowercase">
            cadastre um fornecedor antes de lançar um pedido.
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold lowercase">novo pedido</h2>
          <button type="button" onClick={onClose} aria-label="fechar">
            <X className="size-5 text-text-secondary" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs lowercase text-text-secondary">fornecedor</label>
            <select
              value={supplierId ?? ""}
              onChange={(e) => setSupplierId(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs lowercase text-text-secondary">
                data do pedido
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs lowercase text-text-secondary">
                valor do pedido (r$)
              </label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="0,00"
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs lowercase text-text-secondary">
              quantidade de pares
            </label>
            <input
              value={pairsQuantity}
              onChange={(e) => setPairsQuantity(e.target.value)}
              inputMode="numeric"
              placeholder="ex: 120"
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs lowercase text-text-secondary">nota fiscal</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setHasInvoice(true)}
                className={`rounded-xl border px-4 py-2.5 text-sm lowercase ${
                  hasInvoice ? "border-primary bg-primary-dim text-primary" : "border-border text-text-secondary"
                }`}
              >
                com nota fiscal
              </button>
              <button
                type="button"
                onClick={() => setHasInvoice(false)}
                className={`rounded-xl border px-4 py-2.5 text-sm lowercase ${
                  !hasInvoice ? "border-warning bg-warning-dim text-warning" : "border-border text-text-secondary"
                }`}
              >
                sem nota fiscal
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs lowercase text-text-secondary">
              forma de pagamento
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              {PAYMENT_METHOD_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </option>
              ))}
            </select>
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
