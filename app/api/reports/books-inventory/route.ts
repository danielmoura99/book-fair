// app/api/reports/books-inventory/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Buscar todos os livros com suas informações
    const books = await prisma.book.findMany({
      select: {
        id: true,
        codFle: true,
        title: true,
        publisher: true,
        distributor: true,
        quantity: true,
      },
      orderBy: {
        title: "asc",
      },
    });

    // Para cada livro, calcular a quantidade vendida
    const booksWithSales = await Promise.all(
      books.map(async (book) => {
        // Somar todas as transações de venda para este livro
        const salesData = await prisma.transaction.aggregate({
          where: {
            bookId: book.id,
            type: "SALE",
          },
          _sum: {
            quantity: true,
          },
        });

        const quantitySold = salesData._sum.quantity || 0;

        return {
          ...book,
          quantitySold,
        };
      })
    );

    return NextResponse.json(booksWithSales);
  } catch (error) {
    console.error("Erro ao buscar relatório de estoque:", error);
    return NextResponse.json(
      { error: "Erro ao buscar relatório de estoque" },
      { status: 500 }
    );
  }
}
