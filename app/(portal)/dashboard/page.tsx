// app/(portal)/dashboard/page.tsx - Funções atualizadas

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "@/lib/prisma";
import { DailyQuantityChart } from "./_components/daily-quantity-chart";
import { TotalBookSalesChart } from "./_components/total-book-sales-chart";
import { SubjectSalesChart } from "./_components/subject-sales-chart";
import { DailySalesChart } from "./_components/daily-sales-chart";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/sidebar";
import { SerializedTransaction } from "@/types";

// ATUALIZADO: Incluir saleGroupId nas consultas
async function getAllTransactions(): Promise<SerializedTransaction[]> {
  const transactions = await prisma.transaction.findMany({
    orderBy: {
      sequentialId: "desc",
    },
    include: {
      book: true,
      payments: true,
    },
  });

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

export default async function DashboardPage() {
  const allTransactions = await getAllTransactions();

  return (
    <>
      <Navbar />
      <div className="flex h-screen bg-background">
        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>

          <div className="space-y-6">
            {/* Primeira fileira - 2 gráficos */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">
                    Quantidade de Vendas por Dia
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    TOTAL: <span className="font-bold text-lg text-blue-600">
                      {allTransactions.reduce((sum, transaction) => sum + transaction.quantity, 0)} unidades
                    </span>
                  </p>
                </div>
                <div className="h-[360px]">
                  <DailyQuantityChart transactions={allTransactions} />
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  TOP 10 Livros (Quantidade)
                </h3>
                <div className="h-[400px]">
                  <TotalBookSalesChart transactions={allTransactions} />
                </div>
              </Card>
            </div>

            {/* Segunda fileira - 2 gráficos */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Vendas por Assunto
                </h3>
                <div className="h-[400px]">
                  <SubjectSalesChart transactions={allTransactions} />
                </div>
              </Card>

              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">
                    Vendas Financeiras por Dia
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    TOTAL: <span className="font-bold text-lg text-green-600">
                      R$ {allTransactions.reduce((sum, transaction) => sum + transaction.totalAmount, 0).toFixed(2).replace('.', ',')}
                    </span>
                  </p>
                </div>
                <div className="h-[360px]">
                  <DailySalesChart transactions={allTransactions} />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
