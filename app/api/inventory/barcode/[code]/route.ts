//app/api/inventory/barcode/[code]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    // Buscar apenas na tabela InventoryBook
    const inventoryBook = await prisma.inventoryBook.findFirst({
      where: {
        OR: [{ barCode: params.code }, { codFle: params.code }],
      },
    });

    if (inventoryBook) {
      return NextResponse.json({
        ...inventoryBook,
        coverPrice: Number(inventoryBook.coverPrice),
        price: Number(inventoryBook.price),
      });
    }

    // Se não encontrar, retorna 404
    return NextResponse.json(
      { error: "Livro não encontrado no inventário" },
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
