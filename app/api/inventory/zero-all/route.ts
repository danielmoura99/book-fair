//app/api/inventory/zero-all/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Atualizar todas as quantidades para zero
    const result = await prisma.inventoryBook.updateMany({
      data: {
        quantity: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} livros atualizados para quantidade zero.`,
    });
  } catch (error) {
    console.error("Erro ao zerar inventário:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";

    return NextResponse.json(
      { error: "Erro ao zerar inventário", message: errorMessage },
      { status: 500 }
    );
  }
}
