import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    console.log("Body recebido:", body); // Debug para ver os dados recebidos

    // Preparar os dados para atualização, garantindo o formato correto
    const updateData = {
      codFle: body.codFle,
      barCode: body.barCode || null, // Garante que campo opcional seja null se não fornecido
      location: body.location,
      quantity: Number(body.quantity),
      coverPrice: new Prisma.Decimal(body.coverPrice.toString()), // Converte para Decimal
      title: body.title,
      author: body.author,
      medium: body.medium,
      publisher: body.publisher,
      subject: body.subject,
    };

    const book = await prisma.book.update({
      where: {
        id: params.id,
      },
      data: updateData,
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error("Erro detalhado:", error); // Log detalhado do erro
    return NextResponse.json(
      {
        error: "Erro ao atualizar livro",
        details: error instanceof Error ? error.message : "Unknown error",
      },
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
  } catch (error) {
    console.error("Erro ao excluir:", error);
    return NextResponse.json(
      { error: "Erro ao excluir livro" },
      { status: 500 }
    );
  }
}
