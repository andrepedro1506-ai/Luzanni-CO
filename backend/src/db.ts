import { Pool, types } from "pg";
import "dotenv/config";

// pg returns bigint (id columns) and numeric (money columns) as strings by
// default to avoid precision loss. Every id/amount in this app fits safely
// in a JS number, and the rest of the codebase assumes plain numbers, so
// parse both as numbers here instead of patching every call site.
types.setTypeParser(20, (val) => parseInt(val, 10)); // int8 / bigint
types.setTypeParser(1700, (val) => parseFloat(val)); // numeric / decimal

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Configure it in backend/.env");
}

export const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
});
