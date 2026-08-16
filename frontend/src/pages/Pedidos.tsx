import { useCallback, useEffect, useState } from "react";
import { FileCheck2, FileX2, Package, Plus, Receipt, Trash2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { PillGroup } from "../components/ui/Pill";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { StatCard } from "../components/StatCard";
import { OrderForm } from "../components/OrderForm";
import { StoreSelector } from "../components/StoreSelector";
import { usePeriod } from "../hooks/usePeriod";
import { api } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/format";
import { PAYMENT_METHOD_LABELS } from "../lib/paymentMethods";
import type { Order, PedidosSummary, Supplier } from "../lib/types";

export function Pedidos() {
  const { period, setPeriod, range } = usePeriod();
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [summary, setSummary] = useState<PedidosSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [ordersData, suppliersData, summaryData] = await Promise.all([
      api.orders.list(range),
      api.suppliers.list(),
      api.reports.pedidos(range),
    ]);
    setOrders(ordersData);
    setSuppliers(suppliersData);
    setSummary(summaryData);
    setLoading(false);
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(data: Parameters<typeof api.orders.create>[0]) {
    await api.orders.create(data);
    await load();
  }

  async function handleDelete(id: number) {
    if (!confirm("remover este pedido?")) return;
    await api.orders.remove(id);
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
          novo pedido
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="total em pedidos"
          value={summary ? formatCurrency(summary.totalValor) : "—"}
          icon={Receipt}
        />
        <StatCard
          label="pares pedidos"
          value={summary ? summary.totalPares.toLocaleString("pt-BR") : "—"}
          icon={Package}
        />
        <StatCard
          label="número de pedidos"
          value={summary ? summary.totalPedidos.toLocaleString("pt-BR") : "—"}
          icon={FileCheck2}
        />
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold lowercase">pedidos</p>
            <p className="text-sm text-text-secondary lowercase">clique no ícone para remover</p>
          </div>
        </div>

        {loading && <p className="text-sm text-text-secondary lowercase">carregando...</p>}
        {!loading && orders.length === 0 && (
          <p className="text-sm text-text-secondary lowercase">nenhum pedido no período</p>
        )}

        <div className="space-y-2">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{o.supplier_name}</p>
                <p className="truncate text-xs text-text-secondary lowercase">
                  {formatDate(o.order_date)} · {o.pairs_quantity} pares ·{" "}
                  {PAYMENT_METHOD_LABELS[o.payment_method]}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {o.has_invoice ? (
                  <Badge tone="success">
                    <FileCheck2 className="mr-1 size-3" /> com nf
                  </Badge>
                ) : (
                  <Badge tone="warning">
                    <FileX2 className="mr-1 size-3" /> sem nf
                  </Badge>
                )}
                <span className="text-sm font-semibold">{formatCurrency(o.amount)}</span>
                <button
                  onClick={() => handleDelete(o.id)}
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
        <OrderForm suppliers={suppliers} onClose={() => setShowForm(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
}
