//app/api/books/barcode/[code]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const book = await prisma.book.findFirst({
      where: {
        barCode: params.code,
      },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Livro não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error("Erro ao buscar livro por código de barras:", error);
    return NextResponse.json(
      { error: "Erro ao buscar livro" },
      { status: 500 }
    );
  }
}
