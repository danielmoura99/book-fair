//app/api/transactions/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const activeCashRegister = await prisma.cashRegister.findFirst({
      where: { status: "OPEN" },
    });

    if (!activeCashRegister) {
      return NextResponse.json(
        { error: "Não há caixa aberto para editar a venda" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const currentTransaction = await tx.transaction.findUnique({
        where: { id: params.id },
        include: { book: true, payments: true },
      });

      if (!currentTransaction) {
        throw new Error("Transação não encontrada");
      }

      // Ajustar quantidade se necessário
      if (body.quantity !== currentTransaction.quantity) {
        const quantityDiff = body.quantity - currentTransaction.quantity;
        const book = await tx.book.findUnique({
          where: { id: currentTransaction.bookId },
        });

        if (!book) {
          throw new Error("Livro não encontrado");
        }

        if (quantityDiff > 0 && book.quantity < quantityDiff) {
          throw new Error("Quantidade insuficiente em estoque");
        }

        await tx.book.update({
          where: { id: currentTransaction.bookId },
          data: {
            quantity: {
              decrement: quantityDiff,
            },
          },
        });
      }

      // Atualizar pagamento existente ou criar novo
      if (currentTransaction.payments[0]) {
        await tx.payment.update({
          where: { id: currentTransaction.payments[0].id },
          data: {
            method: body.paymentMethod,
            amount: String(body.totalAmount),
          },
        });
      } else {
        await tx.payment.create({
          data: {
            transactionId: params.id,
            method: body.paymentMethod,
            amount: String(body.totalAmount),
          },
        });
      }

      // Atualizar a transação
      const updatedTransaction = await tx.transaction.update({
        where: { id: params.id },
        data: {
          quantity: body.quantity,
          totalAmount: new Prisma.Decimal(body.totalAmount.toString()),
          type: body.type || "SALE",
          transactionDate: body.date ? new Date(body.date) : undefined,
          cashRegisterId: activeCashRegister.id,
        },
        include: {
          book: true,
          payments: true,
        },
      });

      return updatedTransaction;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    return NextResponse.json(
      {
        error: "Erro ao atualizar transação",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
