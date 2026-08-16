import { useCallback, useEffect, useState } from "react";
import { Plus, Receipt, Trash2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { PillGroup } from "../components/ui/Pill";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { StatCard } from "../components/StatCard";
import { StoreSelector } from "../components/StoreSelector";
import { ExpenseForm } from "../components/ExpenseForm";
import { usePeriod } from "../hooks/usePeriod";
import { api } from "../lib/api";
import { formatCurrency, formatDate, formatPercent } from "../lib/format";
import type { DespesasPorGrupo, ExpenseGroup, Transaction } from "../lib/types";

export function Financeiro() {
  const { period, setPeriod, range } = usePeriod();
  const [despesas, setDespesas] = useState<DespesasPorGrupo | null>(null);
  const [groups, setGroups] = useState<ExpenseGroup[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [despesasData, groupsData, transactionsData] = await Promise.all([
      api.reports.despesasPorGrupo(range),
      api.expenseGroups.list(),
      api.transactions.list(range),
    ]);
    setDespesas(despesasData);
    setGroups(groupsData);
    setTransactions(transactionsData.filter((t) => t.expense_group_id !== null));
    setLoading(false);
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(data: Parameters<typeof api.transactions.create>[0]) {
    await api.transactions.create(data);
    await load();
  }

  async function handleDelete(id: number) {
    await api.transactions.remove(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <StoreSelector />
          <PillGroup
            value={period}
            onChange={setPeriod}
            options={[
              { value: "hoje", label: "hoje" },
              { value: "7dias", label: "7 dias" },
              { value: "mes", label: "mês" },
            ]}
          />
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="size-4" />
          nova despesa
        </Button>
      </div>

      <StatCard
        label="total de despesas no período"
        value={despesas ? formatCurrency(despesas.total) : "—"}
        icon={Receipt}
        tone="danger"
      />

      <Card>
        <p className="text-sm font-semibold lowercase">despesas por grupo</p>
        <p className="mb-4 text-sm text-text-secondary lowercase">
          participação de cada grupo no total do período
        </p>

        {loading && <p className="text-sm text-text-secondary lowercase">carregando...</p>}
        {!loading && (!despesas || despesas.groups.length === 0) && (
          <p className="text-sm text-text-secondary lowercase">nenhuma despesa no período</p>
        )}

        <div className="space-y-4">
          {despesas?.groups.map((g) => {
            const share = despesas.total > 0 ? g.total / despesas.total : 0;
            return (
              <div key={g.groupId}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 lowercase">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: g.groupColor }}
                    />
                    {g.groupName}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(g.total)}{" "}
                    <span className="text-text-secondary">({formatPercent(share)})</span>
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-surface-hover">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${share * 100}%`, backgroundColor: g.groupColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold lowercase">despesas lançadas</p>
            <p className="text-sm text-text-secondary lowercase">clique no ícone para remover</p>
          </div>
        </div>

        {loading && <p className="text-sm text-text-secondary lowercase">carregando...</p>}
        {!loading && transactions.length === 0 && (
          <p className="text-sm text-text-secondary lowercase">nenhuma despesa lançada no período</p>
        )}

        <div className="space-y-2">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: t.category_color }}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.description}</p>
                  <p className="truncate text-xs text-text-secondary lowercase">
                    {t.category_name} · {formatDate(t.date)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {t.status === "pendente" && <Badge tone="warning">pendente</Badge>}
                <span className="text-sm font-semibold text-danger">-{formatCurrency(t.amount)}</span>
                <button
                  onClick={() => handleDelete(t.id)}
                  aria-label="remover"
                  className="text-text-muted hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {showForm && (
        <ExpenseForm groups={groups} onClose={() => setShowForm(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
}
