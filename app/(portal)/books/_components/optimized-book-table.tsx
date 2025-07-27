"use client";

import { useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditBookButton } from "./edit-book-button";
import { DeleteBookButton } from "./delete-book-button";
import { useBooksSearch } from "@/app/hooks/use-books";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export function OptimizedBookTable() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // Debounce da busca para evitar requests excessivos
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, isLoading, error } = useBooksSearch({
    page,
    limit: 50,
    search: debouncedSearch,
    sortBy,
    sortOrder,
  });

  const handleSort = useCallback((column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1); // Reset para primeira página quando mudar ordenação
  }, [sortBy, sortOrder]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset para primeira página quando pesquisar
  }, []);

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Erro ao carregar livros. Tente novamente.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por título, código, autor..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Informações de paginação */}
      {data?.pagination && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Mostrando {((data.pagination.page - 1) * data.pagination.limit) + 1} até{" "}
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} de{" "}
            {data.pagination.total} livros
          </span>
          <span>
            Página {data.pagination.page} de {data.pagination.totalPages}
          </span>
        </div>
      )}

      {/* Tabela */}
      <div className="rounded-md border">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="font-semibold text-black cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("codFle")}
                >
                  Código FLE {sortBy === "codFle" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="font-semibold text-black">Cód. Barras</TableHead>
                <TableHead 
                  className="font-semibold text-black cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("location")}
                >
                  Local {sortBy === "location" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="font-semibold text-black cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("title")}
                >
                  Título {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="font-semibold text-black text-right cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("quantity")}
                >
                  Quant. {sortBy === "quantity" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="font-semibold text-black text-right cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("coverPrice")}
                >
                  Preço Feira {sortBy === "coverPrice" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="font-semibold text-black text-right cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("price")}
                >
                  Preço Capa {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="font-semibold text-black cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("author")}
                >
                  Autor {sortBy === "author" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="font-semibold text-black">Médium</TableHead>
                <TableHead 
                  className="font-semibold text-black cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("publisher")}
                >
                  Editora {sortBy === "publisher" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="font-semibold text-black">Distr.</TableHead>
                <TableHead 
                  className="font-semibold text-black cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("subject")}
                >
                  Assunto {sortBy === "subject" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="font-semibold text-black text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 13 }).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.books.length ? (
                data.books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>{book.codFle}</TableCell>
                    <TableCell>{book.barCode}</TableCell>
                    <TableCell>{book.location}</TableCell>
                    <TableCell>{book.title}</TableCell>
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
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.medium}</TableCell>
                    <TableCell>{book.publisher}</TableCell>
                    <TableCell>{book.distributor}</TableCell>
                    <TableCell>{book.subject}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <EditBookButton book={book} />
                        <DeleteBookButton id={book.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-8">
                    Nenhum livro encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Paginação */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={!data.pagination.hasPrev}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, data.pagination.totalPages) }).map((_, index) => {
              const pageNumber = Math.max(1, page - 2) + index;
              if (pageNumber <= data.pagination.totalPages) {
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={!data.pagination.hasNext}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}