import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "quantity";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const filterZeroStock = searchParams.get("filterZeroStock") === "true";
    const publisher = searchParams.get("publisher");
    const distributor = searchParams.get("distributor");

    const skip = (page - 1) * limit;

    // Construir filtros de busca
    const searchFilter = [];

    // Filtro de texto
    if (search) {
      searchFilter.push({
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { codFle: { contains: search, mode: "insensitive" as const } },
          { author: { contains: search, mode: "insensitive" as const } },
          { barCode: { contains: search, mode: "insensitive" as const } },
          { publisher: { contains: search, mode: "insensitive" as const } },
          { distributor: { contains: search, mode: "insensitive" as const } },
        ],
      });
    }

    // Filtro por editora
    if (publisher) {
      searchFilter.push({
        publisher: {
          contains: publisher,
          mode: "insensitive" as const,
        },
      });
    }

    // Filtro por distribuidor
    if (distributor) {
      searchFilter.push({
        distributor: {
          contains: distributor,
          mode: "insensitive" as const,
        },
      });
    }

    // Filtro de estoque zero
    if (filterZeroStock) {
      searchFilter.push({
        quantity: {
          gt: 0,
        },
      });
    }

    const whereFilter = searchFilter.length > 0 ? { AND: searchFilter } : {};

    // Buscar com paginação
    const [books, totalCount] = await Promise.all([
      prisma.inventoryBook.findMany({
        where: whereFilter,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.inventoryBook.count({
        where: whereFilter,
      }),
    ]);

    // Buscar estatísticas apenas se for a primeira página
    let stats = null;
    if (page === 1) {
      const [
        totalBooksCount,
        totalQuantitySum,
        booksInStockCount,
        publishersCount,
        distributorsCount,
      ] = await Promise.all([
        prisma.inventoryBook.count(),
        prisma.inventoryBook.aggregate({
          _sum: { quantity: true },
        }),
        prisma.inventoryBook.count({
          where: { quantity: { gt: 0 } },
        }),
        prisma.inventoryBook
          .groupBy({
            by: ["publisher"],
          })
          .then((result) => result.length),
        prisma.inventoryBook
          .groupBy({
            by: ["distributor"],
          })
          .then((result) => result.length),
      ]);

      stats = {
        totalBooks: totalBooksCount,
        totalQuantity: totalQuantitySum._sum.quantity || 0,
        inStock: booksInStockCount,
        publishers: publishersCount,
        distributors: distributorsCount,
      };
    }

    // Serializar dados
    const serializedBooks = books.map((book) => ({
      ...book,
      coverPrice: Number(book.coverPrice),
      price: Number(book.price),
    }));

    return NextResponse.json({
      books: serializedBooks,
      stats,
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
    console.error("Erro ao buscar inventário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar inventário" },
      { status: 500 }
    );
  }
}
