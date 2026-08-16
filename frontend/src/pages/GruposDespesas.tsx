import { useCallback, useEffect, useState } from "react";
import { Plus, Tags, Trash2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ExpenseGroupForm } from "../components/ExpenseGroupForm";
import { api } from "../lib/api";
import type { ExpenseGroup } from "../lib/types";

export function GruposDespesas() {
  const [groups, setGroups] = useState<ExpenseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setGroups(await api.expenseGroups.list());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(data: Parameters<typeof api.expenseGroups.create>[0]) {
    await api.expenseGroups.create(data);
    await load();
  }

  async function handleDelete(id: number) {
    if (!confirm("remover este grupo de despesa?")) return;
    try {
      await api.expenseGroups.remove(id);
      await load();
    } catch {
      alert("não foi possível remover: existem despesas lançadas nesse grupo.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="size-4" />
          novo grupo
        </Button>
      </div>

      {loading && <p className="text-sm text-text-secondary lowercase">carregando...</p>}
      {!loading && groups.length === 0 && (
        <Card>
          <p className="text-sm text-text-secondary lowercase">nenhum grupo de despesa cadastrado.</p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((g) => (
          <Card key={g.id} className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${g.color}26`, color: g.color }}
              >
                <Tags className="size-5" />
              </div>
              <p className="truncate text-sm font-semibold" title={g.name}>
                {g.name}
              </p>
            </div>
            <button
              onClick={() => handleDelete(g.id)}
              aria-label="remover"
              className="shrink-0 text-text-muted hover:text-danger"
            >
              <Trash2 className="size-4" />
            </button>
          </Card>
        ))}
      </div>

      {showForm && <ExpenseGroupForm onClose={() => setShowForm(false)} onSubmit={handleCreate} />}
    </div>
  );
}
