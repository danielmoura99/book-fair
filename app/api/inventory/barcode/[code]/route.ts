//app/api/inventory/barcode/[code]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    // Buscar primeiro na tabela Book
    const book = await prisma.book.findFirst({
      where: {
        barCode: params.code,
      },
    });

    if (book) {
      return NextResponse.json(book);
    }

    // Se não encontrar na tabela Book, buscar na tabela InventoryBook
    const inventoryBook = await prisma.inventoryBook.findFirst({
      where: {
        barCode: params.code,
      },
    });

    if (inventoryBook) {
      return NextResponse.json(inventoryBook);
    }

    // Se não encontrar em nenhuma das tabelas
    return NextResponse.json(
      { error: "Livro não encontrado" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Erro ao buscar livro por código de barras:", error);
    return NextResponse.json(
      { error: "Erro ao buscar livro" },
      { status: 500 }
    );
  }
}
