/* eslint-disable @typescript-eslint/no-explicit-any */
//app/api/inventory/books/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Buscar livros por filtros específicos
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get("term") || "";
    const publisher = searchParams.get("publisher");
    const distributor = searchParams.get("distributor");
    const inStockOnly = searchParams.get("inStock") === "true";
    const limit = Number(searchParams.get("limit") || "100");

    // Construir o filtro com base nos parâmetros
    const where: any = {};

    // Filtro por termo de busca em vários campos
    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { author: { contains: searchTerm, mode: "insensitive" } },
        { codFle: { contains: searchTerm, mode: "insensitive" } },
        { barCode: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    // Filtros adicionais
    if (publisher) {
      where.publisher = { contains: publisher, mode: "insensitive" };
    }

    if (distributor) {
      where.distributor = { contains: distributor, mode: "insensitive" };
    }

    if (inStockOnly) {
      where.quantity = { gt: 0 };
    }

    // Buscar livros com os filtros aplicados
    const books = await prisma.inventoryBook.findMany({
      where,
      orderBy: {
        title: "asc",
      },
      take: limit,
    });

    // Serializar valores decimais
    const serializedBooks = books.map((book) => ({
      ...book,
      coverPrice: Number(book.coverPrice),
      price: Number(book.price),
    }));

    // Calcular algumas estatísticas básicas
    const stats = {
      totalResults: books.length,
      totalQuantity: books.reduce((sum, book) => sum + book.quantity, 0),
      limit,
    };

    return NextResponse.json({
      books: serializedBooks,
      stats,
    });
  } catch (error) {
    console.error("Erro ao buscar livros:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao buscar livros";

    return NextResponse.json(
      { error: "Erro ao buscar livros", message: errorMessage },
      { status: 500 }
    );
  }
}
