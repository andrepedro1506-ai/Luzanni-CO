import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { expenseGroupIcon } from "../lib/expenseGroupIcons";
import { formatCurrency, formatDate, formatPercent } from "../lib/format";
import type { Transaction } from "../lib/types";

interface ExpenseGroupCardProps {
  groupId: number;
  name: string;
  color: string;
  total: number;
  count: number;
  share: number;
  transactions: Transaction[];
  onAddExpense: (groupId: number) => void;
  onDeleteTransaction: (id: number) => void;
}

export function ExpenseGroupCard({
  groupId,
  name,
  color,
  total,
  count,
  share,
  transactions,
  onAddExpense,
  onDeleteTransaction,
}: ExpenseGroupCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = expenseGroupIcon(name);

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}26`, color }}
        >
          <Icon className="size-5" />
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "recolher" : "expandir"}
          disabled={transactions.length === 0}
          className="text-text-muted transition-transform hover:text-text-primary disabled:opacity-30"
        >
          <ChevronDown className={`size-5 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-text-secondary">{name}</p>
      <p className="mt-1 text-2xl font-extrabold">{formatCurrency(total)}</p>

      <div className="mt-3 h-1.5 w-full rounded-full bg-surface-hover">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${share * 100}%`, backgroundColor: color }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-text-secondary lowercase">
          {count} lanç. · {formatPercent(share)} do período
        </p>
        {groupId !== 0 && (
          <button
            type="button"
            onClick={() => onAddExpense(groupId)}
            className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold lowercase transition-opacity hover:opacity-80"
            style={{ backgroundColor: `${color}26`, color }}
          >
            <Plus className="size-3" />
            novo
          </button>
        )}
      </div>

      {expanded && transactions.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t.description}</p>
                <p className="truncate text-xs text-text-secondary">{formatDate(t.date)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {t.status === "pendente" && <Badge tone="warning">pendente</Badge>}
                <span className="text-sm font-semibold text-danger">-{formatCurrency(t.amount)}</span>
                <button
                  onClick={() => onDeleteTransaction(t.id)}
                  aria-label="remover"
                  className="text-text-muted hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
