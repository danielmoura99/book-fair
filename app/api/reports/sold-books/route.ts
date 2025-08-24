//app/api/reports/sold-books/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const headers = new Headers();
    headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");
    headers.set("Surrogate-Control", "no-store");

    const soldBooks = await prisma.transaction.groupBy({
      by: ["bookId"],
      where: {
        type: "SALE",
        book: {
          subject: {
            not: "Outros", // ✅ NOVO: Excluir itens como embalagens, camisetas, etc.
          },
        },
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

    return new NextResponse(JSON.stringify(booksWithDetails), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Erro ao buscar relatório de livros:", error);
    return NextResponse.json(
      { error: "Erro ao buscar relatório de livros" },
      { status: 500 }
    );
  }
}
