// app/api/inventory/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logInventoryActivity } from "@/lib/inventory-Logger";

// PATCH - Atualizar um livro específico
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { book, operatorName } = await req.json();

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

    // Dados anteriores para log
    const previousData = {
      codFle: existingBook.codFle,
      barCode: existingBook.barCode,
      location: existingBook.location,
      quantity: existingBook.quantity,
      coverPrice: Number(existingBook.coverPrice),
      price: Number(existingBook.price),
      title: existingBook.title,
      author: existingBook.author,
      medium: existingBook.medium,
      publisher: existingBook.publisher,
      distributor: existingBook.distributor,
      subject: existingBook.subject,
    };

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

    // Registrar log de atualização
    await logInventoryActivity({
      type: "UPDATE",
      bookId: updatedBook.id,
      bookCodFle: updatedBook.codFle,
      bookTitle: updatedBook.title,
      operatorName: operatorName || "Sistema",
      previousData,
      newData: {
        codFle: updatedBook.codFle,
        barCode: updatedBook.barCode,
        location: updatedBook.location,
        quantity: updatedBook.quantity,
        coverPrice: Number(updatedBook.coverPrice),
        price: Number(updatedBook.price),
        title: updatedBook.title,
        author: updatedBook.author,
        medium: updatedBook.medium,
        publisher: updatedBook.publisher,
        distributor: updatedBook.distributor,
        subject: updatedBook.subject,
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
    const url = new URL(req.url);
    const operatorName = url.searchParams.get("operatorName") || "Sistema";

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

    // Dados para log
    const bookData = {
      codFle: existingBook.codFle,
      barCode: existingBook.barCode,
      location: existingBook.location,
      quantity: existingBook.quantity,
      coverPrice: Number(existingBook.coverPrice),
      price: Number(existingBook.price),
      title: existingBook.title,
      author: existingBook.author,
      medium: existingBook.medium,
      publisher: existingBook.publisher,
      distributor: existingBook.distributor,
      subject: existingBook.subject,
    };

    // Excluir o livro
    await prisma.inventoryBook.delete({
      where: { id },
    });

    // Registrar log de exclusão
    await logInventoryActivity({
      type: "DELETE",
      bookId: id,
      bookCodFle: existingBook.codFle,
      bookTitle: existingBook.title,
      operatorName,
      newData: bookData,
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
