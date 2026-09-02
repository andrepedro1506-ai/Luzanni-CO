import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";

export const chequesRouter = Router();

const chequeSchema = z.object({
  kind: z.enum(["recebido", "emitido"]),
  numero: z.string().min(1),
  valor: z.number().positive(),
  data_vencimento: z.string().min(1),
  contraparte: z.string().min(1),
  status: z.enum(["pendente", "compensado", "devolvido"]).optional(),
  store_id: z.number().int().positive(),
  notes: z.string().optional(),
});

function parseStoreId(query: Record<string, unknown>) {
  const raw = query.store_id;
  if (typeof raw !== "string" || raw === "") return null;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

chequesRouter.get("/", async (req, res) => {
  const storeId = parseStoreId(req.query as Record<string, unknown>);
  const params: unknown[] = [];
  let where = "";
  if (storeId) {
    params.push(storeId);
    where = `WHERE store_id = $${params.length}`;
  }
  const result = await pool.query(
    `SELECT * FROM cheques ${where} ORDER BY data_vencimento ASC, id DESC`,
    params
  );
  res.json(result.rows);
});

chequesRouter.post("/", async (req, res) => {
  const parsed = chequeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { kind, numero, valor, data_vencimento, contraparte, status, store_id, notes } = parsed.data;
  const result = await pool.query(
    `INSERT INTO cheques (kind, numero, valor, data_vencimento, contraparte, status, store_id, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [kind, numero, valor, data_vencimento, contraparte, status ?? "pendente", store_id, notes ?? null]
  );
  res.status(201).json(result.rows[0]);
});

chequesRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = chequeSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const existing = await pool.query("SELECT * FROM cheques WHERE id = $1", [id]);
  if (existing.rows.length === 0) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const merged = { ...existing.rows[0], ...parsed.data };
  const result = await pool.query(
    `UPDATE cheques SET kind = $1, numero = $2, valor = $3, data_vencimento = $4,
     contraparte = $5, status = $6, store_id = $7, notes = $8 WHERE id = $9 RETURNING *`,
    [
      merged.kind,
      merged.numero,
      merged.valor,
      merged.data_vencimento,
      merged.contraparte,
      merged.status,
      merged.store_id,
      merged.notes,
      id,
    ]
  );
  res.json(result.rows[0]);
});

chequesRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const result = await pool.query("DELETE FROM cheques WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.status(204).end();
});
