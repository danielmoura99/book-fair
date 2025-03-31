//app/api/inventory/books/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { InventoryBook, InventoryEntry } from "@prisma/client";

// Interface para tipagem
interface EntryWithBook extends InventoryEntry {
  inventoryBook: InventoryBook;
}

interface BookSummary extends InventoryBook {
  totalEntries: number;
  totalQuantity: number;
  entries: InventoryEntry[];
}

// GET - Buscar todos os livros do inventário por lote
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const batchName = searchParams.get("batch");

    // Verificar se foi fornecido um lote
    if (!batchName) {
      return NextResponse.json(
        { error: "É necessário fornecer um lote para buscar os livros" },
        { status: 400 }
      );
    }

    // Buscar todas as entradas do lote
    const entries = await prisma.inventoryEntry.findMany({
      where: {
        batchName: batchName,
      },
      include: {
        inventoryBook: true,
      },
    });

    // Agrupar por livro
    const booksMap: Record<string, BookSummary> = {};

    entries.forEach((entry: EntryWithBook) => {
      const book = entry.inventoryBook;
      const bookId = book.id;

      if (!booksMap[bookId]) {
        booksMap[bookId] = {
          ...book,
          totalEntries: 0,
          totalQuantity: 0,
          entries: [],
        };
      }

      booksMap[bookId].totalQuantity += entry.quantity;
      booksMap[bookId].totalEntries += 1;
      booksMap[bookId].entries.push(entry);
    });

    // Converter para array e serializar
    const books = Object.values(booksMap).map((book) => ({
      ...book,
      coverPrice: Number(book.coverPrice),
      price: Number(book.price),
    }));

    // Calcular estatísticas
    const totalBooks = books.length;
    const totalQuantity = books.reduce(
      (sum, book) => sum + book.totalQuantity,
      0
    );
    const totalValue = books.reduce(
      (sum, book) => sum + book.coverPrice * book.totalQuantity,
      0
    );

    return NextResponse.json({
      books,
      summary: {
        totalBooks,
        totalQuantity,
        totalValue,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar livros do inventário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar livros do inventário" },
      { status: 500 }
    );
  }
}
