"use client";

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

interface BookDataTableProps {
  data: SerializedBook[];
}

export function BookDataTable({ data }: BookDataTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código FLE</TableHead>
              <TableHead>Código Barras</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Médium</TableHead>
              <TableHead>Editora</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Preço Capa</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((book) => (
              <TableRow key={book.id}>
                <TableCell>{book.codFle}</TableCell>
                <TableCell>{book.barCode}</TableCell>
                <TableCell>{book.location}</TableCell>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.medium}</TableCell>
                <TableCell>{book.publisher}</TableCell>
                <TableCell>{book.subject}</TableCell>
                <TableCell className="text-right">{book.quantity}</TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Number(book.coverPrice))}
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
      </div>
    </div>
  );
}
