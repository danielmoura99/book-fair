import { prisma } from "@/lib/prisma";
import { AddTransactionButton } from "../transactions/_components/add-transaction-button";
import { RecentTransactions } from "./_components/recent-transactions";
import { DailyQuantityChart } from "./_components/daily-quantity-chart";
import { TotalBookSalesChart } from "./_components/total-book-sales-chart";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/sidebar";

async function getTotalQuantity() {
  const total = await prisma.transaction.aggregate({
    _sum: {
      quantity: true,
    },
  });
  return total._sum.quantity || 0;
}

async function getRecentTransactions() {
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
    },
  });
  return transactions.map((transaction) => ({
    ...transaction,
    totalAmount: Number(transaction.totalAmount),
    book: {
      ...transaction.book,
      coverPrice: Number(transaction.book.coverPrice),
    },
  }));
}

async function getAllTransactions() {
  const transactions = await prisma.transaction.findMany({
    orderBy: {
      transactionDate: "desc",
    },
    include: {
      book: true,
    },
  });

  return transactions.map((transaction) => ({
    ...transaction,
    totalAmount: Number(transaction.totalAmount),
    book: {
      ...transaction.book,
      coverPrice: Number(transaction.book.coverPrice),
    },
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
                  <AddTransactionButton />
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
