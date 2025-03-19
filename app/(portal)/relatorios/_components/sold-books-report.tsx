//app/(portal)/relatorios/_components/sold-books-report.tsx
"use client";

import React, { useEffect, useState } from "react";
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
import { formatPrice } from "@/lib/utils";
import dynamic from "next/dynamic";
import { ExcelDownloadButton } from "./excel-download-button";

// Import dinâmico do componente PDF
const PDFDownloadButton = dynamic(
  () => import("./pdf-report").then((mod) => mod.PDFDownloadButton),
  {
    ssr: false,
    loading: () => <div>Carregando...</div>,
  }
);

interface SoldBookData {
  codFle: string;
  title: string;
  totalQuantity: number;
  totalAmount: number;
  averagePrice: number;
}

function SoldBooksReport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [soldBooks, setSoldBooks] = useState<SoldBookData[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get("/api/reports/sold-books");
        const sortedData = response.data.sort(
          (a: SoldBookData, b: SoldBookData) =>
            b.totalQuantity - a.totalQuantity
        );
        setSoldBooks(sortedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">Carregando relatório...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">Erro ao carregar dados: {error}</div>
    );
  }

  if (!soldBooks.length) {
    return <div className="p-4">Nenhum dado disponível</div>;
  }

  const totalVendas = soldBooks.reduce(
    (sum, book) => sum + book.totalAmount,
    0
  );
  const totalQuantidade = soldBooks.reduce(
    (sum, book) => sum + book.totalQuantity,
    0
  );

  // Preparar dados para Excel (formatando os valores monetários)
  const excelData = soldBooks.map((book) => ({
    "Código FLE": book.codFle,
    Título: book.title,
    Quantidade: book.totalQuantity,
    "Valor Total": book.totalAmount.toFixed(2),
    "Preço Médio": book.averagePrice.toFixed(2),
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            Relatório de Livros Vendidos
          </h3>
          <p className="text-sm text-muted-foreground">
            Total de vendas: {formatPrice(totalVendas)} | Quantidade:{" "}
            {totalQuantidade} livros
          </p>
        </div>
        <div className="flex">
          <PDFDownloadButton
            data={soldBooks}
            totalVendas={totalVendas}
            totalQuantidade={totalQuantidade}
          />
          <ExcelDownloadButton
            data={excelData}
            fileName={`relatorio-vendas-${
              new Date().toISOString().split("T")[0]
            }`}
            sheetName="Livros Vendidos"
          />
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código FLE</TableHead>
              <TableHead>Título</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-right">Preço Médio</TableHead>
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
                <TableCell className="text-right">
                  {formatPrice(book.totalAmount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatPrice(book.averagePrice)}
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

export default SoldBooksReport;
