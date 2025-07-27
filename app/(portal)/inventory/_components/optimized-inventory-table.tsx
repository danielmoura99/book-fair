/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Search,
  RefreshCw,
  PlusCircle,
  Trash,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInventorySearch } from "@/hooks/use-inventory";
import { useDebounce } from "@/hooks/use-debounce";
import type { InventoryBook } from "@/hooks/use-inventory";
import { formatPrice } from "@/lib/utils";
import { AddInventoryBookDialog } from "./add-inventory-book-dialog";
import { EditInventoryBookDialog } from "./edit-inventory-book-dialog";
import { DeleteInventoryBookDialog } from "./delete-inventory-book-dialog";
import { ExportInventoryButton } from "./export-inventory-button";
import { InventoryUploadForm } from "../upload/_components/inventory-upload-form";
import { ZeroInventoryButton } from "./zero-inventory-button";

export function OptimizedInventoryTable() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("quantity");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterZeroStock, setFilterZeroStock] = useState(false);
  const [selectedBook, setSelectedBook] = useState<InventoryBook | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { toast } = useToast();

  // Debounce da busca para evitar requests excessivos
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, isLoading, error, refetch } = useInventorySearch({
    page,
    limit: 50,
    search: debouncedSearch,
    sortBy,
    sortOrder,
    filterZeroStock,
  });

  const handleSort = useCallback(
    (column: string) => {
      if (sortBy === column) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortBy(column);
        setSortOrder("asc");
      }
      setPage(1);
    },
    [sortBy, sortOrder]
  );

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const handleEditBook = (book: InventoryBook) => {
    setSelectedBook(book);
    setShowEditDialog(true);
  };

  const handleDeleteBook = (book: InventoryBook) => {
    setSelectedBook(book);
    setShowDeleteDialog(true);
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Dados atualizados",
      description: "Inventário recarregado com sucesso",
    });
  };

  const handleZeroStock = () => {
    setFilterZeroStock(!filterZeroStock);
    setPage(1);
  };


  if (error) {
    return (
      <Card className="p-4">
        <div className="text-red-500 text-center p-4">
          Erro ao carregar inventário. Tente novamente.
          <Button onClick={handleRefresh} className="ml-2">
            Tentar novamente
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      {/* Cabeçalho com busca e ações */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Barra de busca */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar no inventário..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros */}
          <Button
            variant={filterZeroStock ? "default" : "outline"}
            size="sm"
            onClick={handleZeroStock}
          >
            <Filter className="h-4 w-4 mr-2" />
            {filterZeroStock ? "Com estoque" : "Todos"}
          </Button>
        </div>

        {/* Ações */}
        <div className="flex gap-2 flex-wrap">
          <Button variant="default" onClick={() => setShowAddDialog(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar
          </Button>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>

          <ExportInventoryButton />
          <InventoryUploadForm />
          <ZeroInventoryButton onSuccess={() => refetch()} />
        </div>
      </div>

      {/* Estatísticas */}
      {data?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 text-sm">
          <div className="bg-muted p-3 rounded">
            <div className="font-medium text-muted-foreground">
              Total de Livros
            </div>
            <div className="text-2xl font-bold">{data.stats.totalBooks}</div>
          </div>
          <div className="bg-muted p-3 rounded">
            <div className="font-medium text-muted-foreground">
              Quantidade Total
            </div>
            <div className="text-2xl font-bold">{data.stats.totalQuantity}</div>
          </div>
          <div className="bg-muted p-3 rounded">
            <div className="font-medium text-muted-foreground">Com Estoque</div>
            <div className="text-2xl font-bold">{data.stats.inStock}</div>
          </div>
          <div className="bg-muted p-3 rounded">
            <div className="font-medium text-muted-foreground">Editoras</div>
            <div className="text-2xl font-bold">{data.stats.publishers}</div>
          </div>
          <div className="bg-muted p-3 rounded">
            <div className="font-medium text-muted-foreground">
              Distribuidores
            </div>
            <div className="text-2xl font-bold">{data.stats.distributors}</div>
          </div>
        </div>
      )}

      {/* Informações de paginação */}
      {data?.pagination && (
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>
            Mostrando {(data.pagination.page - 1) * data.pagination.limit + 1}{" "}
            até{" "}
            {Math.min(
              data.pagination.page * data.pagination.limit,
              data.pagination.total
            )}{" "}
            de {data.pagination.total} livros
          </span>
          <span>
            Página {data.pagination.page} de {data.pagination.totalPages}
          </span>
        </div>
      )}

      {/* Tabela */}
      <ScrollArea className="h-[500px] w-full rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="font-semibold text-black cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort("codFle")}
              >
                Código FLE{" "}
                {sortBy === "codFle" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="font-semibold text-black cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort("title")}
              >
                Título {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="font-semibold text-black cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort("publisher")}
              >
                Editora{" "}
                {sortBy === "publisher" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="font-semibold text-black cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort("distributor")}
              >
                Distribuidor{" "}
                {sortBy === "distributor" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="font-semibold text-black text-right cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort("quantity")}
              >
                Quantidade{" "}
                {sortBy === "quantity" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="font-semibold text-black text-right cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort("coverPrice")}
              >
                Preço Feira{" "}
                {sortBy === "coverPrice" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="font-semibold text-black text-right">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 7 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.books.length ? (
              data.books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">
                    {book.codFle}
                    {book.barCode && (
                      <div className="text-xs text-muted-foreground">
                        {book.barCode}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{book.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {book.author}
                    </div>
                  </TableCell>
                  <TableCell>{book.publisher}</TableCell>
                  <TableCell>{book.distributor}</TableCell>
                  <TableCell className="text-right font-medium">
                    <span
                      className={
                        book.quantity === 0 ? "text-red-500" : "text-green-600"
                      }
                    >
                      {book.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(book.coverPrice)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditBook(book)}
                        title="Editar livro"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBook(book)}
                        title="Excluir livro"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {searchTerm
                    ? "Nenhum livro encontrado para esta busca"
                    : "Nenhum livro no inventário"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Paginação */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-4">
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
            {Array.from({
              length: Math.min(5, data.pagination.totalPages),
            }).map((_, index) => {
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

      {/* Diálogos */}
      <AddInventoryBookDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => refetch()}
      />

      {selectedBook && (
        <EditInventoryBookDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          book={selectedBook as any}
          onSuccess={() => refetch()}
        />
      )}

      {selectedBook && (
        <DeleteInventoryBookDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          book={selectedBook as any}
          onSuccess={() => refetch()}
        />
      )}

    </Card>
  );
}
