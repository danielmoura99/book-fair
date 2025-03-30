//app/api/inventory/books/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    // Buscar livros do inventário por lote
    const books = await prisma.inventoryBook.findMany({
      where: {
        batchName: batchName,
      },
      orderBy: {
        title: "asc",
      },
      include: {
        entries: true,
      },
    });

    // Formatar a resposta para incluir dados de totais
    const formattedBooks = books.map((book) => ({
      ...book,
      coverPrice: Number(book.coverPrice),
      price: Number(book.price),
      totalEntries: book.entries.length,
      totalQuantity: book.entries.reduce(
        (sum, entry) => sum + entry.quantity,
        0
      ),
    }));

    // Calcular estatísticas do lote
    const totalBooks = formattedBooks.length;
    const totalQuantity = formattedBooks.reduce(
      (sum, book) => sum + book.quantity,
      0
    );
    const totalValue = formattedBooks.reduce(
      (sum, book) => sum + book.coverPrice * book.quantity,
      0
    );

    return NextResponse.json({
      books: formattedBooks,
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
