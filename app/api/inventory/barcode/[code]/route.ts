//app/api/inventory/barcode/[code]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    // Buscar na tabela InventoryBook pelo código de barras ou código FLE
    const inventoryBook = await prisma.inventoryBook.findFirst({
      where: {
        OR: [{ barCode: params.code }, { codFle: params.code }],
      },
    });

    if (!inventoryBook) {
      return NextResponse.json(
        { error: "Livro não encontrado no inventário" },
        { status: 404 }
      );
    }

    // Serializar valores decimais
    return NextResponse.json({
      ...inventoryBook,
      coverPrice: Number(inventoryBook.coverPrice),
      price: Number(inventoryBook.price),
    });
  } catch (error) {
    console.error("Erro ao buscar livro por código:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao buscar livro";

    return NextResponse.json(
      { error: "Erro ao buscar livro", message: errorMessage },
      { status: 500 }
    );
  }
}
