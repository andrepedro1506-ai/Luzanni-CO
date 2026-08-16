import express from "express";
import cors from "cors";
import { requireAuth } from "./auth.js";
import { transactionsRouter } from "./routes/transactions.js";
import { categoriesRouter } from "./routes/categories.js";
import { reportsRouter } from "./routes/reports.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/transactions", requireAuth, transactionsRouter);
app.use("/api/categories", requireAuth, categoriesRouter);
app.use("/api/reports", requireAuth, reportsRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
