export const dynamic = "force-dynamic";
export const revalidate = 0;

import Navbar from "@/components/sidebar";
import { TransactionDataTable } from "./_components/transaction-data-table";
import { prisma } from "@/lib/prisma";
import { AddTransactionButton } from "./_components/add-transaction-button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { SerializedTransaction } from "@/types";
import { AdminAuth } from "@/components/admin-auth";

async function getTransactions(): Promise<SerializedTransaction[]> {
  const transactions = await prisma.transaction.findMany({
    orderBy: [
      { sequentialId: "desc" }, // Ordenar por ID sequencial
    ],
    include: {
      book: true,
      payments: true,
    },
  });

  // Serializa os dados antes de passar para o cliente
  return transactions.map((transaction) => ({
    ...transaction,
    sequentialId: transaction.sequentialId,
    saleGroupId: transaction.saleGroupId, // ✅ INCLUÍDO: campo saleGroupId
    totalAmount: Number(transaction.totalAmount),
    priceDifference: transaction.priceDifference
      ? Number(transaction.priceDifference)
      : null,
    book: {
      ...transaction.book,
      coverPrice: Number(transaction.book.coverPrice),
      price: Number(transaction.book.price),
    },
    paymentMethod: transaction.payments[0]?.method || "",
  }));
}

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <AdminAuth pageName="Transações">
      <Navbar />
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Transações</h2>
            <p className="text-sm text-muted-foreground">
              {transactions.length} transações encontradas
            </p>
          </div>
          <AddTransactionButton />
        </div>
        <ScrollArea className="flex-1 p-6 pt-0">
          <TransactionDataTable data={transactions} />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </AdminAuth>
  );
}
