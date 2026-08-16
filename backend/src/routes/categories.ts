import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";

export const categoriesRouter = Router();

const categorySchema = z.object({
  name: z.string().min(1),
  kind: z.enum(["entrada", "saida"]),
  dre_group: z.enum([
    "receita",
    "deducoes",
    "cmv",
    "despesas_operacionais",
    "despesas_financeiras",
    "receitas_financeiras",
  ]),
  color: z.string().min(1).default("#2DD4BF"),
});

categoriesRouter.get("/", async (_req, res) => {
  const result = await pool.query("SELECT * FROM categories ORDER BY name");
  res.json(result.rows);
});

categoriesRouter.post("/", async (req, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { name, kind, dre_group, color } = parsed.data;
  const result = await pool.query(
    "INSERT INTO categories (name, kind, dre_group, color) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, kind, dre_group, color]
  );
  res.status(201).json(result.rows[0]);
});
