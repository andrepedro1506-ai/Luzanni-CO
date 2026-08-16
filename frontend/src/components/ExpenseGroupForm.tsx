import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/Button";

const COLOR_PRESETS = [
  "#0D9488",
  "#7C3AED",
  "#DB2777",
  "#D97706",
  "#2563EB",
  "#DC2626",
  "#16A34A",
  "#97A08C",
];

interface ExpenseGroupFormProps {
  onClose: () => void;
  onSubmit: (data: { name: string; color: string }) => Promise<void>;
}

export function ExpenseGroupForm({ onClose, onSubmit }: ExpenseGroupFormProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("informe o nome do grupo");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), color });
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
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold lowercase">novo grupo de despesa</h2>
          <button type="button" onClick={onClose} aria-label="fechar">
            <X className="size-5 text-text-secondary" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs lowercase text-text-secondary">nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="ex: manutenção"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs lowercase text-text-secondary">cor</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={c}
                  className="size-8 rounded-full transition-transform"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? "2px solid var(--color-text-primary)" : "none",
                    outlineOffset: 2,
                    transform: color === c ? "scale(1.1)" : "scale(1)",
                  }}
                />
              ))}
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
