//app/api/books/sold/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Buscar livros que foram vendidos (existem na tabela Transaction)
    const soldBooks = await prisma.book.findMany({
      where: {
        transactions: {
          some: {
            type: "SALE", // Apenas vendas, não trocas
          },
        },
      },
      orderBy: {
        title: "asc",
      },
    });

    return NextResponse.json(soldBooks);
  } catch (error) {
    console.error("Erro ao buscar livros vendidos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar livros vendidos" },
      { status: 500 }
    );
  }
}
