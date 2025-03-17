//book-fair/app/api/books/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    // Preparando os dados para atualização, garantindo o formato correto
    const updateData = {
      codFle: body.codFle,
      barCode: body.barCode,
      location: body.location,
      quantity: Number(body.quantity),
      coverPrice: body.coverPrice.toString(), // Convertendo para string para o Decimal
      price: body.Price.toString(),
      title: body.title,
      author: body.author,
      medium: body.medium,
      publisher: body.publisher,
      distributor: body.distributor,
      subject: body.subject,
    };

    const book = await prisma.book.update({
      where: {
        id: params.id,
      },
      data: updateData,
    });

    return NextResponse.json(book);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar livro" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.book.delete({
      where: {
        id: params.id,
      },
    });
    return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao excluir livro" },
      { status: 500 }
    );
  }
}
