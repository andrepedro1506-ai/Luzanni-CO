import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CalendarClock, Plus, Receipt, Trophy, Wallet } from "lucide-react";
import { Card } from "../components/ui/Card";
import { PillGroup } from "../components/ui/Pill";
import { Button } from "../components/ui/Button";
import { StatCard } from "../components/StatCard";
import { StoreSelector } from "../components/StoreSelector";
import { ExpenseForm } from "../components/ExpenseForm";
import { ExpenseGroupCard } from "../components/ExpenseGroupCard";
import { usePeriod } from "../hooks/usePeriod";
import { api } from "../lib/api";
import { formatCurrency, startOfMonthIso, todayIso } from "../lib/format";
import type { DespesasAbertas, DespesasPorGrupo, ExpenseGroup, Transaction } from "../lib/types";

export function Financeiro() {
  const { period, setPeriod, range } = usePeriod();
  const [despesas, setDespesas] = useState<DespesasPorGrupo | null>(null);
  const [despesasMes, setDespesasMes] = useState<DespesasPorGrupo | null>(null);
  const [despesasAbertas, setDespesasAbertas] = useState<DespesasAbertas | null>(null);
  const [groups, setGroups] = useState<ExpenseGroup[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [presetGroupId, setPresetGroupId] = useState<number | undefined>(undefined);

  const load = useCallback(async () => {
    setLoading(true);
    const [despesasData, despesasMesData, despesasAbertasData, groupsData, transactionsData] =
      await Promise.all([
        api.reports.despesasPorGrupo(range),
        api.reports.despesasPorGrupo({
          from: startOfMonthIso(),
          to: todayIso(),
          storeId: range.storeId,
        }),
        api.reports.despesasAbertas(range.storeId),
        api.expenseGroups.list(),
        api.transactions.list(range),
      ]);
    setDespesas(despesasData);
    setDespesasMes(despesasMesData);
    setDespesasAbertas(despesasAbertasData);
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

  function openFormFor(groupId?: number) {
    setPresetGroupId(groupId);
    setShowForm(true);
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
        <Button onClick={() => openFormFor(undefined)}>
          <Plus className="size-4" />
          nova despesa
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="despesa do mês"
          value={despesasMes ? formatCurrency(despesasMes.total) : "—"}
          icon={Receipt}
          tone="danger"
        />
        <StatCard
          label="valor em aberto"
          value={despesasAbertas ? formatCurrency(despesasAbertas.emAberto) : "—"}
          icon={Wallet}
          tone="warning"
        />
        <StatCard
          label="a vencer"
          value={despesasAbertas ? formatCurrency(despesasAbertas.aVencer) : "—"}
          icon={CalendarClock}
          tone="default"
        />
        <StatCard
          label="em atraso"
          value={despesasAbertas ? formatCurrency(despesasAbertas.emAtraso) : "—"}
          icon={AlertTriangle}
          tone="danger"
        />
        <StatCard
          label="grupo com maior despesa"
          value={
            despesasMes?.groups[0]
              ? `${despesasMes.groups[0].groupName} · ${formatCurrency(despesasMes.groups[0].total)}`
              : "—"
          }
          icon={Trophy}
          tone="default"
        />
      </div>

      {loading && <p className="text-sm text-text-secondary lowercase">carregando...</p>}
      {!loading && (!despesas || despesas.groups.length === 0) && (
        <Card>
          <p className="text-sm text-text-secondary lowercase">nenhuma despesa no período</p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {despesas?.groups.map((g) => {
          const share = despesas.total > 0 ? g.total / despesas.total : 0;
          return (
            <ExpenseGroupCard
              key={g.groupId}
              groupId={g.groupId}
              name={g.groupName}
              color={g.groupColor}
              total={g.total}
              count={g.count}
              share={share}
              transactions={transactions.filter((t) => (t.expense_group_id ?? 0) === g.groupId)}
              onAddExpense={openFormFor}
              onDeleteTransaction={handleDelete}
            />
          );
        })}
      </div>

      {showForm && (
        <ExpenseForm
          groups={groups}
          initialGroupId={presetGroupId}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}
