//app/api/inventory/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Buscar todos os livros no inventário
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const publisher = searchParams.get("publisher");
    const distributor = searchParams.get("distributor");
    const filterZeroStock = searchParams.get("filterZeroStock") === "true";

    // Construir o filtro base
    let where = {};

    if (publisher) {
      where = {
        ...where,
        publisher: {
          contains: publisher,
          mode: "insensitive",
        },
      };
    }

    if (distributor) {
      where = {
        ...where,
        distributor: {
          contains: distributor,
          mode: "insensitive",
        },
      };
    }

    if (filterZeroStock) {
      where = {
        ...where,
        quantity: {
          gt: 0,
        },
      };
    }

    // Buscar livros no inventário
    const books = await prisma.inventoryBook.findMany({
      where,
      orderBy: {
        title: "asc",
      },
      take: 1000, // Limitar resultados para melhor performance
    });

    // Calcular estatísticas sobre o inventário
    const stats = {
      totalBooks: books.length,
      totalQuantity: books.reduce((sum, book) => sum + book.quantity, 0),
      publishers: books.filter(
        (book, index, self) =>
          self.findIndex((b) => b.publisher === book.publisher) === index
      ).length,
      distributors: books.filter(
        (book, index, self) =>
          self.findIndex((b) => b.distributor === book.distributor) === index
      ).length,
      inStock: books.filter((book) => book.quantity > 0).length,
    };

    // Serializar os dados decimais antes de retornar
    const serializedBooks = books.map((book) => ({
      ...book,
      coverPrice: Number(book.coverPrice),
      price: Number(book.price),
    }));

    return NextResponse.json({
      books: serializedBooks,
      stats,
    });
  } catch (error) {
    console.error("Erro ao buscar livros do inventário:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao buscar livros";

    return NextResponse.json(
      { error: "Erro ao buscar livros do inventário", message: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Este método não é mais necessário para registrar lotes
// Podemos adaptar para inserir um único livro no inventário, se necessário
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { book } = body;

    if (!book || !book.codFle || !book.title) {
      return NextResponse.json(
        { error: "Dados do livro incompletos" },
        { status: 400 }
      );
    }

    // Verificar se o livro já existe
    const existingBook = await prisma.inventoryBook.findUnique({
      where: {
        codFle: book.codFle,
      },
    });

    let result;

    if (existingBook) {
      // Atualizar livro existente
      result = await prisma.inventoryBook.update({
        where: {
          id: existingBook.id,
        },
        data: {
          barCode: book.barCode || existingBook.barCode,
          location: book.location || existingBook.location,
          quantity: book.quantity ?? existingBook.quantity,
          coverPrice: book.coverPrice
            ? book.coverPrice.toString()
            : existingBook.coverPrice,
          price: book.price ? book.price.toString() : existingBook.price,
          title: book.title || existingBook.title,
          author: book.author || existingBook.author,
          medium: book.medium || existingBook.medium,
          publisher: book.publisher || existingBook.publisher,
          distributor: book.distributor || existingBook.distributor,
          subject: book.subject || existingBook.subject,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Livro atualizado com sucesso",
        data: {
          ...result,
          coverPrice: Number(result.coverPrice),
          price: Number(result.price),
        },
      });
    } else {
      // Criar novo livro
      result = await prisma.inventoryBook.create({
        data: {
          codFle: book.codFle,
          barCode: book.barCode,
          location: book.location || "ESTOQUE",
          quantity: book.quantity || 0,
          coverPrice: book.coverPrice ? book.coverPrice.toString() : "0",
          price: book.price ? book.price.toString() : "0",
          title: book.title,
          author: book.author || "Não informado",
          medium: book.medium || "Não informado",
          publisher: book.publisher || "Não informado",
          distributor: book.distributor || "Não informado",
          subject: book.subject || "Não informado",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Livro criado com sucesso",
        data: {
          ...result,
          coverPrice: Number(result.coverPrice),
          price: Number(result.price),
        },
      });
    }
  } catch (error) {
    console.error("Erro ao processar livro:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao processar livro";

    return NextResponse.json(
      { error: "Erro ao processar livro", message: errorMessage },
      { status: 500 }
    );
  }
}
