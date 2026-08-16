import type { PaymentMethod } from "./types";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: "pix",
  boleto: "boleto",
  cartao_credito: "cartão de crédito",
  transferencia: "transferência",
  dinheiro: "dinheiro",
  outro: "outro",
};

export const PAYMENT_METHOD_OPTIONS: PaymentMethod[] = [
  "pix",
  "boleto",
  "cartao_credito",
  "transferencia",
  "dinheiro",
  "outro",
];
