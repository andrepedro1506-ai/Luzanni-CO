import type {
  Category,
  Cheque,
  DespesasAbertas,
  DespesasPorGrupo,
  Dre,
  ExpenseGroup,
  Order,
  PedidosSummary,
  Store,
  Summary,
  Supplier,
  Transaction,
} from "./types";
import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL ?? "";
const BASE = `${API_URL}/api`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
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
  storeId?: number | null;
}

function qs(range?: Range) {
  if (!range) return "";
  const params = new URLSearchParams({ from: range.from, to: range.to });
  if (range.storeId) params.set("store_id", String(range.storeId));
  return `?${params.toString()}`;
}

export const api = {
  categories: {
    list: () => request<Category[]>("/categories"),
  },
  stores: {
    list: () => request<Store[]>("/stores"),
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
    pedidos: (range: Range) => request<PedidosSummary>(`/reports/pedidos${qs(range)}`),
    despesasPorGrupo: (range: Range) =>
      request<DespesasPorGrupo>(`/reports/despesas-por-grupo${qs(range)}`),
    despesasAbertas: (storeId?: number | null) => {
      const params = new URLSearchParams();
      if (storeId) params.set("store_id", String(storeId));
      const query = params.toString();
      return request<DespesasAbertas>(`/reports/despesas-abertas${query ? `?${query}` : ""}`);
    },
  },
  expenseGroups: {
    list: () => request<ExpenseGroup[]>("/expense-groups"),
    create: (data: { name: string; color?: string }) =>
      request<ExpenseGroup>("/expense-groups", { method: "POST", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/expense-groups/${id}`, { method: "DELETE" }),
  },
  suppliers: {
    list: () => request<Supplier[]>("/suppliers"),
    create: (data: Partial<Supplier>) =>
      request<Supplier>("/suppliers", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Supplier>) =>
      request<Supplier>(`/suppliers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/suppliers/${id}`, { method: "DELETE" }),
  },
  orders: {
    list: (range?: Range) => request<Order[]>(`/orders${qs(range)}`),
    create: (data: Partial<Order>) =>
      request<Order>("/orders", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Order>) =>
      request<Order>(`/orders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/orders/${id}`, { method: "DELETE" }),
  },
  cheques: {
    list: (storeId?: number | null) => {
      const params = new URLSearchParams();
      if (storeId) params.set("store_id", String(storeId));
      const query = params.toString();
      return request<Cheque[]>(`/cheques${query ? `?${query}` : ""}`);
    },
    create: (data: Partial<Cheque>) =>
      request<Cheque>("/cheques", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Cheque>) =>
      request<Cheque>(`/cheques/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/cheques/${id}`, { method: "DELETE" }),
  },
};
