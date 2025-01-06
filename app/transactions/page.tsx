import Navbar from "@/components/sidebar";
import { TransactionDataTable } from "./_components/transaction-data-table";
import { prisma } from "@/lib/prisma";
import { AddTransactionButton } from "./_components/add-transaction-button";

async function getTransactions() {
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
      <div className="flex h-full flex-col space-y-6 overflow-hidden p-6">
        <div className="flex w-full items-center justify-between">
          <div className="flex w-full items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Transações</h2>
            <AddTransactionButton />
          </div>
        </div>
        <TransactionDataTable data={transactions} />
      </div>
    </>
  );
}
