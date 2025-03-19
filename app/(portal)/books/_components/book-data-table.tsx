//app/(portal)/books/_components/book-data-table.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditBookButton } from "./edit-book-button";
import { DeleteBookButton } from "./delete-book-button";
import { SerializedBook } from "@/types";
import { SearchBar } from "./search-bar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface BookDataTableProps {
  data: SerializedBook[];
}

export function BookDataTable({ data }: BookDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBooks = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return data;

    return data.filter(
      (book) =>
        book.title.toLowerCase().includes(search) ||
        book.codFle.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search) ||
        (book.barCode?.toLowerCase() || "").includes(search) ||
        book.publisher.toLowerCase().includes(search) ||
        book.subject.toLowerCase().includes(search)
    );
  }, [data, searchTerm]);

  return (
    <div className="space-y-4">
      <SearchBar value={searchTerm} onChange={setSearchTerm} />
      <div className="rounded-md border">
        <ScrollArea className="h-[700px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-black">
                  Código FLE
                </TableHead>
                <TableHead className="font-semibold text-black">
                  Cód. Barras
                </TableHead>
                <TableHead className="font-semibold text-black">
                  Local
                </TableHead>
                <TableHead className="font-semibold text-black">
                  Título
                </TableHead>
                <TableHead className="font-semibold text-black">
                  Autor
                </TableHead>
                <TableHead className="font-semibold text-black">
                  Médium
                </TableHead>
                <TableHead className="font-semibold text-black">
                  Editora
                </TableHead>
                <TableHead className="font-semibold text-black">
                  Distr.
                </TableHead>
                <TableHead className="font-semibold text-black">
                  Assunto
                </TableHead>
                <TableHead className="font-semibold text-black text-right">
                  Quant.
                </TableHead>
                <TableHead className="font-semibold text-black text-right">
                  Preço Feira
                </TableHead>
                <TableHead className="font-semibold text-black text-right">
                  Preço Capa
                </TableHead>
                <TableHead className="font-semibold text-black text-right">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>{book.codFle}</TableCell>
                  <TableCell>{book.barCode}</TableCell>
                  <TableCell>{book.location}</TableCell>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.medium}</TableCell>
                  <TableCell>{book.publisher}</TableCell>
                  <TableCell>{book.distributor}</TableCell>
                  <TableCell>{book.subject}</TableCell>
                  <TableCell className="text-right">{book.quantity}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(book.coverPrice))}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(book.price))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <EditBookButton book={book} />
                      <DeleteBookButton id={book.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
