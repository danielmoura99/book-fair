//app/api/inventory/export/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST - Exportar livros do inventário para a tabela Book
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { batchName, bookIds } = body;

    if (!batchName) {
      return NextResponse.json(
        { error: "Nome do lote é obrigatório" },
        { status: 400 }
      );
    }

    // Preparar a query para buscar os livros
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereCondition: any = { batchName };

    // Se bookIds for fornecido, filtrar apenas esses livros
    if (bookIds && Array.isArray(bookIds) && bookIds.length > 0) {
      whereCondition.id = { in: bookIds };
    }

    // Buscar livros do inventário que serão exportados
    const inventoryBooks = await prisma.inventoryBook.findMany({
      where: whereCondition,
      orderBy: { title: "asc" },
    });

    if (inventoryBooks.length === 0) {
      return NextResponse.json(
        { error: "Nenhum livro encontrado para exportação" },
        { status: 404 }
      );
    }

    // Exportar livros para a tabela Book em uma transação
    const results = await prisma.$transaction(async (tx) => {
      const exportedBooks = [];

      for (const inventoryBook of inventoryBooks) {
        // Verificar se o livro já existe na tabela Book pelo codFle
        const existingBook = await tx.book.findUnique({
          where: { codFle: inventoryBook.codFle },
        });

        if (existingBook) {
          // Atualizar o livro existente
          const updatedBook = await tx.book.update({
            where: { id: existingBook.id },
            data: {
              quantity: {
                increment: inventoryBook.quantity, // Incrementar a quantidade
              },
              // Opcionalmente atualizar outros campos se necessário
              coverPrice: inventoryBook.coverPrice,
              price: inventoryBook.price,
              title: inventoryBook.title,
              author: inventoryBook.author,
              medium: inventoryBook.medium,
              publisher: inventoryBook.publisher,
              distributor: inventoryBook.distributor,
              subject: inventoryBook.subject,
              barCode: inventoryBook.barCode,
              location: inventoryBook.location,
            },
          });

          exportedBooks.push({
            id: updatedBook.id,
            title: updatedBook.title,
            quantity: updatedBook.quantity,
            action: "updated",
          });
        } else {
          // Criar um novo livro na tabela Book
          const newBook = await tx.book.create({
            data: {
              codFle: inventoryBook.codFle,
              barCode: inventoryBook.barCode,
              location: inventoryBook.location,
              quantity: inventoryBook.quantity,
              coverPrice: inventoryBook.coverPrice,
              price: inventoryBook.price,
              title: inventoryBook.title,
              author: inventoryBook.author,
              medium: inventoryBook.medium,
              publisher: inventoryBook.publisher,
              distributor: inventoryBook.distributor,
              subject: inventoryBook.subject,
            },
          });

          exportedBooks.push({
            id: newBook.id,
            title: newBook.title,
            quantity: newBook.quantity,
            action: "created",
          });
        }
      }

      return exportedBooks;
    });

    return NextResponse.json({
      success: true,
      message: `${results.length} livros exportados com sucesso.`,
      data: {
        created: results.filter((r) => r.action === "created").length,
        updated: results.filter((r) => r.action === "updated").length,
        books: results,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar inventário:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao exportar inventário";

    return NextResponse.json(
      { error: "Erro ao exportar inventário", message: errorMessage },
      { status: 500 }
    );
  }
}
