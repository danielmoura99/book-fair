//lib/payment-utils.ts
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  CASH: "Dinheiro",
  PIX: "PIX",
  EXCHANGE: "Troca ou Devolução",
};

export const formatPaymentMethod = (method: string): string => {
  return PAYMENT_METHOD_LABELS[method] || method;
};
