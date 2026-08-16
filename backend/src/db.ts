import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data.db");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('entrada', 'saida')),
    dre_group TEXT NOT NULL CHECK (dre_group IN (
      'receita', 'deducoes', 'cmv', 'despesas_operacionais',
      'despesas_financeiras', 'receitas_financeiras'
    )),
    color TEXT NOT NULL DEFAULT '#2DD4BF'
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL CHECK (kind IN ('entrada', 'saida')),
    description TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    date TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    status TEXT NOT NULL DEFAULT 'pago' CHECK (status IN ('pago', 'pendente')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
`);

const seedCount = db.prepare("SELECT COUNT(*) as c FROM categories").get() as { c: number };

if (seedCount.c === 0) {
  const insertCategory = db.prepare(
    "INSERT INTO categories (name, kind, dre_group, color) VALUES (?, ?, ?, ?)"
  );
  const seed: Array<[string, string, string, string]> = [
    ["Venda de calçados", "entrada", "receita", "#2DD4BF"],
    ["Venda de acessórios", "entrada", "receita", "#34D399"],
    ["Receita financeira", "entrada", "receitas_financeiras", "#3B82F6"],
    ["Impostos sobre venda", "saida", "deducoes", "#F5A623"],
    ["Devoluções", "saida", "deducoes", "#EF4444"],
    ["Matéria-prima e insumos", "saida", "cmv", "#9B6FFF"],
    ["Produção / fabricação", "saida", "cmv", "#FF4FA3"],
    ["Aluguel", "saida", "despesas_operacionais", "#F5A623"],
    ["Folha de pagamento", "saida", "despesas_operacionais", "#EF4444"],
    ["Marketing", "saida", "despesas_operacionais", "#9B6FFF"],
    ["Logística e frete", "saida", "despesas_operacionais", "#3B82F6"],
    ["Despesas administrativas", "saida", "despesas_operacionais", "#8B958F"],
    ["Juros e taxas bancárias", "saida", "despesas_financeiras", "#EF4444"],
  ];
  const insertMany = db.transaction((rows: typeof seed) => {
    for (const row of rows) insertCategory.run(...row);
  });
  insertMany(seed);
}
