"use client";

import { formatMoney } from "@/lib/utils";
import { Transaction, Book } from "@prisma/client";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { SerializedTransaction } from "@/types";
import { ScrollBar } from "@/components/ui/scroll-area";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TransactionWithBook extends Transaction {
  book: Book;
}

interface RecentTransactionsProps {
  transactions: SerializedTransaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  // Ordena as transações pela data mais recente primeiro
  const sortedTransactions = [...transactions].sort(
    (a, b) =>
      new Date(b.transactionDate).getTime() -
      new Date(a.transactionDate).getTime()
  );

  return (
    <ScrollArea className="h-[430px]">
      <div className="space-y-2 pr-4">
        {sortedTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 rounded-lg border"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  #{transaction.sequentialId}{" "}
                  {/* NOVO: Mostrar ID sequencial */}
                </span>
                <p className="font-medium text-sm">{transaction.book.title}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(transaction.transactionDate).toLocaleDateString(
                  "pt-BR"
                )}{" "}
                • {transaction.operatorName}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">
                {formatMoney(Number(transaction.totalAmount))}
              </p>
              <p className="text-xs text-muted-foreground">
                {transaction.quantity}{" "}
                {transaction.quantity === 1 ? "unidade" : "unidades"}
              </p>
            </div>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
