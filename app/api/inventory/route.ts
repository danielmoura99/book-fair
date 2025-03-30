//app/api/inventory/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
//import { Prisma } from "@prisma/client";

// GET - Buscar todos os livros no inventário
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const batchName = searchParams.get("batchName");

    // Se um lote específico for solicitado
    if (batchName) {
      const books = await prisma.inventoryBook.findMany({
        where: {
          batchName: batchName,
        },
        orderBy: {
          title: "asc",
        },
      });
      return NextResponse.json(books);
    }

    // Caso contrário, retornar todos os livros de inventário
    const books = await prisma.inventoryBook.findMany({
      orderBy: {
        title: "asc",
      },
    });
    return NextResponse.json(books);
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

        // Buscar o livro da base de dados Book
        const book = await tx.book.findUnique({
          where: { id: bookId },
        });

        if (!book) {
          continue; // Pular se o livro não for encontrado
        }

        // Verificar se já existe este livro no inventário
        let inventoryBook = await tx.inventoryBook.findUnique({
          where: { codFle: book.codFle },
        });

        // Se não existir, criar novo registro no inventário
        if (!inventoryBook) {
          inventoryBook = await tx.inventoryBook.create({
            data: {
              codFle: book.codFle,
              barCode: book.barCode,
              location: book.location,
              quantity: quantity, // Quantidade inicial do lote
              coverPrice: book.coverPrice,
              price: book.price,
              title: book.title,
              author: book.author,
              medium: book.medium,
              publisher: book.publisher,
              distributor: book.distributor || "",
              subject: book.subject,
              batchName, // O lote ao qual este livro pertence
            },
          });
        } else {
          // Se já existir, atualizar a quantidade
          inventoryBook = await tx.inventoryBook.update({
            where: { id: inventoryBook.id },
            data: {
              quantity: {
                increment: quantity, // Incrementar a quantidade existente
              },
            },
          });
        }

        // Registrar entrada no histórico de inventário
        const entry = await tx.inventoryEntry.create({
          data: {
            inventoryBookId: inventoryBook.id,
            barcodeUsed,
            quantity,
            batchName,
            createdBy: operatorName || "Sistema",
          },
        });

        processedItems.push({
          book: inventoryBook,
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
