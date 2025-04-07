//app/(portal)/inventory/_components/export-inventory-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import * as XLSX from "xlsx";

// Definindo a interface para o livro
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

interface ExportInventoryButtonProps {
  className?: string;
}

export function ExportInventoryButton({
  className,
}: ExportInventoryButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportToExcel = async () => {
    try {
      setIsExporting(true);

      // Buscar os dados do inventário
      const response = await axios.get<{ books: InventoryBook[] }>(
        "/api/inventory"
      );
      const books = response.data.books;

      // Formatar os dados para o Excel - na ordem especificada
      const excelData = books.map((book: InventoryBook) => ({
        "Código FLE": book.codFle,
        "Código de Barras": book.barCode || "",
        Local: book.location,
        Quantidade: book.quantity,
        "Preço Feira": Number(book.coverPrice).toFixed(2),
        "Preço Capa": Number(book.price).toFixed(2),
        Título: book.title,
        Autor: book.author,
        Médium: book.medium,
        Editora: book.publisher,
        Distribuidor: book.distributor,
        Assunto: book.subject,
      }));

      // Criar planilha
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventário");

      // Ajustar larguras das colunas - na mesma ordem
      const columnsWidth = [
        { wch: 10 }, // Código FLE
        { wch: 15 }, // Código de Barras
        { wch: 10 }, // Local
        { wch: 10 }, // Quantidade
        { wch: 10 }, // Preço Feira
        { wch: 10 }, // Preço Capa
        { wch: 40 }, // Título
        { wch: 20 }, // Autor
        { wch: 15 }, // Médium
        { wch: 15 }, // Editora
        { wch: 15 }, // Distribuidor
        { wch: 15 }, // Assunto
      ];
      worksheet["!cols"] = columnsWidth;

      // Data e hora para o nome do arquivo
      const dateTime = new Date().toISOString().split("T")[0];

      // Gerar arquivo
      XLSX.writeFile(workbook, `inventario_${dateTime}.xlsx`);

      toast({
        title: "Exportação concluída",
        description: "Inventário exportado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao exportar inventário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o inventário.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExportToExcel}
      disabled={isExporting}
      className={`h-7 text-xs ${className}`}
    >
      {isExporting ? (
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
      ) : (
        <FileSpreadsheet className="h-3 w-3 mr-1" />
      )}
      Exportar
    </Button>
  );
}
