//app/api/reports/sold-books/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const soldBooks = await prisma.transaction.groupBy({
      by: ["bookId"],
      where: {
        type: "SALE",
      },
      _sum: {
        quantity: true,
        totalAmount: true,
      },
    });

    const booksWithDetails = await Promise.all(
      soldBooks.map(async (item) => {
        const book = await prisma.book.findUnique({
          where: { id: item.bookId },
          select: {
            codFle: true,
            title: true,
          },
        });

        const totalQuantity = item._sum.quantity || 0;
        const totalAmount = Number(item._sum.totalAmount) || 0;

        return {
          codFle: book?.codFle || "",
          title: book?.title || "",
          totalQuantity,
          totalAmount,
          averagePrice: totalQuantity > 0 ? totalAmount / totalQuantity : 0,
        };
      })
    );

    return NextResponse.json(booksWithDetails);
  } catch (error) {
    console.error("Erro ao buscar relatório de livros:", error);
    return NextResponse.json(
      { error: "Erro ao buscar relatório de livros" },
      { status: 500 }
    );
  }
}
