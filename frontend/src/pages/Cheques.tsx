import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock, Plus, ReceiptText, Trash2, XCircle } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { StatCard } from "../components/StatCard";
import { ChequeForm } from "../components/ChequeForm";
import { StoreSelector } from "../components/StoreSelector";
import { useStore } from "../context/StoreContext";
import { api } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/format";
import type { Cheque, ChequeStatus } from "../lib/types";

const STATUS_LABEL: Record<ChequeStatus, string> = {
  pendente: "pendente",
  compensado: "compensado",
  devolvido: "devolvido",
};

const STATUS_TONE: Record<ChequeStatus, "warning" | "success" | "danger"> = {
  pendente: "warning",
  compensado: "success",
  devolvido: "danger",
};

export function Cheques() {
  const { selectedStoreId } = useStore();
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api.cheques.list(selectedStoreId);
    setCheques(data);
    setLoading(false);
  }, [selectedStoreId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(data: Parameters<typeof api.cheques.create>[0]) {
    await api.cheques.create(data);
    await load();
  }

  async function handleStatusChange(id: number, status: ChequeStatus) {
    await api.cheques.update(id, { status });
    await load();
  }

  async function handleDelete(id: number) {
    if (!confirm("remover este cheque?")) return;
    await api.cheques.remove(id);
    await load();
  }

  const pendentes = cheques.filter((c) => c.status === "pendente");
  const totalPendente = pendentes.reduce((sum, c) => sum + c.valor, 0);
  const totalCompensado = cheques
    .filter((c) => c.status === "compensado")
    .reduce((sum, c) => sum + c.valor, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StoreSelector />
        <Button onClick={() => setShowForm(true)}>
          <Plus className="size-4" />
          novo cheque
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="pendentes" value={formatCurrency(totalPendente)} icon={Clock} />
        <StatCard label="compensados" value={formatCurrency(totalCompensado)} icon={CheckCircle2} />
        <StatCard label="quantidade de cheques" value={String(cheques.length)} icon={ReceiptText} />
      </div>

      <Card>
        <div className="mb-4">
          <p className="text-sm font-semibold lowercase">cheques</p>
          <p className="text-sm text-text-secondary lowercase">
            ordenados por data de vencimento
          </p>
        </div>

        {loading && <p className="text-sm text-text-secondary lowercase">carregando...</p>}
        {!loading && cheques.length === 0 && (
          <p className="text-sm text-text-secondary lowercase">nenhum cheque cadastrado</p>
        )}

        <div className="space-y-2">
          {cheques.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {c.contraparte} · nº {c.numero}
                </p>
                <p className="truncate text-xs text-text-secondary lowercase">
                  {c.kind === "recebido" ? "recebido" : "emitido"} · vence em {formatDate(c.data_vencimento)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                <span className="text-sm font-semibold">{formatCurrency(c.valor)}</span>
                {c.status === "pendente" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(c.id, "compensado")}
                      aria-label="marcar como compensado"
                      title="marcar como compensado"
                      className="text-text-muted hover:text-success"
                    >
                      <CheckCircle2 className="size-4" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(c.id, "devolvido")}
                      aria-label="marcar como devolvido"
                      title="marcar como devolvido"
                      className="text-text-muted hover:text-danger"
                    >
                      <XCircle className="size-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(c.id)}
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

      {showForm && <ChequeForm onClose={() => setShowForm(false)} onSubmit={handleCreate} />}
    </div>
  );
}
