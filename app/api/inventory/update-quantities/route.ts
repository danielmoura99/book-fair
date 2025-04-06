//app/api/inventory/update-quantities/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST - Atualizar quantidades dos livros no inventário
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Dados de atualização inválidos" },
        { status: 400 }
      );
    }

    // Processar cada atualização em uma transação
    const results = await prisma.$transaction(async (tx) => {
      const processedUpdates = [];

      for (const update of updates) {
        const { bookId, quantity } = update;

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
          where: { id: bookId },
          data: {
            quantity: quantity,
            updatedAt: new Date(),
          },
        });

        processedUpdates.push({
          id: updatedBook.id,
          title: updatedBook.title,
          codFle: updatedBook.codFle,
          previousQuantity: inventoryBook.quantity,
          newQuantity: updatedBook.quantity,
        });
      }

      return processedUpdates;
    });

    return NextResponse.json({
      success: true,
      message: `${results.length} atualizações de quantidade processadas com sucesso.`,
      data: results,
    });
  } catch (error) {
    console.error("Erro ao atualizar quantidades:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar quantidades";

    return NextResponse.json(
      { error: "Erro ao atualizar quantidades", message: errorMessage },
      { status: 500 }
    );
  }
}
