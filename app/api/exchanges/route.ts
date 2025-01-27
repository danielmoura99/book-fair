import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const transactionDate = new Date();
    transactionDate.setHours(12);

    const result = await prisma.$transaction(async (tx) => {
      // Verificar livro devolvido
      const returnedBook = await tx.book.findUnique({
        where: { id: body.returnedBookId },
      });

      // Verificar novo livro
      const newBook = await tx.book.findUnique({
        where: { id: body.newBookId },
      });

      if (!returnedBook || !newBook) {
        throw new Error("Livro não encontrado");
      }

      if (newBook.quantity < 1) {
        throw new Error("Livro para troca sem estoque");
      }

      // Atualizar estoque do livro devolvido
      await tx.book.update({
        where: { id: body.returnedBookId },
        data: { quantity: { increment: 1 } },
      });

      // Atualizar estoque do novo livro
      await tx.book.update({
        where: { id: body.newBookId },
        data: { quantity: { decrement: 1 } },
      });

      // Registrar transação
      const transaction = await tx.transaction.create({
        data: {
          type: "EXCHANGE",
          bookId: body.newBookId,
          returnedBookId: body.returnedBookId,
          quantity: 1,
          totalAmount: body.priceDifference || "0",
          paymentMethod: body.paymentMethod || "EXCHANGE",
          transactionDate,
        },
        include: {
          book: true,
        },
      });

      return transaction;
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao processar troca",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
