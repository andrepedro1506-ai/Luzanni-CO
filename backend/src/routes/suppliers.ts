import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";

export const suppliersRouter = Router();

const supplierSchema = z.object({
  name: z.string().min(1),
  cnpj: z.string().optional(),
  contact_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  notes: z.string().optional(),
});

suppliersRouter.get("/", async (_req, res) => {
  const result = await pool.query("SELECT * FROM suppliers ORDER BY name");
  res.json(result.rows);
});

suppliersRouter.post("/", async (req, res) => {
  const parsed = supplierSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { name, cnpj, contact_name, phone, email, city, state, notes } = parsed.data;
  const result = await pool.query(
    `INSERT INTO suppliers (name, cnpj, contact_name, phone, email, city, state, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [name, cnpj ?? null, contact_name ?? null, phone ?? null, email ?? null, city ?? null, state ?? null, notes ?? null]
  );
  res.status(201).json(result.rows[0]);
});

suppliersRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = supplierSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const existing = await pool.query("SELECT * FROM suppliers WHERE id = $1", [id]);
  if (existing.rows.length === 0) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const merged = { ...existing.rows[0], ...parsed.data };
  const result = await pool.query(
    `UPDATE suppliers SET name = $1, cnpj = $2, contact_name = $3, phone = $4, email = $5, city = $6, state = $7, notes = $8
     WHERE id = $9 RETURNING *`,
    [
      merged.name,
      merged.cnpj,
      merged.contact_name,
      merged.phone,
      merged.email,
      merged.city,
      merged.state,
      merged.notes,
      id,
    ]
  );
  res.json(result.rows[0]);
});

suppliersRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const result = await pool.query("DELETE FROM suppliers WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.status(204).end();
});
