//book-fair/app/api/books/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      orderBy: {
        title: "asc",
      },
    });
    return NextResponse.json(books);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar livros" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const book = await prisma.book.create({
      data: {
        codFle: body.codFle,
        barCode: body.barCode,
        location: body.location,
        quantity: Number(body.quantity),
        coverPrice: body.coverPrice.toString(),
        title: body.title,
        author: body.author,
        medium: body.medium,
        publisher: body.publisher,
        distributor: body.distributor,
        subject: body.subject,
      },
    });
    return NextResponse.json(book);
  } catch (error) {
    console.error("Erro ao criar o Livro:", error);
    return NextResponse.json(
      { error: "Erro ao criar o Livro" },
      { status: 500 }
    );
  }
}
