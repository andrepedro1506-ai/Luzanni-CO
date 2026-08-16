import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";

export const transactionsRouter = Router();

const transactionSchema = z.object({
  kind: z.enum(["entrada", "saida"]),
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().min(1),
  category_id: z.number().int().positive(),
  status: z.enum(["pago", "pendente"]).default("pago"),
  store_id: z.number().int().positive(),
  expense_group_id: z.number().int().positive().nullable().optional(),
});

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

const SELECT_WITH_CATEGORY = `
  SELECT t.*, c.name as category_name, c.color as category_color, c.dre_group
  FROM transactions t
  JOIN categories c ON c.id = t.category_id
`;

transactionsRouter.get("/", async (req, res) => {
  const { from, to } = parseRange(req.query as Record<string, unknown>);
  const storeId = parseStoreId(req.query as Record<string, unknown>);
  const params: unknown[] = [from, to];
  let where = "WHERE t.date BETWEEN $1 AND $2";
  if (storeId) {
    params.push(storeId);
    where += ` AND t.store_id = $${params.length}`;
  }
  const result = await pool.query(
    `${SELECT_WITH_CATEGORY} ${where} ORDER BY t.date DESC, t.id DESC`,
    params
  );
  res.json(result.rows);
});

transactionsRouter.post("/", async (req, res) => {
  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) {
    console.error("POST /api/transactions validation failed:", JSON.stringify(req.body), parsed.error.flatten());
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { kind, description, amount, date, category_id, status, store_id, expense_group_id } =
    parsed.data;
  const inserted = await pool.query(
    `INSERT INTO transactions (kind, description, amount, date, category_id, status, store_id, expense_group_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [kind, description, amount, date, category_id, status, store_id, expense_group_id ?? null]
  );
  const result = await pool.query(`${SELECT_WITH_CATEGORY} WHERE t.id = $1`, [
    inserted.rows[0].id,
  ]);
  res.status(201).json(result.rows[0]);
});

transactionsRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = transactionSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const existing = await pool.query("SELECT * FROM transactions WHERE id = $1", [id]);
  if (existing.rows.length === 0) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const merged = { ...existing.rows[0], ...parsed.data };
  await pool.query(
    `UPDATE transactions SET kind = $1, description = $2, amount = $3, date = $4, category_id = $5, status = $6, store_id = $7, expense_group_id = $8
     WHERE id = $9`,
    [
      merged.kind,
      merged.description,
      merged.amount,
      merged.date,
      merged.category_id,
      merged.status,
      merged.store_id,
      merged.expense_group_id ?? null,
      id,
    ]
  );
  const result = await pool.query(`${SELECT_WITH_CATEGORY} WHERE t.id = $1`, [id]);
  res.json(result.rows[0]);
});

transactionsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const result = await pool.query("DELETE FROM transactions WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.status(204).end();
});
