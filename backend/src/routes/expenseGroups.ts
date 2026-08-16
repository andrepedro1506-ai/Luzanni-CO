import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";

export const expenseGroupsRouter = Router();

const DEFAULT_DRE_GROUP = "despesas_operacionais";

const expenseGroupSchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1).default("#0D9488"),
});

expenseGroupsRouter.get("/", async (_req, res) => {
  const result = await pool.query(
    `SELECT eg.*, c.dre_group
     FROM expense_groups eg
     JOIN categories c ON c.id = eg.category_id
     ORDER BY eg.name`
  );
  res.json(result.rows);
});

expenseGroupsRouter.post("/", async (req, res) => {
  const parsed = expenseGroupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { name, color } = parsed.data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const category = await client.query(
      "INSERT INTO categories (name, kind, dre_group, color) VALUES ($1, 'saida', $2, $3) RETURNING id",
      [name, DEFAULT_DRE_GROUP, color]
    );
    const group = await client.query(
      "INSERT INTO expense_groups (name, color, category_id) VALUES ($1, $2, $3) RETURNING *",
      [name, color, category.rows[0].id]
    );
    await client.query("COMMIT");
    res.status(201).json({ ...group.rows[0], dre_group: DEFAULT_DRE_GROUP });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

expenseGroupsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await pool.query("DELETE FROM expense_groups WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "23503") {
      res.status(409).json({ error: "grupo em uso por lançamentos existentes" });
      return;
    }
    throw err;
  }
});
