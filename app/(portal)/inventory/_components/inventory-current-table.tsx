//app/(portal)/inventory/_components/inventory-current-table.tsx
"use client";

import { useState, useEffect } from "react";
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
import {
  Search,
  RefreshCw,
  PlusCircle,
  FileDown,
  Trash,
  Pencil,
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { formatPrice } from "@/lib/utils";
import { AddInventoryBookDialog } from "./add-inventory-book-dialog";
import { EditInventoryBookDialog } from "./edit-inventory-book-dialog";
import { DeleteInventoryBookDialog } from "./delete-inventory-book-dialog";

interface InventoryBook {
  id: string;
  codFle: string;
  barCode?: string;
  location: string;
  quantity: number;
  coverPrice: number;
  price: number;
  title: string;
  author: string;
  medium: string;
  publisher: string;
  distributor: string;
  subject: string;
}

export function InventoryCurrentTable() {
  const [books, setBooks] = useState<InventoryBook[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<InventoryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState<InventoryBook | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Função para buscar dados do inventário
  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/inventory");

      // Ordenar os livros por quantidade (do maior para o menor)
      const sortedBooks = [...response.data.books].sort(
        (a, b) => b.quantity - a.quantity
      );

      setBooks(sortedBooks);
      setFilteredBooks(sortedBooks);
    } catch (error) {
      console.error("Erro ao buscar dados do inventário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do inventário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Filtrar livros quando o termo de busca mudar
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBooks(books);
      return;
    }

    const lowercaseSearch = searchTerm.toLowerCase();
    const filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(lowercaseSearch) ||
        book.codFle.toLowerCase().includes(lowercaseSearch) ||
        book.author.toLowerCase().includes(lowercaseSearch) ||
        (book.barCode?.toLowerCase() || "").includes(lowercaseSearch) ||
        book.publisher.toLowerCase().includes(lowercaseSearch) ||
        book.distributor.toLowerCase().includes(lowercaseSearch)
    );
    setFilteredBooks(filtered);
  }, [searchTerm, books]);

  const handleExport = () => {
    // Lógica para exportar (manter a que já existia)
    toast({
      title: "Exportando inventário",
      description: "Funcionalidade de exportação em desenvolvimento",
    });
  };

  const handleResetDatabase = () => {
    // Lógica para zerar base (manter a que já existia)
    toast({
      title: "Atenção",
      description: "Função de zerar base em desenvolvimento",
      variant: "destructive",
    });
  };

  const handleEditBook = (book: InventoryBook) => {
    setSelectedBook(book);
    setShowEditDialog(true);
  };

  const handleDeleteBook = (book: InventoryBook) => {
    setSelectedBook(book);
    setShowDeleteDialog(true);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar no inventário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Botão de Adicionar Livro */}
          <Button variant="default" onClick={() => setShowAddDialog(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Livro
          </Button>

          {/* Botão de Atualizar (original) */}
          <Button
            variant="outline"
            onClick={fetchInventoryData}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Atualizar</span>
          </Button>

          {/* Botão de Exportar (original) */}
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="h-4 w-4 mr-2" />
            Exportar
          </Button>

          {/* Botão de Zerar Base (original) */}
          <Button variant="outline" onClick={handleResetDatabase}>
            <Trash className="h-4 w-4 mr-2" />
            Zerar Base
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px] w-full rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Código FLE</TableHead>
              <TableHead className="min-w-[300px]">Título</TableHead>
              <TableHead>Editora</TableHead>
              <TableHead>Distribuidor</TableHead>
              <TableHead className="text-right w-[80px]">Quantidade</TableHead>
              <TableHead className="text-right w-[120px]">
                Preço Feira
              </TableHead>
              <TableHead className="text-right w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBooks.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {searchTerm
                    ? "Nenhum livro encontrado para esta busca"
                    : "Nenhum livro no inventário"}
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map((book) => (
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
                    {book.quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(book.coverPrice)}
                  </TableCell>
                  <TableCell>
                    {" "}
                    {/* Nova célula de ações */}
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
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="mt-2 text-sm text-muted-foreground">
        {loading
          ? "Carregando dados do inventário..."
          : `Total: ${filteredBooks.length} de ${books.length} livros`}
      </div>

      {/* Diálogo de adição de livro */}
      <AddInventoryBookDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={fetchInventoryData}
      />

      {/* Diálogo de edição de livro */}
      {selectedBook && (
        <EditInventoryBookDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          book={selectedBook}
          onSuccess={fetchInventoryData}
        />
      )}

      {/* Diálogo de exclusão de livro */}
      {selectedBook && (
        <DeleteInventoryBookDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          book={selectedBook}
          onSuccess={fetchInventoryData}
        />
      )}
    </Card>
  );
}
