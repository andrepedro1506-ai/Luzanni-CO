import { Router } from "express";
import { pool } from "../db.js";

export const reportsRouter = Router();

function parseRange(query: Record<string, unknown>) {
  const from = typeof query.from === "string" ? query.from : "0001-01-01";
  const to = typeof query.to === "string" ? query.to : "9999-12-31";
  return { from, to };
}

reportsRouter.get("/summary", async (req, res) => {
  const { from, to } = parseRange(req.query as Record<string, unknown>);

  const totalsResult = await pool.query(
    `SELECT kind, status, COALESCE(SUM(amount), 0) as total
     FROM transactions
     WHERE date BETWEEN $1 AND $2
     GROUP BY kind, status`,
    [from, to]
  );

  let entradasPagas = 0;
  let saidasPagas = 0;
  let entradasPendentes = 0;
  let saidasPendentes = 0;
  for (const t of totalsResult.rows as Array<{ kind: string; status: string; total: string }>) {
    const total = Number(t.total);
    if (t.kind === "entrada" && t.status === "pago") entradasPagas = total;
    if (t.kind === "saida" && t.status === "pago") saidasPagas = total;
    if (t.kind === "entrada" && t.status === "pendente") entradasPendentes = total;
    if (t.kind === "saida" && t.status === "pendente") saidasPendentes = total;
  }

  const porCategoriaResult = await pool.query(
    `SELECT c.name as category_name, c.color as category_color, t.kind,
            COALESCE(SUM(t.amount), 0) as total
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.date BETWEEN $1 AND $2 AND t.status = 'pago'
     GROUP BY c.id, c.name, c.color, t.kind
     ORDER BY total DESC`,
    [from, to]
  );

  const porDiaResult = await pool.query(
    `SELECT date,
            COALESCE(SUM(CASE WHEN kind = 'entrada' AND status = 'pago' THEN amount ELSE 0 END), 0) as entradas,
            COALESCE(SUM(CASE WHEN kind = 'saida' AND status = 'pago' THEN amount ELSE 0 END), 0) as saidas
     FROM transactions
     WHERE date BETWEEN $1 AND $2
     GROUP BY date
     ORDER BY date ASC`,
    [from, to]
  );

  res.json({
    entradas: entradasPagas,
    saidas: saidasPagas,
    saldo: entradasPagas - saidasPagas,
    aReceber: entradasPendentes,
    aPagar: saidasPendentes,
    porCategoria: porCategoriaResult.rows.map((r) => ({ ...r, total: Number(r.total) })),
    porDia: porDiaResult.rows.map((r) => ({
      ...r,
      entradas: Number(r.entradas),
      saidas: Number(r.saidas),
    })),
  });
});

reportsRouter.get("/dre", async (req, res) => {
  const { from, to } = parseRange(req.query as Record<string, unknown>);

  const result = await pool.query(
    `SELECT c.dre_group, COALESCE(SUM(t.amount), 0) as total
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.date BETWEEN $1 AND $2 AND t.status = 'pago'
     GROUP BY c.dre_group`,
    [from, to]
  );

  const byGroup: Record<string, number> = {
    receita: 0,
    deducoes: 0,
    cmv: 0,
    despesas_operacionais: 0,
    despesas_financeiras: 0,
    receitas_financeiras: 0,
  };
  for (const g of result.rows as Array<{ dre_group: string; total: string }>) {
    byGroup[g.dre_group] = Number(g.total);
  }

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
