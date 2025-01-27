//book-fair/app/api/transactions/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const transactionDate = new Date(body.date);
    transactionDate.setHours(12);

    // Verificar se existe um caixa aberto
    const activeCashRegister = await prisma.cashRegister.findFirst({
      where: { status: "OPEN" },
    });

    if (!activeCashRegister) {
      return NextResponse.json(
        { error: "Não há caixa aberto para registrar a venda" },
        { status: 400 }
      );
    }

    // Usar transação do Prisma para garantir atomicidade
    const result = await prisma.$transaction(async (tx) => {
      // Verificar e atualizar o livro primeiro
      const book = await tx.book.findUnique({
        where: { id: body.bookId },
      });

      if (!book) {
        throw new Error("Livro não encontrado");
      }

      if (book.quantity < body.quantity) {
        throw new Error("Quantidade insuficiente em estoque");
      }

      // Atualizar o estoque do livro
      await tx.book.update({
        where: { id: body.bookId },
        data: {
          quantity: {
            decrement: body.quantity,
          },
        },
      });

      // Criar a transação
      const transaction = await tx.transaction.create({
        data: {
          bookId: body.bookId,
          quantity: body.quantity,
          totalAmount: body.totalAmount,
          paymentMethod: body.paymentMethod,
          transactionDate: transactionDate, // Usando apenas transactionDate
          cashRegisterId: activeCashRegister.id, // Associação com o caixa
          type: body.type || "SALE",
        },
        include: {
          book: true,
        },
      });

      return transaction;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return NextResponse.json(
      {
        error: "Erro ao criar transação",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
