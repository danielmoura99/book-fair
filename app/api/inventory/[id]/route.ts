// app/api/inventory/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH - Atualizar um livro específico
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { book } = await req.json();

    // Verificar se o livro existe
    const existingBook = await prisma.inventoryBook.findUnique({
      where: { id },
    });

    if (!existingBook) {
      return NextResponse.json(
        { error: "Livro não encontrado no inventário" },
        { status: 404 }
      );
    }

    // Atualizar o livro
    const updatedBook = await prisma.inventoryBook.update({
      where: { id },
      data: {
        codFle: book.codFle,
        barCode: book.barCode || null,
        location: book.location,
        quantity: Number(book.quantity),
        coverPrice: book.coverPrice,
        price: book.price,
        title: book.title,
        author: book.author,
        medium: book.medium,
        publisher: book.publisher,
        distributor: book.distributor,
        subject: book.subject,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Livro atualizado com sucesso",
      data: {
        ...updatedBook,
        coverPrice: Number(updatedBook.coverPrice),
        price: Number(updatedBook.price),
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar livro:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar livro";

    return NextResponse.json(
      { error: "Erro ao atualizar livro", message: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Excluir um livro específico
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verificar se o livro existe
    const existingBook = await prisma.inventoryBook.findUnique({
      where: { id },
    });

    if (!existingBook) {
      return NextResponse.json(
        { error: "Livro não encontrado no inventário" },
        { status: 404 }
      );
    }

    // Excluir o livro
    await prisma.inventoryBook.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Livro excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir livro:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao excluir livro";

    return NextResponse.json(
      { error: "Erro ao excluir livro", message: errorMessage },
      { status: 500 }
    );
  }
}
