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
  store_id: number;
  expense_group_id: number | null;
  created_at: string;
}

export interface ExpenseGroup {
  id: number;
  name: string;
  color: string;
  category_id: number;
  dre_group: DreGroup;
}

export interface DespesasPorGrupo {
  groups: Array<{
    groupId: number;
    groupName: string;
    groupColor: string;
    total: number;
    count: number;
  }>;
  total: number;
}

export interface DespesasAbertas {
  aVencer: number;
  emAtraso: number;
  emAberto: number;
}

export interface Store {
  id: number;
  name: string;
  slug: string;
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

export interface Supplier {
  id: number;
  name: string;
  cnpj: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  created_at: string;
}

export type PaymentMethod =
  | "pix"
  | "boleto"
  | "cartao_credito"
  | "transferencia"
  | "dinheiro"
  | "outro";

export interface Order {
  id: number;
  supplier_id: number;
  supplier_name: string;
  order_date: string;
  amount: number;
  pairs_quantity: number;
  has_invoice: boolean;
  payment_method: PaymentMethod;
  notes: string | null;
  store_id: number;
  created_at: string;
}

export interface PedidosSummary {
  totalValor: number;
  totalPares: number;
  totalPedidos: number;
}

export type ChequeKind = "recebido" | "emitido";
export type ChequeStatus = "pendente" | "compensado" | "devolvido";

export interface Cheque {
  id: number;
  kind: ChequeKind;
  numero: string;
  valor: number;
  data_vencimento: string;
  contraparte: string;
  status: ChequeStatus;
  store_id: number;
  notes: string | null;
  created_at: string;
}
