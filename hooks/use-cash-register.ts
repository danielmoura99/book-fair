// src/hooks/use-cash-register.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CashRegister } from "@prisma/client";

interface CashRegisterWithDetails extends CashRegister {
  transactions: {
    totalAmount: number;
  }[];
  withdrawals: {
    amount: number;
  }[];
}

export function useCashRegister() {
  const {
    data: register,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<CashRegisterWithDetails>({
    queryKey: ["cash-register"],
    queryFn: async () => {
      const response = await axios.get("/api/cash-register");
      return response.data;
    },
  });

  // Calcula o saldo atual do caixa
  const currentBalance = register
    ? Number(register.initialAmount) +
      register.transactions.reduce(
        (sum, transaction) => sum + Number(transaction.totalAmount),
        0
      ) -
      register.withdrawals.reduce(
        (sum, withdrawal) => sum + Number(withdrawal.amount),
        0
      )
    : 0;

  return {
    register,
    isOpen: register?.status === "OPEN",
    currentBalance,
    isLoading,
    isError,
    error,
    refetch,
  };
}
