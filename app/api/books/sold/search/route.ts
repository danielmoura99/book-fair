//app/api/books/sold/search/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { TransactionType } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    const searchFilters = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { author: { contains: search, mode: "insensitive" as const } },
            { codFle: { contains: search, mode: "insensitive" as const } },
            { publisher: { contains: search, mode: "insensitive" as const } },
            { subject: { contains: search, mode: "insensitive" as const } },
            { medium: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Filtro principal: livros que foram vendidos
    const whereClause = {
      transactions: {
        some: {
          type: TransactionType.SALE, // Apenas vendas, não trocas
        },
      },
      ...searchFilters,
    };

    // Buscar livros com paginação
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder as "asc" | "desc" },
        skip,
        take: limit,
      }),
      prisma.book.count({
        where: whereClause,
      }),
    ]);

    // Serializar campos decimais
    const serializedBooks = books.map((book) => ({
      ...book,
      coverPrice: Number(book.coverPrice),
      price: Number(book.price),
    }));

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const headers = new Headers();
    headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");

    const response = {
      books: serializedBooks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };

    return new NextResponse(JSON.stringify(response), {
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