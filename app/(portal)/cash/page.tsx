/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(portal)/cash/page.tsx

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "@/lib/prisma";
import { calculateRegisterBalance } from "./_actions/cash_actions";
import { CashRegisterStatus } from "./_components/cash-register-status";
import { TransactionStatement } from "./_components/transaction-statement";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/sidebar";
import { AdminAuth } from "@/components/admin-auth";

async function getActiveRegister() {
  return prisma.cashRegister.findFirst({
    where: { status: "OPEN" },
    include: {
      transactions: {
        include: {
          book: true,
          payments: true,
        },
        orderBy: { sequentialId: "desc" },
      },
      withdrawals: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

// ✅ CORRIGIDO: Função para buscar dados dos livros devolvidos separadamente
async function enrichTransactionsWithReturnedBooks(register: any) {
  if (!register) return register;

  // Buscar IDs únicos de livros devolvidos
  const returnedBookIds = register.transactions
    .filter((t: any) => t.returnedBookId)
    .map((t: any) => t.returnedBookId)
    .filter(
      (id: string, index: number, self: string[]) => self.indexOf(id) === index
    );

  // Buscar dados dos livros devolvidos
  const returnedBooks = await prisma.book.findMany({
    where: {
      id: { in: returnedBookIds },
    },
    select: {
      id: true,
      title: true,
      codFle: true,
    },
  });

  // Criar mapa para lookup rápido
  const returnedBooksMap = returnedBooks.reduce((acc, book) => {
    acc[book.id] = book;
    return acc;
  }, {} as Record<string, any>);

  // Enriquecer transações com dados do livro devolvido
  const enrichedTransactions = register.transactions.map(
    (transaction: any) => ({
      ...transaction,
      returnedBook: transaction.returnedBookId
        ? returnedBooksMap[transaction.returnedBookId] || null
        : null,
    })
  );

  return {
    ...register,
    transactions: enrichedTransactions,
  };
}

export default async function CashPage() {
  const activeRegisterRaw = await getActiveRegister();
  const activeRegister = await enrichTransactionsWithReturnedBooks(
    activeRegisterRaw
  );

  const balance = activeRegister
    ? await calculateRegisterBalance(activeRegister.id)
    : 0;

  return (
    <AdminAuth pageName="Caixa">
      <Navbar />
      <div className="flex flex-col space-y-8 p-8">
        {/* Status do Caixa */}
        <div className="rounded-lg border bg-card">
          <CashRegisterStatus
            activeRegister={activeRegister}
            currentBalance={balance}
          />
        </div>

        <Separator />

        {/* Extrato de Transações */}
        {activeRegister && (
          <div className="rounded-lg border bg-card">
            <TransactionStatement register={activeRegister} />
          </div>
        )}
      </div>
    </AdminAuth>
  );
}
