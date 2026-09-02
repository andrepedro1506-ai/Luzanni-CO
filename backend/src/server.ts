import express from "express";
import cors from "cors";
import morgan from "morgan";
import { requireAuth } from "./auth.js";
import { transactionsRouter } from "./routes/transactions.js";
import { categoriesRouter } from "./routes/categories.js";
import { reportsRouter } from "./routes/reports.js";
import { suppliersRouter } from "./routes/suppliers.js";
import { ordersRouter } from "./routes/orders.js";
import { storesRouter } from "./routes/stores.js";
import { expenseGroupsRouter } from "./routes/expenseGroups.js";
import { chequesRouter } from "./routes/cheques.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/transactions", requireAuth, transactionsRouter);
app.use("/api/categories", requireAuth, categoriesRouter);
app.use("/api/reports", requireAuth, reportsRouter);
app.use("/api/suppliers", requireAuth, suppliersRouter);
app.use("/api/orders", requireAuth, ordersRouter);
app.use("/api/stores", requireAuth, storesRouter);
app.use("/api/expense-groups", requireAuth, expenseGroupsRouter);
app.use("/api/cheques", requireAuth, chequesRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "internal server error" });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
