//app/api/inventory/search/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term");

    if (!term) {
      return NextResponse.json(
        { error: "Termo de pesquisa é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar livros que correspondem ao termo de pesquisa
    const books = await prisma.inventoryBook.findMany({
      where: {
        OR: [
          { title: { contains: term, mode: "insensitive" } },
          { author: { contains: term, mode: "insensitive" } },
          { codFle: { contains: term, mode: "insensitive" } },
          { barCode: { contains: term, mode: "insensitive" } },
          { publisher: { contains: term, mode: "insensitive" } },
          { subject: { contains: term, mode: "insensitive" } },
        ],
      },
      orderBy: {
        title: "asc",
      },
      take: 20, // Limitar resultados para melhor performance
    });

    // Serializar dados decimais
    const serializedBooks = books.map((book) => ({
      ...book,
      coverPrice: Number(book.coverPrice),
      price: Number(book.price),
    }));

    return NextResponse.json(serializedBooks);
  } catch (error) {
    console.error("Erro na pesquisa de inventário:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido na pesquisa de inventário";

    return NextResponse.json(
      { error: "Erro na pesquisa", message: errorMessage },
      { status: 500 }
    );
  }
}
