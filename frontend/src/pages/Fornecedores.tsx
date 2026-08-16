import { useCallback, useEffect, useState } from "react";
import { Building2, Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { SupplierForm } from "../components/SupplierForm";
import { api } from "../lib/api";
import type { Supplier } from "../lib/types";

export function Fornecedores() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Supplier | undefined>(undefined);

  const load = useCallback(async () => {
    setLoading(true);
    setSuppliers(await api.suppliers.list());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(data: Parameters<typeof api.suppliers.create>[0]) {
    await api.suppliers.create(data);
    await load();
  }

  async function handleUpdate(data: Parameters<typeof api.suppliers.create>[0]) {
    if (!editing) return;
    await api.suppliers.update(editing.id, data);
    await load();
  }

  async function handleDelete(id: number) {
    if (!confirm("remover este fornecedor?")) return;
    await api.suppliers.remove(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button
          onClick={() => {
            setEditing(undefined);
            setShowForm(true);
          }}
        >
          <Plus className="size-4" />
          novo fornecedor
        </Button>
      </div>

      {loading && <p className="text-sm text-text-secondary lowercase">carregando...</p>}
      {!loading && suppliers.length === 0 && (
        <Card>
          <p className="text-sm text-text-secondary lowercase">nenhum fornecedor cadastrado ainda.</p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {suppliers.map((s) => (
          <Card key={s.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-hover text-text-secondary">
                  <Building2 className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{s.name}</p>
                  {s.cnpj && <p className="truncate text-xs text-text-secondary">{s.cnpj}</p>}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => {
                    setEditing(s);
                    setShowForm(true);
                  }}
                  aria-label="editar"
                  className="text-text-muted hover:text-text-primary"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  aria-label="remover"
                  className="text-text-muted hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            {(s.contact_name || s.city) && (
              <p className="text-sm text-text-secondary lowercase">
                {s.contact_name}
                {s.contact_name && s.city ? " · " : ""}
                {s.city}
                {s.city && s.state ? `/${s.state}` : ""}
              </p>
            )}

            <div className="flex flex-col gap-1 text-sm text-text-secondary">
              {s.phone && (
                <span className="flex items-center gap-2">
                  <Phone className="size-3.5" /> {s.phone}
                </span>
              )}
              {s.email && (
                <span className="flex items-center gap-2">
                  <Mail className="size-3.5" /> {s.email}
                </span>
              )}
            </div>

            {s.notes && <p className="text-xs text-text-muted">{s.notes}</p>}
          </Card>
        ))}
      </div>

      {showForm && (
        <SupplierForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSubmit={editing ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
}
