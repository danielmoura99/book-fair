//app/api/inventory/batch/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Buscar lotes únicos no inventário
export async function GET() {
  try {
    // Buscar lotes únicos e contar quantos livros cada um tem
    const batches = await prisma.inventoryEntry.groupBy({
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
      entryCount: batch._count.id,
      totalQuantity: batch._sum.quantity || 0,
    }));

    // Para cada lote, vamos buscar a quantidade única de livros (codFle distintos)
    const batchesWithCounts = await Promise.all(
      formattedBatches.map(async (batch) => {
        const bookCount = await prisma.inventoryEntry.groupBy({
          by: ["inventoryBookId"],
          where: {
            batchName: batch.name,
          },
        });

        return {
          ...batch,
          bookCount: bookCount.length,
        };
      })
    );

    return NextResponse.json(batchesWithCounts);
  } catch (error) {
    console.error("Erro ao buscar lotes de inventário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar lotes de inventário" },
      { status: 500 }
    );
  }
}
