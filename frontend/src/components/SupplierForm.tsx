import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/Button";
import type { Supplier } from "../lib/types";

interface SupplierFormProps {
  initial?: Supplier;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    cnpj?: string;
    contact_name?: string;
    phone?: string;
    email?: string;
    city?: string;
    state?: string;
    notes?: string;
  }) => Promise<void>;
}

export function SupplierForm({ initial, onClose, onSubmit }: SupplierFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [cnpj, setCnpj] = useState(initial?.cnpj ?? "");
  const [contactName, setContactName] = useState(initial?.contact_name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [state, setState] = useState(initial?.state ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("informe o nome do fornecedor");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        cnpj: cnpj.trim() || undefined,
        contact_name: contactName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
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
          <h2 className="text-lg font-bold lowercase">
            {initial ? "editar fornecedor" : "novo fornecedor"}
          </h2>
          <button type="button" onClick={onClose} aria-label="fechar">
            <X className="size-5 text-text-secondary" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs lowercase text-text-secondary">nome *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="ex: coureiro sul ltda"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs lowercase text-text-secondary">cnpj</label>
            <input
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs lowercase text-text-secondary">contato</label>
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="nome"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs lowercase text-text-secondary">telefone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs lowercase text-text-secondary">e-mail</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="contato@fornecedor.com.br"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs lowercase text-text-secondary">cidade</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs lowercase text-text-secondary">estado</label>
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                maxLength={2}
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm uppercase outline-none focus:border-primary"
                placeholder="uf"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs lowercase text-text-secondary">observações</label>
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
