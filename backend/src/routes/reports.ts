import { Router } from "express";
import { pool } from "../db.js";

export const reportsRouter = Router();

function parseRange(query: Record<string, unknown>) {
  const from = typeof query.from === "string" ? query.from : "0001-01-01";
  const to = typeof query.to === "string" ? query.to : "9999-12-31";
  return { from, to };
}

function parseStoreId(query: Record<string, unknown>) {
  const raw = query.store_id;
  if (typeof raw !== "string" || raw === "") return null;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

reportsRouter.get("/despesas-por-grupo", async (req, res) => {
  const { from, to } = parseRange(req.query as Record<string, unknown>);
  const storeId = parseStoreId(req.query as Record<string, unknown>);
  const params: unknown[] = [from, to];
  let storeFilter = "";
  if (storeId) {
    params.push(storeId);
    storeFilter = ` AND t.store_id = $${params.length}`;
  }

  const result = await pool.query(
    `SELECT COALESCE(eg.id, 0) as group_id,
            COALESCE(eg.name, 'outras despesas') as group_name,
            COALESCE(eg.color, '#97A08C') as group_color,
            COALESCE(SUM(t.amount), 0) as total,
            COUNT(*) as count
     FROM transactions t
     LEFT JOIN expense_groups eg ON eg.id = t.expense_group_id
     WHERE t.kind = 'saida' AND t.status = 'pago' AND t.date BETWEEN $1 AND $2${storeFilter}
     GROUP BY eg.id, eg.name, eg.color
     ORDER BY total DESC`,
    params
  );

  const groups = result.rows.map((r) => ({
    groupId: Number(r.group_id),
    groupName: r.group_name as string,
    groupColor: r.group_color as string,
    total: Number(r.total),
    count: Number(r.count),
  }));

  const total = groups.reduce((sum, g) => sum + g.total, 0);

  res.json({ groups, total });
});

reportsRouter.get("/despesas-abertas", async (req, res) => {
  const storeId = parseStoreId(req.query as Record<string, unknown>);
  const params: unknown[] = [];
  let storeFilter = "";
  if (storeId) {
    params.push(storeId);
    storeFilter = ` AND store_id = $${params.length}`;
  }

  const result = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN date >= CURRENT_DATE THEN amount ELSE 0 END), 0) as a_vencer,
       COALESCE(SUM(CASE WHEN date < CURRENT_DATE THEN amount ELSE 0 END), 0) as em_atraso
     FROM transactions
     WHERE kind = 'saida' AND status = 'pendente'${storeFilter}`,
    params
  );

  const row = result.rows[0] as { a_vencer: string; em_atraso: string };
  const aVencer = Number(row.a_vencer);
  const emAtraso = Number(row.em_atraso);

  res.json({ aVencer, emAtraso, emAberto: aVencer + emAtraso });
});

reportsRouter.get("/pedidos", async (req, res) => {
  const { from, to } = parseRange(req.query as Record<string, unknown>);
  const storeId = parseStoreId(req.query as Record<string, unknown>);
  const params: unknown[] = [from, to];
  let where = "WHERE order_date BETWEEN $1 AND $2";
  if (storeId) {
    params.push(storeId);
    where += ` AND store_id = $${params.length}`;
  }

  const result = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) as total_valor,
            COALESCE(SUM(pairs_quantity), 0) as total_pares,
            COUNT(*) as total_pedidos
     FROM orders
     ${where}`,
    params
  );

  const row = result.rows[0] as { total_valor: string; total_pares: string; total_pedidos: string };

  res.json({
    totalValor: Number(row.total_valor),
    totalPares: Number(row.total_pares),
    totalPedidos: Number(row.total_pedidos),
  });
});

reportsRouter.get("/summary", async (req, res) => {
  const { from, to } = parseRange(req.query as Record<string, unknown>);
  const storeId = parseStoreId(req.query as Record<string, unknown>);
  const params: unknown[] = [from, to];
  let storeFilter = "";
  if (storeId) {
    params.push(storeId);
    storeFilter = ` AND store_id = $${params.length}`;
  }

  const totalsResult = await pool.query(
    `SELECT kind, status, COALESCE(SUM(amount), 0) as total
     FROM transactions
     WHERE date BETWEEN $1 AND $2${storeFilter}
     GROUP BY kind, status`,
    params
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

  const porCategoriaStoreFilter = storeId ? ` AND t.store_id = $${params.length}` : "";
  const porCategoriaResult = await pool.query(
    `SELECT c.name as category_name, c.color as category_color, t.kind,
            COALESCE(SUM(t.amount), 0) as total
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.date BETWEEN $1 AND $2 AND t.status = 'pago'${porCategoriaStoreFilter}
     GROUP BY c.id, c.name, c.color, t.kind
     ORDER BY total DESC`,
    params
  );

  const porDiaResult = await pool.query(
    `SELECT date,
            COALESCE(SUM(CASE WHEN kind = 'entrada' AND status = 'pago' THEN amount ELSE 0 END), 0) as entradas,
            COALESCE(SUM(CASE WHEN kind = 'saida' AND status = 'pago' THEN amount ELSE 0 END), 0) as saidas
     FROM transactions
     WHERE date BETWEEN $1 AND $2${storeFilter}
     GROUP BY date
     ORDER BY date ASC`,
    params
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
  const storeId = parseStoreId(req.query as Record<string, unknown>);
  const params: unknown[] = [from, to];
  let storeFilter = "";
  if (storeId) {
    params.push(storeId);
    storeFilter = ` AND t.store_id = $${params.length}`;
  }

  const result = await pool.query(
    `SELECT c.dre_group, COALESCE(SUM(t.amount), 0) as total
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.date BETWEEN $1 AND $2 AND t.status = 'pago'${storeFilter}
     GROUP BY c.dre_group`,
    params
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
