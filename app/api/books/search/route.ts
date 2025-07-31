import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { normalizeText } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "title";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    const skip = (page - 1) * limit;

    // Se há busca por texto, fazemos uma busca accent-insensitive
    if (search) {
      // Buscar todos os registros e aplicar filtro normalizado
      const allBooks = await prisma.book.findMany({
        orderBy: { [sortBy]: sortOrder },
      });

      // Normalizar o termo de busca
      const normalizedSearch = normalizeText(search);

      // Filtrar por texto normalizado
      const filteredBooks = allBooks.filter((book) => {
        return (
          normalizeText(book.title).includes(normalizedSearch) ||
          normalizeText(book.codFle).includes(normalizedSearch) ||
          normalizeText(book.author).includes(normalizedSearch) ||
          (book.barCode && normalizeText(book.barCode).includes(normalizedSearch)) ||
          normalizeText(book.publisher).includes(normalizedSearch) ||
          normalizeText(book.subject).includes(normalizedSearch) ||
          normalizeText(book.medium).includes(normalizedSearch)
        );
      });

      // Aplicar paginação manualmente
      const totalCount = filteredBooks.length;
      const books = filteredBooks.slice(skip, skip + limit);

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
    } else {
      // Busca normal sem filtro de texto
      const [books, totalCount] = await Promise.all([
        prisma.book.findMany({
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.book.count(),
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
    }
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    return NextResponse.json(
      { error: "Erro ao buscar livros" },
      { status: 500 }
    );
  }
}