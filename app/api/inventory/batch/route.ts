//app/api/inventory/batches/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Buscar lotes únicos no inventário
export async function GET() {
  try {
    // Buscar lotes únicos e contar quantos livros cada um tem
    const batches = await prisma.inventoryBook.groupBy({
      by: ["batchName"],
      _count: {
        id: true,
      },
      _sum: {
        quantity: true,
      },
    });

    // Formatar resultados
    const formattedBatches = batches.map((batch) => ({
      name: batch.batchName,
      bookCount: batch._count.id,
      totalQuantity: batch._sum.quantity || 0,
    }));

    return NextResponse.json(formattedBatches);
  } catch (error) {
    console.error("Erro ao buscar lotes de inventário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar lotes de inventário" },
      { status: 500 }
    );
  }
}
