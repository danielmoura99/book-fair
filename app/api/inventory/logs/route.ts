/* eslint-disable prefer-const */
// app/api/inventory/logs/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const bookId = searchParams.get("bookId");
    const operatorName = searchParams.get("operatorName");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = Number(searchParams.get("limit") || "100");
    const offset = Number(searchParams.get("offset") || "0");

    // Construir filtro
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let where: any = {};

    if (type) {
      where.type = type;
    }

    if (bookId) {
      where.bookId = bookId;
    }

    if (operatorName) {
      where.operatorName = {
        contains: operatorName,
        mode: "insensitive",
      };
    }

    // Filtro de data
    if (startDate || endDate) {
      where.timestamp = {};

      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }

      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    // Buscar logs
    const logs = await prisma.inventoryLog.findMany({
      where,
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
      skip: offset,
    });

    // Contar total para paginação
    const total = await prisma.inventoryLog.count({ where });

    return NextResponse.json({
      data: logs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + logs.length < total,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar logs de inventário:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao buscar logs";

    return NextResponse.json(
      { error: "Erro ao buscar logs", message: errorMessage },
      { status: 500 }
    );
  }
}
