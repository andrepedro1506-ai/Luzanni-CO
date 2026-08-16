import type { Category, Dre, Summary, Transaction } from "./types";

const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface Range {
  from: string;
  to: string;
}

function qs(range?: Range) {
  if (!range) return "";
  const params = new URLSearchParams({ from: range.from, to: range.to });
  return `?${params.toString()}`;
}

export const api = {
  categories: {
    list: () => request<Category[]>("/categories"),
  },
  transactions: {
    list: (range?: Range) => request<Transaction[]>(`/transactions${qs(range)}`),
    create: (data: Partial<Transaction>) =>
      request<Transaction>("/transactions", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Transaction>) =>
      request<Transaction>(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/transactions/${id}`, { method: "DELETE" }),
  },
  reports: {
    summary: (range: Range) => request<Summary>(`/reports/summary${qs(range)}`),
    dre: (range: Range) => request<Dre>(`/reports/dre${qs(range)}`),
  },
};
