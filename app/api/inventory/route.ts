/* eslint-disable @typescript-eslint/no-explicit-any */
//app/api/inventory/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { InventoryBook, InventoryEntry } from "@prisma/client";

// Interfaces para tipagem
interface InventoryBookWithEntries extends InventoryBook {
  entries: InventoryEntry[];
}

interface EntryWithBook extends InventoryEntry {
  inventoryBook: InventoryBook;
}

// GET - Buscar todos os livros no inventário
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const batchName = searchParams.get("batchName");

    // Se um lote específico for solicitado
    if (batchName) {
      const entries: any[] = await prisma.inventoryEntry.findMany({
        where: {
          batchName: batchName,
        },
        include: {
          inventoryBook: true,
        },
      });

      // Agrupar entradas por inventoryBook
      const booksMap: Record<
        string,
        {
          book: any;
          quantity: number;
          entries: InventoryEntry[];
        }
      > = {};

      entries.forEach((entry: EntryWithBook) => {
        const bookId = entry.inventoryBookId;

        if (!booksMap[bookId]) {
          booksMap[bookId] = {
            book: {
              ...entry.inventoryBook,
              coverPrice: Number(entry.inventoryBook.coverPrice),
              price: Number(entry.inventoryBook.price),
            },
            quantity: 0,
            entries: [],
          };
        }

        booksMap[bookId].quantity += entry.quantity;
        booksMap[bookId].entries.push(entry);
      });

      const books = Object.values(booksMap);
      return NextResponse.json(books);
    }

    // Caso contrário, retornar todos os livros de inventário
    const books = await prisma.inventoryBook.findMany({
      orderBy: {
        title: "asc",
      },
      include: {
        entries: true,
      },
    });

    // Serializar os dados antes de retornar
    const serializedBooks = books.map((book: InventoryBookWithEntries) => ({
      ...book,
      coverPrice: Number(book.coverPrice),
      price: Number(book.price),
    }));

    return NextResponse.json(serializedBooks);
  } catch (error) {
    console.error("Erro ao buscar livros do inventário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar livros do inventário" },
      { status: 500 }
    );
  }
}

// POST - Registrar lote de inventário
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { batchName, items, operatorName } = body;

    if (!batchName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Dados de inventário inválidos" },
        { status: 400 }
      );
    }

    // Processar cada item do inventário em uma transação
    const results = await prisma.$transaction(async (tx) => {
      const processedItems = [];

      for (const item of items) {
        const { bookId, quantity, barcodeUsed } = item;

        // Verificar se o livro existe no inventário
        const inventoryBook = await tx.inventoryBook.findUnique({
          where: { id: bookId },
        });

        if (!inventoryBook) {
          console.warn(`Livro com ID ${bookId} não encontrado no inventário`);
          continue; // Pular se o livro não for encontrado
        }

        // Atualizar a quantidade
        const updatedBook = await tx.inventoryBook.update({
          where: { id: inventoryBook.id },
          data: {
            quantity: {
              increment: quantity,
            },
          },
        });

        // Registrar entrada no histórico de inventário
        const entry = await tx.inventoryEntry.create({
          data: {
            inventoryBookId: inventoryBook.id,
            barcodeUsed: barcodeUsed,
            quantity: quantity,
            batchName: batchName,
            createdBy: operatorName || "Sistema",
          },
        });

        processedItems.push({
          book: {
            ...updatedBook,
            coverPrice: Number(updatedBook.coverPrice),
            price: Number(updatedBook.price),
          },
          entry,
        });
      }

      return processedItems;
    });

    return NextResponse.json({
      success: true,
      message: `${results.length} itens processados com sucesso.`,
      data: results,
    });
  } catch (error) {
    console.error("Erro ao registrar inventário:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao registrar inventário";

    return NextResponse.json(
      { error: "Erro ao registrar inventário", message: errorMessage },
      { status: 500 }
    );
  }
}
