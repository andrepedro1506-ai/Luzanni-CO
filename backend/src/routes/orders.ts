import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";

export const ordersRouter = Router();

const orderSchema = z.object({
  supplier_id: z.number().int().positive(),
  order_date: z.string().min(1),
  amount: z.number().positive(),
  pairs_quantity: z.number().int().positive(),
  has_invoice: z.boolean(),
  payment_method: z.enum(["pix", "boleto", "cartao_credito", "transferencia", "dinheiro", "outro"]),
  notes: z.string().optional(),
});

function parseRange(query: Record<string, unknown>) {
  const from = typeof query.from === "string" ? query.from : "0001-01-01";
  const to = typeof query.to === "string" ? query.to : "9999-12-31";
  return { from, to };
}

const SELECT_WITH_SUPPLIER = `
  SELECT o.*, s.name as supplier_name
  FROM orders o
  JOIN suppliers s ON s.id = o.supplier_id
`;

ordersRouter.get("/", async (req, res) => {
  const { from, to } = parseRange(req.query as Record<string, unknown>);
  const result = await pool.query(
    `${SELECT_WITH_SUPPLIER} WHERE o.order_date BETWEEN $1 AND $2 ORDER BY o.order_date DESC, o.id DESC`,
    [from, to]
  );
  res.json(result.rows);
});

ordersRouter.post("/", async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { supplier_id, order_date, amount, pairs_quantity, has_invoice, payment_method, notes } =
    parsed.data;
  const inserted = await pool.query(
    `INSERT INTO orders (supplier_id, order_date, amount, pairs_quantity, has_invoice, payment_method, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [supplier_id, order_date, amount, pairs_quantity, has_invoice, payment_method, notes ?? null]
  );
  const result = await pool.query(`${SELECT_WITH_SUPPLIER} WHERE o.id = $1`, [inserted.rows[0].id]);
  res.status(201).json(result.rows[0]);
});

ordersRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = orderSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const existing = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);
  if (existing.rows.length === 0) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const merged = { ...existing.rows[0], ...parsed.data };
  await pool.query(
    `UPDATE orders SET supplier_id = $1, order_date = $2, amount = $3, pairs_quantity = $4,
     has_invoice = $5, payment_method = $6, notes = $7 WHERE id = $8`,
    [
      merged.supplier_id,
      merged.order_date,
      merged.amount,
      merged.pairs_quantity,
      merged.has_invoice,
      merged.payment_method,
      merged.notes,
      id,
    ]
  );
  const result = await pool.query(`${SELECT_WITH_SUPPLIER} WHERE o.id = $1`, [id]);
  res.json(result.rows[0]);
});

ordersRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const result = await pool.query("DELETE FROM orders WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.status(204).end();
});
