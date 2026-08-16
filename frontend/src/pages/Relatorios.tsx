import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../components/ui/Card";
import { PillGroup } from "../components/ui/Pill";
import { ProgressBar } from "../components/ui/ProgressBar";
import { StoreSelector } from "../components/StoreSelector";
import { usePeriod } from "../hooks/usePeriod";
import { api } from "../lib/api";
import { formatCurrency, formatPercent } from "../lib/format";
import { useChartColors } from "../lib/chartColors";
import type { Dre } from "../lib/types";

interface DreLine {
  label: string;
  value: number;
  emphasis?: boolean;
  operator?: "-" | "+";
}

export function Relatorios() {
  const { period, setPeriod, range } = usePeriod();
  const chartColors = useChartColors();
  const [dre, setDre] = useState<Dre | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.reports.dre(range).then((data) => {
      setDre(data);
      setLoading(false);
    });
  }, [range]);

  const lines: DreLine[] = dre
    ? [
        { label: "receita bruta", value: dre.receitaBruta, emphasis: true },
        { label: "deduções", value: dre.deducoes, operator: "-" },
        { label: "receita líquida", value: dre.receitaLiquida, emphasis: true },
        { label: "custo dos produtos vendidos (cmv)", value: dre.cmv, operator: "-" },
        { label: "lucro bruto", value: dre.lucroBruto, emphasis: true },
        { label: "despesas operacionais", value: dre.despesasOperacionais, operator: "-" },
        { label: "resultado operacional", value: dre.resultadoOperacional, emphasis: true },
        { label: "receitas financeiras", value: dre.receitasFinanceiras, operator: "+" },
        { label: "despesas financeiras", value: dre.despesasFinanceiras, operator: "-" },
      ]
    : [];

  const chartData = dre
    ? [
        { name: "receita líquida", value: dre.receitaLiquida },
        { name: "cmv", value: dre.cmv },
        { name: "desp. operacionais", value: dre.despesasOperacionais },
        { name: "lucro líquido", value: dre.lucroLiquido },
      ]
    : [];

  return (
    <div className="space-y-6">
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

      <Card>
        <p className="text-sm lowercase text-text-secondary">lucro líquido do período</p>
        <p
          className={`mt-2 text-4xl font-extrabold ${
            dre && dre.lucroLiquido >= 0 ? "text-success" : "text-danger"
          }`}
        >
          {dre ? formatCurrency(dre.lucroLiquido) : "—"}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar value={dre ? Math.max(dre.margemLiquida, 0) : 0} />
          </div>
          <span className="shrink-0 text-sm font-semibold text-text-secondary">
            margem líquida: {dre ? formatPercent(dre.margemLiquida) : "—"}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <p className="mb-4 text-sm font-semibold lowercase">demonstrativo (dre)</p>
          {loading && <p className="text-sm text-text-secondary lowercase">carregando...</p>}
          <div className="space-y-1">
            {lines.map((line) => (
              <div
                key={line.label}
                className={`flex items-center justify-between rounded-lg px-2 py-2 text-sm ${
                  line.emphasis ? "bg-surface-hover font-semibold" : "text-text-secondary"
                }`}
              >
                <span className="lowercase">
                  {line.operator === "-" && "(-) "}
                  {line.operator === "+" && "(+) "}
                  {line.label}
                </span>
                <span className={line.operator === "-" ? "text-danger" : ""}>
                  {formatCurrency(line.value)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <p className="mb-4 text-sm font-semibold lowercase">visão geral</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: chartColors.tick, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: chartColors.tick, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatCurrency(v)}
                  width={90}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    background: chartColors.tooltipBg,
                    border: `1px solid ${chartColors.tooltipBorder}`,
                    borderRadius: 12,
                    color: chartColors.text,
                  }}
                  cursor={{ fill: chartColors.cursor }}
                />
                <Bar dataKey="value" fill={chartColors.primary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
