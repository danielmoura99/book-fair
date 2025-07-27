import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "title";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    const skip = (page - 1) * limit;

    // Construir filtros de busca
    const searchFilter = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { codFle: { contains: search, mode: "insensitive" as const } },
            { author: { contains: search, mode: "insensitive" as const } },
            { barCode: { contains: search, mode: "insensitive" as const } },
            { publisher: { contains: search, mode: "insensitive" as const } },
            { subject: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Buscar com paginação
    const [books, totalCount] = await Promise.all([
      prisma.book.findMany({
        where: searchFilter,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.book.count({
        where: searchFilter,
      }),
    ]);

    // Serializar dados
    const serializedBooks = books.map((book) => ({
      ...book,
      coverPrice: Number(book.coverPrice),
      price: Number(book.price),
    }));

    return NextResponse.json({
      books: serializedBooks,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    return NextResponse.json(
      { error: "Erro ao buscar livros" },
      { status: 500 }
    );
  }
}