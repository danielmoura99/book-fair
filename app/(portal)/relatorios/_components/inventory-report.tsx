// app/(portal)/relatorios/_components/inventory-report.tsx
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { InventoryPDFDownloadButton } from "./inventory-pdf-button";
import { ExcelDownloadButton } from "./excel-download-button";

interface InventoryBookData {
  codFle: string;
  title: string;
  publisher: string;
  distributor: string;
  quantity: number;
  quantitySold: number;
}

function InventoryReport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booksInventory, setBooksInventory] = useState<InventoryBookData[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get("/api/reports/books-inventory");
        setBooksInventory(response.data);
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
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            Relatório de Livros em Estoque
          </h3>
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
              <TableHead>Código FLE</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Editora</TableHead>
              <TableHead>Distribuidor</TableHead>
              <TableHead className="text-right">Em Estoque</TableHead>
              <TableHead className="text-right">Vendidos</TableHead>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}

export default InventoryReport;
