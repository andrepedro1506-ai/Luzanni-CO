import express from "express";
import cors from "cors";
import { requireAuth } from "./auth.js";
import { transactionsRouter } from "./routes/transactions.js";
import { categoriesRouter } from "./routes/categories.js";
import { reportsRouter } from "./routes/reports.js";
import { suppliersRouter } from "./routes/suppliers.js";
import { ordersRouter } from "./routes/orders.js";
import { storesRouter } from "./routes/stores.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/transactions", requireAuth, transactionsRouter);
app.use("/api/categories", requireAuth, categoriesRouter);
app.use("/api/reports", requireAuth, reportsRouter);
app.use("/api/suppliers", requireAuth, suppliersRouter);
app.use("/api/orders", requireAuth, ordersRouter);
app.use("/api/stores", requireAuth, storesRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
