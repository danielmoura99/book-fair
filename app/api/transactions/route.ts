import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Ajusta o fuso horário para considerar a data local
    const transactionDate = new Date(body.date);
    transactionDate.setHours(12); // Define meio-dia para evitar problemas de fuso horário

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
