// app/(portal)/cash/page.tsx

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "@/lib/prisma";
import { calculateRegisterBalance } from "./_actions/cash_actions";
import { CashRegisterStatus } from "./_components/cash-register-status";
import { TransactionStatement } from "./_components/transaction-statement";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/sidebar";

async function getActiveRegister() {
  return prisma.cashRegister.findFirst({
    where: { status: "OPEN" },
    include: {
      transactions: {
        include: {
          book: true,
          payments: true, // Incluindo os pagamentos
        },
        orderBy: { createdAt: "desc" },
      },
      withdrawals: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function CashPage() {
  const activeRegister = await getActiveRegister();
  const balance = activeRegister
    ? await calculateRegisterBalance(activeRegister.id)
    : 0;

  return (
    <>
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
    </>
  );
}
