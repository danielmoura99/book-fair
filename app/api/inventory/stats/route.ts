//app/api/inventory/stats/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Estatísticas gerais do inventário
    const totalBooks = await prisma.inventoryBook.count();

    // Total de livros em estoque (com quantidade > 0)
    const booksInStock = await prisma.inventoryBook.count({
      where: {
        quantity: {
          gt: 0,
        },
      },
    });

    // Quantidade total de itens no inventário
    const totalItems = await prisma.inventoryBook.aggregate({
      _sum: {
        quantity: true,
      },
    });

    // Valor total do inventário (quantidade * preço de capa)
    const inventoryBooks = await prisma.inventoryBook.findMany({
      select: {
        quantity: true,
        coverPrice: true,
      },
    });

    const totalValue = inventoryBooks.reduce(
      (sum, book) => sum + book.quantity * Number(book.coverPrice),
      0
    );

    // Top 5 editoras por quantidade de livros
    const publisherStats = await prisma.inventoryBook.groupBy({
      by: ["publisher"],
      _count: {
        id: true,
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    // Top 5 distribuidores por quantidade de livros
    const distributorStats = await prisma.inventoryBook.groupBy({
      by: ["distributor"],
      _count: {
        id: true,
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    // Formatação dos dados de editora
    const publishers = publisherStats.map((p) => ({
      name: p.publisher,
      titleCount: p._count.id,
      quantity: p._sum.quantity || 0,
    }));

    // Formatação dos dados de distribuidor
    const distributors = distributorStats.map((d) => ({
      name: d.distributor,
      titleCount: d._count.id,
      quantity: d._sum.quantity || 0,
    }));

    return NextResponse.json({
      summary: {
        totalBooks,
        booksInStock,
        totalItems: totalItems._sum.quantity || 0,
        totalValue,
        percentInStock: totalBooks > 0 ? (booksInStock / totalBooks) * 100 : 0,
      },
      publishers,
      distributors,
    });
  } catch (error) {
    console.error("Erro ao obter estatísticas do inventário:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao obter estatísticas";

    return NextResponse.json(
      { error: "Erro ao obter estatísticas", message: errorMessage },
      { status: 500 }
    );
  }
}
