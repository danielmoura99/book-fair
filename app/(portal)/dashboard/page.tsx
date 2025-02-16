export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "@/lib/prisma";
import { AddTransactionButton } from "../transactions/_components/add-transaction-button";
import { RecentTransactions } from "./_components/recent-transactions";
import { DailyQuantityChart } from "./_components/daily-quantity-chart";
import { TotalBookSalesChart } from "./_components/total-book-sales-chart";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/sidebar";
import { ExchangeTransactionButton } from "../transactions/_components/exchange-transaction-button";
import { SerializedTransaction } from "@/types";

async function getTotalQuantity() {
  const total = await prisma.transaction.aggregate({
    _sum: {
      quantity: true,
    },
  });
  return total._sum.quantity || 0;
}

async function getRecentTransactions(): Promise<SerializedTransaction[]> {
  const transactions = await prisma.transaction.findMany({
    take: 5,
    orderBy: [
      {
        transactionDate: "desc",
      },
      {
        id: "desc", // garante ordem consistente para registros da mesma data
      },
    ],
    include: {
      book: true,
      payments: true,
    },
  });

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
    paymentMethod: transaction.payments[0]?.method || "",
  }));
}

async function getAllTransactions(): Promise<SerializedTransaction[]> {
  const transactions = await prisma.transaction.findMany({
    orderBy: {
      transactionDate: "desc",
    },
    include: {
      book: true,
      payments: true,
    },
  });

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
    paymentMethod: transaction.payments[0]?.method || "",
  }));
}

export default async function DashboardPage() {
  const totalQuantity = await getTotalQuantity();
  const recentTransactions = await getRecentTransactions();
  const allTransactions = await getAllTransactions();

  return (
    <>
      <Navbar />
      <div className="flex h-screen bg-background">
        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6"></div>

          <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
            <div className="col-span-4 space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total de Livros Vendidos
                    </p>
                    <h2 className="text-3xl font-bold">
                      {totalQuantity} unidades
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <ExchangeTransactionButton />
                    <AddTransactionButton />
                  </div>
                </div>
              </Card>

              <div className="grid gap-4 grid-cols-2">
                <Card className="p-4">
                  <h3 className="font-semibold">
                    Quantidade de Vendas por Dia
                  </h3>
                  <div className="mt-4 h-[300px]">
                    <DailyQuantityChart transactions={allTransactions} />
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold">
                    Vendas por Livro (Quantidade)
                  </h3>
                  <div className="mt-4 h-[300px]">
                    <TotalBookSalesChart transactions={allTransactions} />
                  </div>
                </Card>
              </div>
            </div>

            <div className="col-span-3">
              <Card className="h-[497px] p-4">
                {" "}
                {/* Altura ajustada para match com lado esquerdo */}
                <h3 className="font-semibold mb-4">Últimas Transações</h3>
                <RecentTransactions transactions={recentTransactions} />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
