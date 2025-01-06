"use client";

import { Transaction, Book } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface TransactionWithBook extends Transaction {
  book: Book;
}

export function useTransactions() {
  return useQuery<TransactionWithBook[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await axios.get("/api/transactions");
      return response.data;
    },
  });
}
