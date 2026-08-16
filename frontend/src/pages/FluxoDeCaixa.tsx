import { useCallback, useEffect, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Clock, Plus, Trash2, Wallet } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "../components/ui/Card";
import { PillGroup } from "../components/ui/Pill";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { StatCard } from "../components/StatCard";
import { TransactionForm } from "../components/TransactionForm";
import { usePeriod } from "../hooks/usePeriod";
import { api } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/format";
import type { Category, Summary, Transaction } from "../lib/types";

export function FluxoDeCaixa() {
  const { period, setPeriod, range } = usePeriod();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [summaryData, transactionsData, categoriesData] = await Promise.all([
      api.reports.summary(range),
      api.transactions.list(range),
      api.categories.list(),
    ]);
    setSummary(summaryData);
    setTransactions(transactionsData);
    setCategories(categoriesData);
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

  const chartData = (summary?.porCategoria ?? []).map((c) => ({
    name: c.category_name,
    value: c.total,
    color: c.category_color,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PillGroup
          value={period}
          onChange={setPeriod}
          options={[
            { value: "hoje", label: "hoje" },
            { value: "7dias", label: "7 dias" },
            { value: "mes", label: "mês" },
          ]}
        />
        <Button onClick={() => setShowForm(true)}>
          <Plus className="size-4" />
          nova transação
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="saldo do período"
          value={summary ? formatCurrency(summary.saldo) : "—"}
          icon={Wallet}
          tone={summary && summary.saldo >= 0 ? "success" : "danger"}
        />
        <StatCard
          label="entradas"
          value={summary ? formatCurrency(summary.entradas) : "—"}
          icon={ArrowUpCircle}
          tone="success"
        />
        <StatCard
          label="saídas"
          value={summary ? formatCurrency(summary.saidas) : "—"}
          icon={ArrowDownCircle}
          tone="danger"
        />
        <StatCard
          label="a receber / a pagar"
          value={summary ? `${formatCurrency(summary.aReceber)} / ${formatCurrency(summary.aPagar)}` : "—"}
          icon={Clock}
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <p className="text-sm font-semibold lowercase">distribuição por categoria</p>
          <p className="text-sm text-text-secondary lowercase">transações pagas no período</p>
          <div className="mt-4 h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      background: "#111815",
                      border: "1px solid #1f2a24",
                      borderRadius: 12,
                      color: "#f5f7f6",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-text-secondary lowercase">
                sem dados no período
              </div>
            )}
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold lowercase">transações</p>
              <p className="text-sm text-text-secondary lowercase">clique no ícone para remover</p>
            </div>
          </div>
          <div className="max-h-[22rem] space-y-2 overflow-y-auto">
            {loading && <p className="text-sm text-text-secondary lowercase">carregando...</p>}
            {!loading && transactions.length === 0 && (
              <p className="text-sm text-text-secondary lowercase">nenhuma transação no período</p>
            )}
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
                  {t.status === "pendente" && (
                    <Badge tone="warning">pendente</Badge>
                  )}
                  <span
                    className={`text-sm font-semibold ${
                      t.kind === "entrada" ? "text-success" : "text-danger"
                    }`}
                  >
                    {t.kind === "entrada" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </span>
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
      </div>

      {showForm && (
        <TransactionForm categories={categories} onClose={() => setShowForm(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
}
