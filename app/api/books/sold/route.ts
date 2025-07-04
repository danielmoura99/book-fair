//app/api/books/sold/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Buscar livros que foram vendidos (existem na tabela Transaction)

    const headers = new Headers();
    headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");
    headers.set("Surrogate-Control", "no-store");

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

    return new NextResponse(JSON.stringify(soldBooks), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Erro ao buscar livros vendidos:", error);

    const headers = new Headers();
    headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    return new NextResponse(
      JSON.stringify({ error: "Erro ao buscar livros vendidos" }),
      {
        status: 500,
        headers,
      }
    );
  }
}
