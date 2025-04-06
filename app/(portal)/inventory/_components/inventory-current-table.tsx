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
import { Search, RefreshCw } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { formatPrice } from "@/lib/utils";

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

  // Função para buscar dados do inventário
  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/inventory");
      setBooks(response.data.books);
      setFilteredBooks(response.data.books);
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

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar no inventário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={fetchInventoryData}
          disabled={loading}
          className="ml-2"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">Atualizar</span>
        </Button>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBooks.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
    </Card>
  );
}
