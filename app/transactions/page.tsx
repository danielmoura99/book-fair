import Navbar from "@/components/sidebar";
import { TransactionDataTable } from "./_components/transaction-data-table";
import { prisma } from "@/lib/prisma";
import { AddTransactionButton } from "./_components/add-transaction-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SerializedTransaction } from "@/types";

async function getTransactions(): Promise<SerializedTransaction[]> {
  const transactions = await prisma.transaction.findMany({
    orderBy: {
      transactionDate: "desc",
    },
    include: {
      book: true,
    },
  });

  // Serializa os dados antes de passar para o cliente
  return transactions.map((transaction) => ({
    ...transaction,
    totalAmount: Number(transaction.totalAmount),
    priceDifference: transaction.priceDifference
      ? Number(transaction.priceDifference)
      : null,
    book: {
      ...transaction.book,
      coverPrice: Number(transaction.book.coverPrice),
    },
  }));
}

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <>
      <Navbar />
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <h2 className="text-2xl font-bold tracking-tight">Transações</h2>
          <AddTransactionButton />
        </div>
        <ScrollArea className="flex-1 p-6 pt-0">
          <TransactionDataTable data={transactions} />
        </ScrollArea>
      </div>
    </>
  );
}
