// app/(portal)/relatorios/_components/inventory-report.tsx
"use client";

import React, { useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { InventoryPDFDownloadButton } from "./inventory-pdf-button";
import { ExcelDownloadButton } from "./excel-download-button";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface InventoryBookData {
  codFle: string;
  title: string;
  publisher: string;
  distributor: string;
  quantity: number;
  quantitySold: number;
  lastSaleDate: string | null;
  isOutOfStock: boolean;
  soldOutDate: string | null;
}

type SortField = 'codFle' | 'title' | 'publisher' | 'distributor' | 'quantity' | 'quantitySold' | 'soldOutDate';
type SortDirection = 'asc' | 'desc';

function InventoryReport() {
  const queryClient = useQueryClient();
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const {
    data: rawBooksInventory = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery<InventoryBookData[]>({
    queryKey: ["books-inventory"],
    queryFn: async () => {
      const response = await axios.get("/api/reports/books-inventory");
      return response.data;
    },
    // ✅ CONFIGURAÇÕES ANTI-CACHE:
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Função de sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Aplicar sorting aos dados
  const booksInventory = [...rawBooksInventory].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Tratar valores null (datas que podem ser null)
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return sortDirection === 'asc' ? 1 : -1;
    if (bValue === null) return sortDirection === 'asc' ? -1 : 1;

    // Para strings, comparar ignorando case
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Componente do cabeçalho ordenável
  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center justify-between">
        {children}
        <div className="ml-2">
          {sortField === field && sortDirection === 'asc' && <ChevronUp className="h-4 w-4" />}
          {sortField === field && sortDirection === 'desc' && <ChevronDown className="h-4 w-4" />}
        </div>
      </div>
    </TableHead>
  );

  // ✅ ADICIONAR função de refresh:
  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["books-inventory"] });
    refetch();
  };

  if (loading) {
    return <div className="p-4">Carregando relatório...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Erro ao carregar dados: {error.message}
      </div>
    );
  }

  if (!booksInventory.length) {
    return <div className="p-4">Nenhum dado disponível</div>;
  }

  const totalInventory = booksInventory.reduce(
    (sum, book) => sum + book.quantity,
    0
  );

  const totalSold = booksInventory.reduce(
    (sum, book) => sum + book.quantitySold,
    0
  );

  const excelData = booksInventory.map((book) => ({
    "Código FLE": book.codFle,
    Título: book.title,
    Editora: book.publisher,
    Distribuidor: book.distributor,
    "Em Estoque": book.quantity,
    Vendidos: book.quantitySold,
    "Data Esgotado": book.soldOutDate 
      ? new Date(book.soldOutDate).toLocaleDateString("pt-BR")
      : book.quantity === 0 
        ? "Sem estoque" 
        : "Disponível",
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            Relatório de Livros em Estoque
          </h3>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
          <p className="text-sm text-muted-foreground">
            Total em estoque: {totalInventory} livros | Total vendido:{" "}
            {totalSold} livros
          </p>
        </div>
        <div className="flex">
          <InventoryPDFDownloadButton
            data={booksInventory}
            totalInventory={totalInventory}
            totalSold={totalSold}
          />
          <ExcelDownloadButton
            data={excelData}
            fileName={`relatorio-estoque-${
              new Date().toISOString().split("T")[0]
            }`}
            sheetName="Livros em Estoque"
          />
        </div>
      </div>
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="codFle">Código FLE</SortableHeader>
              <SortableHeader field="title">Título</SortableHeader>
              <SortableHeader field="publisher">Editora</SortableHeader>
              <SortableHeader field="distributor">Distribuidor</SortableHeader>
              <SortableHeader field="quantity">
                <div className="text-right">Em Estoque</div>
              </SortableHeader>
              <SortableHeader field="quantitySold">
                <div className="text-right">Vendidos</div>
              </SortableHeader>
              <SortableHeader field="soldOutDate">
                <div className="text-center">Data Esgotado</div>
              </SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {booksInventory.map((book) => (
              <TableRow key={book.codFle}>
                <TableCell>{book.codFle}</TableCell>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.publisher}</TableCell>
                <TableCell>{book.distributor}</TableCell>
                <TableCell className="text-right">{book.quantity}</TableCell>
                <TableCell className="text-right">
                  {book.quantitySold}
                </TableCell>
                <TableCell className="text-center">
                  {book.soldOutDate ? (
                    <div className="flex flex-col items-center">
                      <span className="text-red-600 text-xs font-medium">ESGOTADO</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(book.soldOutDate).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  ) : book.quantity === 0 ? (
                    <span className="text-muted-foreground text-xs">Sem estoque</span>
                  ) : (
                    <span className="text-green-600 text-xs">Disponível</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

export default InventoryReport;
