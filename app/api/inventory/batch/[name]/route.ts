/* eslint-disable @typescript-eslint/no-explicit-any */
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

    // Buscar todas as entradas do lote
    const entries = await prisma.inventoryEntry.findMany({
      where: { batchName },
      include: {
        inventoryBook: true,
      },
    });

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "Lote não encontrado" },
        { status: 404 }
      );
    }

    // Agrupar por livro
    const booksMap = entries.reduce((acc, entry) => {
      const bookId = entry.inventoryBookId;

      if (!acc[bookId]) {
        acc[bookId] = {
          book: entry.inventoryBook,
          totalQuantity: 0,
          entries: [],
        };
      }

      acc[bookId].totalQuantity += entry.quantity;
      acc[bookId].entries.push(entry);

      return acc;
    }, {} as Record<string, { book: any; totalQuantity: number; entries: any[] }>);

    const books = Object.values(booksMap);

    // Calcular estatísticas
    const totalBooks = books.length;
    const totalQuantity = books.reduce(
      (sum, item) => sum + item.totalQuantity,
      0
    );
    const totalEntries = entries.length;
    const totalValue = books.reduce(
      (sum, item) => sum + Number(item.book.coverPrice) * item.totalQuantity,
      0
    );

    // Agrupar por editora
    const publisherGroups = books.reduce((acc, item) => {
      const publisher = item.book.publisher;
      if (!acc[publisher]) {
        acc[publisher] = {
          totalBooks: 0,
          totalQuantity: 0,
          totalValue: 0,
        };
      }

      acc[publisher].totalBooks += 1;
      acc[publisher].totalQuantity += item.totalQuantity;
      acc[publisher].totalValue +=
        Number(item.book.coverPrice) * item.totalQuantity;

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
    const entries = await prisma.inventoryEntry.findMany({
      where: { batchName },
      select: { id: true, inventoryBookId: true, quantity: true },
    });

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "Lote não encontrado" },
        { status: 404 }
      );
    }

    // Agrupar entradas por inventoryBookId
    const bookQuantities = entries.reduce((acc, entry) => {
      if (!acc[entry.inventoryBookId]) {
        acc[entry.inventoryBookId] = 0;
      }
      acc[entry.inventoryBookId] += entry.quantity;
      return acc;
    }, {} as Record<string, number>);

    // Executar a exclusão em uma transação
    await prisma.$transaction(async (tx) => {
      // Atualizar as quantidades nos livros do inventário
      for (const [bookId, quantity] of Object.entries(bookQuantities)) {
        await tx.inventoryBook.update({
          where: { id: bookId },
          data: {
            quantity: {
              decrement: quantity,
            },
          },
        });
      }

      // Excluir as entradas
      await tx.inventoryEntry.deleteMany({
        where: { batchName },
      });
    });

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
