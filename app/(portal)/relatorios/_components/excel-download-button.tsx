// app/(portal)/relatorios/_components/excel-download-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

interface ExcelDownloadButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  fileName: string;
  sheetName?: string;
}

export function ExcelDownloadButton({
  data,
  fileName,
  sheetName = "Sheet1",
}: ExcelDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);

      // Criar uma nova planilha
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Criar um novo workbook
      const workbook = XLSX.utils.book_new();

      // Adicionar a planilha ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Gerar o arquivo Excel
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      // Converter o buffer para um Blob
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Criar uma URL para o Blob
      const url = window.URL.createObjectURL(blob);

      // Criar um link e simular o clique
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Limpar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar arquivo Excel:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      variant="outline"
      className="ml-2"
    >
      <FileSpreadsheet className="mr-2 h-4 w-4" />
      {loading ? "Gerando Excel..." : "Download Excel"}
    </Button>
  );
}
