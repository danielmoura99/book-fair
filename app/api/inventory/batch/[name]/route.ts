//app/api/inventory/batch/[name]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Obter detalhes de um lote específico
export async function GET(
  req: Request,
  { params }: { params: { name: string } }
) {
  try {
    const batchName = decodeURIComponent(params.name);

    // Buscar estatísticas do lote
    const books = await prisma.inventoryBook.findMany({
      where: { batchName },
      include: {
        entries: true,
      },
    });

    if (books.length === 0) {
      return NextResponse.json(
        { error: "Lote não encontrado" },
        { status: 404 }
      );
    }

    // Calcular estatísticas
    const totalBooks = books.length;
    const totalQuantity = books.reduce((sum, book) => sum + book.quantity, 0);
    const totalEntries = books.reduce(
      (sum, book) => sum + book.entries.length,
      0
    );
    const totalValue = books.reduce(
      (sum, book) => sum + Number(book.coverPrice) * book.quantity,
      0
    );

    // Agrupar por editora
    const publisherGroups = books.reduce((acc, book) => {
      const publisher = book.publisher;
      if (!acc[publisher]) {
        acc[publisher] = {
          totalBooks: 0,
          totalQuantity: 0,
          totalValue: 0,
        };
      }

      acc[publisher].totalBooks += 1;
      acc[publisher].totalQuantity += book.quantity;
      acc[publisher].totalValue += Number(book.coverPrice) * book.quantity;

      return acc;
    }, {} as Record<string, { totalBooks: number; totalQuantity: number; totalValue: number }>);

    return NextResponse.json({
      batchName,
      summary: {
        totalBooks,
        totalQuantity,
        totalEntries,
        totalValue,
      },
      publishers: Object.entries(publisherGroups).map(([name, stats]) => ({
        name,
        ...stats,
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes do lote:", error);
    return NextResponse.json(
      { error: "Erro ao buscar detalhes do lote" },
      { status: 500 }
    );
  }
}

// DELETE - Remover um lote específico
export async function DELETE(
  req: Request,
  { params }: { params: { name: string } }
) {
  try {
    const batchName = decodeURIComponent(params.name);

    // Verifica se o lote existe
    const books = await prisma.inventoryBook.findMany({
      where: { batchName },
      select: { id: true },
    });

    if (books.length === 0) {
      return NextResponse.json(
        { error: "Lote não encontrado" },
        { status: 404 }
      );
    }

    // Buscar IDs de todas as entradas associadas ao lote
    const bookIds = books.map((book) => book.id);

    // Executar a exclusão em uma transação
    await prisma.$transaction([
      // Primeiro excluir as entradas
      prisma.inventoryEntry.deleteMany({
        where: {
          inventoryBookId: { in: bookIds },
          batchName,
        },
      }),

      // Depois excluir os livros
      prisma.inventoryBook.deleteMany({
        where: { batchName },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Lote ${batchName} removido com sucesso`,
    });
  } catch (error) {
    console.error("Erro ao remover lote:", error);
    return NextResponse.json(
      { error: "Erro ao remover lote" },
      { status: 500 }
    );
  }
}
