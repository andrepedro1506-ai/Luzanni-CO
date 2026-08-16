import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";

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

categoriesRouter.get("/", (_req, res) => {
  const rows = db.prepare("SELECT * FROM categories ORDER BY name").all();
  res.json(rows);
});

categoriesRouter.post("/", (req, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { name, kind, dre_group, color } = parsed.data;
  const info = db
    .prepare("INSERT INTO categories (name, kind, dre_group, color) VALUES (?, ?, ?, ?)")
    .run(name, kind, dre_group, color);
  const row = db.prepare("SELECT * FROM categories WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(row);
});
