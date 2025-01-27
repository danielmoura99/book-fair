//book-fair/app/api/transactions/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    // Verificar se existe um caixa aberto
    const activeCashRegister = await prisma.cashRegister.findFirst({
      where: { status: "OPEN" },
    });

    if (!activeCashRegister) {
      return NextResponse.json(
        { error: "Não há caixa aberto para editar a venda" },
        { status: 400 }
      );
    }

    // Usar transação do Prisma para garantir atomicidade
    const result = await prisma.$transaction(async (tx) => {
      // Buscar a transação atual
      const currentTransaction = await tx.transaction.findUnique({
        where: { id: params.id },
        include: { book: true },
      });

      if (!currentTransaction) {
        throw new Error("Transação não encontrada");
      }

      // Se houver mudança na quantidade, ajustar o estoque
      if (body.quantity !== currentTransaction.quantity) {
        const quantityDiff = body.quantity - currentTransaction.quantity;

        // Verificar estoque disponível
        const book = await tx.book.findUnique({
          where: { id: currentTransaction.bookId },
        });

        if (!book) {
          throw new Error("Livro não encontrado");
        }

        if (quantityDiff > 0 && book.quantity < quantityDiff) {
          throw new Error("Quantidade insuficiente em estoque");
        }

        // Atualizar estoque do livro
        await tx.book.update({
          where: { id: currentTransaction.bookId },
          data: {
            quantity: {
              decrement: quantityDiff, // Se quantityDiff for negativo, vai incrementar
            },
          },
        });
      }

      // Atualizar a transação
      const updatedTransaction = await tx.transaction.update({
        where: { id: params.id },
        data: {
          quantity: body.quantity,
          totalAmount: new Prisma.Decimal(body.totalAmount.toString()),
          paymentMethod: body.paymentMethod,
          type: body.type || "SALE",
          transactionDate: body.date ? new Date(body.date) : undefined,
          cashRegisterId: activeCashRegister.id,
        },
        include: {
          book: true,
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Usar transação do Prisma para garantir atomicidade
    await prisma.$transaction(async (tx) => {
      // Buscar a transação antes de excluir
      const transaction = await tx.transaction.findUnique({
        where: { id: params.id },
        include: { book: true },
      });

      if (!transaction) {
        throw new Error("Transação não encontrada");
      }

      // Verificar se o caixa está aberto
      const activeCashRegister = await tx.cashRegister.findFirst({
        where: { status: "OPEN" },
      });

      if (!activeCashRegister) {
        throw new Error("Não há caixa aberto para excluir a venda");
      }

      // Restaurar o estoque do livro
      await tx.book.update({
        where: { id: transaction.bookId },
        data: {
          quantity: {
            increment: transaction.quantity, // Devolver a quantidade ao estoque
          },
        },
      });

      // Excluir a transação
      await tx.transaction.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir transação:", error);
    return NextResponse.json(
      {
        error: "Erro ao excluir transação",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
