import { Router } from "express";
import { pool } from "../db.js";

export const storesRouter = Router();

storesRouter.get("/", async (_req, res) => {
  const result = await pool.query("SELECT * FROM stores ORDER BY name");
  res.json(result.rows);
});
