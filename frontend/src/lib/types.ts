export type Kind = "entrada" | "saida";
export type Status = "pago" | "pendente";
export type DreGroup =
  | "receita"
  | "deducoes"
  | "cmv"
  | "despesas_operacionais"
  | "despesas_financeiras"
  | "receitas_financeiras";

export interface Category {
  id: number;
  name: string;
  kind: Kind;
  dre_group: DreGroup;
  color: string;
}

export interface Transaction {
  id: number;
  kind: Kind;
  description: string;
  amount: number;
  date: string;
  category_id: number;
  category_name: string;
  category_color: string;
  dre_group: DreGroup;
  status: Status;
  created_at: string;
}

export interface Summary {
  entradas: number;
  saidas: number;
  saldo: number;
  aReceber: number;
  aPagar: number;
  porCategoria: Array<{ category_name: string; category_color: string; kind: Kind; total: number }>;
  porDia: Array<{ date: string; entradas: number; saidas: number }>;
}

export interface Dre {
  receitaBruta: number;
  deducoes: number;
  receitaLiquida: number;
  cmv: number;
  lucroBruto: number;
  despesasOperacionais: number;
  resultadoOperacional: number;
  receitasFinanceiras: number;
  despesasFinanceiras: number;
  lucroLiquido: number;
  margemLiquida: number;
}
