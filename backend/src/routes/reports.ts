import { Router } from "express";
import { db } from "../db.js";

export const reportsRouter = Router();

function parseRange(query: Record<string, unknown>) {
  const from = typeof query.from === "string" ? query.from : "0000-01-01";
  const to = typeof query.to === "string" ? query.to : "9999-12-31";
  return { from, to };
}

reportsRouter.get("/summary", (req, res) => {
  const { from, to } = parseRange(req.query as Record<string, unknown>);

  const totals = db
    .prepare(
      `SELECT kind, status, COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE date BETWEEN ? AND ?
       GROUP BY kind, status`
    )
    .all(from, to) as Array<{ kind: string; status: string; total: number }>;

  let entradasPagas = 0;
  let saidasPagas = 0;
  let entradasPendentes = 0;
  let saidasPendentes = 0;
  for (const t of totals) {
    if (t.kind === "entrada" && t.status === "pago") entradasPagas = t.total;
    if (t.kind === "saida" && t.status === "pago") saidasPagas = t.total;
    if (t.kind === "entrada" && t.status === "pendente") entradasPendentes = t.total;
    if (t.kind === "saida" && t.status === "pendente") saidasPendentes = t.total;
  }

  const porCategoria = db
    .prepare(
      `SELECT c.name as category_name, c.color as category_color, t.kind,
              COALESCE(SUM(t.amount), 0) as total
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       WHERE t.date BETWEEN ? AND ? AND t.status = 'pago'
       GROUP BY c.id
       ORDER BY total DESC`
    )
    .all(from, to);

  const porDia = db
    .prepare(
      `SELECT date,
              COALESCE(SUM(CASE WHEN kind = 'entrada' AND status = 'pago' THEN amount ELSE 0 END), 0) as entradas,
              COALESCE(SUM(CASE WHEN kind = 'saida' AND status = 'pago' THEN amount ELSE 0 END), 0) as saidas
       FROM transactions
       WHERE date BETWEEN ? AND ?
       GROUP BY date
       ORDER BY date ASC`
    )
    .all(from, to);

  res.json({
    entradas: entradasPagas,
    saidas: saidasPagas,
    saldo: entradasPagas - saidasPagas,
    aReceber: entradasPendentes,
    aPagar: saidasPendentes,
    porCategoria,
    porDia,
  });
});

reportsRouter.get("/dre", (req, res) => {
  const { from, to } = parseRange(req.query as Record<string, unknown>);

  const groups = db
    .prepare(
      `SELECT c.dre_group, COALESCE(SUM(t.amount), 0) as total
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       WHERE t.date BETWEEN ? AND ? AND t.status = 'pago'
       GROUP BY c.dre_group`
    )
    .all(from, to) as Array<{ dre_group: string; total: number }>;

  const byGroup: Record<string, number> = {
    receita: 0,
    deducoes: 0,
    cmv: 0,
    despesas_operacionais: 0,
    despesas_financeiras: 0,
    receitas_financeiras: 0,
  };
  for (const g of groups) byGroup[g.dre_group] = g.total;

  const receitaBruta = byGroup.receita;
  const receitaLiquida = receitaBruta - byGroup.deducoes;
  const lucroBruto = receitaLiquida - byGroup.cmv;
  const resultadoOperacional = lucroBruto - byGroup.despesas_operacionais;
  const lucroLiquido =
    resultadoOperacional + byGroup.receitas_financeiras - byGroup.despesas_financeiras;

  res.json({
    receitaBruta,
    deducoes: byGroup.deducoes,
    receitaLiquida,
    cmv: byGroup.cmv,
    lucroBruto,
    despesasOperacionais: byGroup.despesas_operacionais,
    resultadoOperacional,
    receitasFinanceiras: byGroup.receitas_financeiras,
    despesasFinanceiras: byGroup.despesas_financeiras,
    lucroLiquido,
    margemLiquida: receitaBruta > 0 ? lucroLiquido / receitaBruta : 0,
  });
});
