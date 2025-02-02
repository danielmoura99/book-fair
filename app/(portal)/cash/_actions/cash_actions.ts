"use server";

import { prisma } from "@/lib/prisma";
//import { revalidatePath } from "next/cache";

export async function calculateRegisterBalance(registerId: string) {
  const register = await prisma.cashRegister.findUnique({
    where: { id: registerId },
    include: {
      transactions: true,
      withdrawals: true,
    },
  });

  if (!register) return 0;

  const initialAmount = Number(register.initialAmount);
  const transactionsTotal = register.transactions.reduce(
    (sum, t) => sum + Number(t.totalAmount),
    0
  );
  const withdrawalsTotal = register.withdrawals.reduce(
    (sum, w) => sum + Number(w.amount),
    0
  );

  return initialAmount + transactionsTotal - withdrawalsTotal;
}
