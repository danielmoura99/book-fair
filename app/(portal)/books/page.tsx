export const dynamic = "force-dynamic";
export const revalidate = 0;

import Navbar from "@/components/sidebar";
import { BookDataTable } from "./_components/book-data-table";
import { prisma } from "@/lib/prisma";
import { AddBookButton } from "./_components/add-book-button";
import { UploadBooks } from "./_components/upload-books";

async function getBooks() {
  const books = await prisma.book.findMany({
    orderBy: {
      title: "asc",
    },
  });
  // Serializa os dados antes de passar para o cliente
  return books.map((book) => ({
    ...book,
    coverPrice: Number(book.coverPrice),
    price: Number(book.price),
  }));
}

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <>
      <Navbar />
      {/* Aumentando o espaço disponível para a tabela removendo padding lateral e maximizando largura */}
      <div className="flex h-full flex-col space-y-6 overflow-hidden px-2 py-6 max-w-full">
        <div className="flex w-full items-center justify-between px-4">
          <h2 className="text-2xl font-bold">Livros</h2>
          <div className="flex items-center gap-4">
            <UploadBooks />
            <AddBookButton />
          </div>
        </div>
        <div className="px-1">
          {" "}
          {/* Reduzido padding horizontal */}
          <BookDataTable data={books} />
        </div>
      </div>
    </>
  );
}
