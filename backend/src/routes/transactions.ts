import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";

export const transactionsRouter = Router();

const transactionSchema = z.object({
  kind: z.enum(["entrada", "saida"]),
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().min(1),
  category_id: z.number().int().positive(),
  status: z.enum(["pago", "pendente"]).default("pago"),
});

function parseRange(query: Record<string, unknown>) {
  const from = typeof query.from === "string" ? query.from : "0000-01-01";
  const to = typeof query.to === "string" ? query.to : "9999-12-31";
  return { from, to };
}

transactionsRouter.get("/", (req, res) => {
  const { from, to } = parseRange(req.query as Record<string, unknown>);
  const rows = db
    .prepare(
      `SELECT t.*, c.name as category_name, c.color as category_color, c.dre_group
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       WHERE t.date BETWEEN ? AND ?
       ORDER BY t.date DESC, t.id DESC`
    )
    .all(from, to);
  res.json(rows);
});

transactionsRouter.post("/", (req, res) => {
  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { kind, description, amount, date, category_id, status } = parsed.data;
  const info = db
    .prepare(
      `INSERT INTO transactions (kind, description, amount, date, category_id, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(kind, description, amount, date, category_id, status);
  const row = db
    .prepare(
      `SELECT t.*, c.name as category_name, c.color as category_color, c.dre_group
       FROM transactions t JOIN categories c ON c.id = t.category_id WHERE t.id = ?`
    )
    .get(info.lastInsertRowid);
  res.status(201).json(row);
});

transactionsRouter.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const parsed = transactionSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const existing = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id);
  if (!existing) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const merged = { ...existing, ...parsed.data };
  db.prepare(
    `UPDATE transactions SET kind = ?, description = ?, amount = ?, date = ?, category_id = ?, status = ?
     WHERE id = ?`
  ).run(
    merged.kind,
    merged.description,
    merged.amount,
    merged.date,
    merged.category_id,
    merged.status,
    id
  );
  const row = db
    .prepare(
      `SELECT t.*, c.name as category_name, c.color as category_color, c.dre_group
       FROM transactions t JOIN categories c ON c.id = t.category_id WHERE t.id = ?`
    )
    .get(id);
  res.json(row);
});

transactionsRouter.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
  if (info.changes === 0) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.status(204).end();
});
