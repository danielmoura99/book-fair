//app/(portal)/relatorios/_components/sold-books-simple-report.tsx
"use client";

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
import dynamic from "next/dynamic";
import { ExcelDownloadButton } from "./excel-download-button";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// Import dinâmico do componente PDF
const PDFDownloadButtonSimple = dynamic(
  () => import("./pdf-report-simple").then((mod) => mod.PDFDownloadButtonSimple),
  {
    ssr: false,
    loading: () => <div>Carregando...</div>,
  }
);

interface SoldBookSimpleData {
  codFle: string;
  title: string;
  totalQuantity: number;
  // ❌ Removido: totalAmount e averagePrice
}

type SortField = 'codFle' | 'title' | 'totalQuantity';
type SortDirection = 'asc' | 'desc';

function SoldBooksSimpleReport() {
  const queryClient = useQueryClient();
  const [sortField, setSortField] = useState<SortField>('totalQuantity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const {
    data: rawSoldBooks = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery<SoldBookSimpleData[]>({
    queryKey: ["sold-books-simple"],
    queryFn: async () => {
      const response = await axios.get("/api/reports/sold-books");
      // Transformar os dados para remover informações financeiras
      return response.data.map((book: {
        codFle: string;
        title: string;
        totalQuantity: number;
        totalAmount: number;
        averagePrice: number;
      }) => ({
        codFle: book.codFle,
        title: book.title,
        totalQuantity: book.totalQuantity,
        // ❌ Não incluir: totalAmount, averagePrice
      }));
    },
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
  const soldBooks = [...rawSoldBooks].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

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

  // Função de refresh
  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["sold-books-simple"] });
    refetch();
  };

  if (loading) {
    return <div className="p-4">Carregando relatório...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Erro ao carregar dados:{" "}
        {error instanceof Error ? error.message : "Erro desconhecido"}
      </div>
    );
  }

  if (!soldBooks.length) {
    return <div className="p-4">Nenhum dado disponível</div>;
  }

  // ✅ APENAS dados quantitativos
  const totalQuantidade = soldBooks.reduce(
    (sum, book) => sum + book.totalQuantity,
    0
  );

  // Preparar dados para Excel (SEM valores monetários)
  const excelData = soldBooks.map((book) => ({
    "Código FLE": book.codFle,
    Título: book.title,
    Quantidade: book.totalQuantity,
    // ❌ Removido: "Valor Total" e "Preço Médio"
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Livros Vendidos Simples</h3>
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
      </div>
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Relatório de Livros Vendidos (Simples)
          </h3>
          <p className="text-sm text-muted-foreground">
            {/* ❌ Removido total de vendas financeiro */}
            Quantidade total: {totalQuantidade} livros
          </p>
        </div>
        <div className="flex">
          <PDFDownloadButtonSimple
            data={soldBooks}
            totalQuantidade={totalQuantidade}
          />
          <ExcelDownloadButton
            data={excelData}
            fileName={`relatorio-vendas-simples-${
              new Date().toISOString().split("T")[0]
            }`}
            sheetName="Livros Vendidos Simples"
          />
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="codFle">Código FLE</SortableHeader>
              <SortableHeader field="title">Título</SortableHeader>
              <SortableHeader field="totalQuantity">
                <div className="text-right">Quantidade</div>
              </SortableHeader>
              {/* ❌ Removido: Valor Total e Preço Médio */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {soldBooks.map((book) => (
              <TableRow key={book.codFle}>
                <TableCell>{book.codFle}</TableCell>
                <TableCell>{book.title}</TableCell>
                <TableCell className="text-right">
                  {book.totalQuantity}
                </TableCell>
                {/* ❌ Removido: colunas de valor */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

export default SoldBooksSimpleReport;