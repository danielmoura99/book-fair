//app/(portal)/inventory/upload/_components/inventory-template-downloader.tsx
"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import * as XLSX from "xlsx";

export function InventoryTemplateDownloader() {
  const handleDownloadTemplate = () => {
    // Criar um workbook com uma planilha
    const workbook = XLSX.utils.book_new();

    // Definir os cabeçalhos das colunas na ordem esperada
    const headers = [
      "Código FLE",
      "Código de Barras",
      "Local",
      "Quantidade",
      "Preço Feira",
      "Preço Capa",
      "Título",
      "Autor",
      "Médium",
      "Editora",
      "Distribuidor",
      "Assunto",
    ];

    // Criar algumas linhas de exemplo
    const exampleData = [
      [
        "1234", // Código FLE
        "9788599772096", // Código de Barras
        "ESTOQUE", // Local
        10, // Quantidade
        15.9, // Preço Feira
        19.9, // Preço Capa
        "O Livro dos Espíritos", // Título
        "Allan Kardec", // Autor
        "N/A", // Médium
        "FEB", // Editora
        "DISTRIBUIDORA X", // Distribuidor
        "Codificação", // Assunto
      ],
      [
        "5678", // Código FLE
        "9788573284492", // Código de Barras
        "ESTOQUE", // Local
        5, // Quantidade
        12.5, // Preço Feira
        15.0, // Preço Capa
        "O Evangelho Segundo o Espiritismo", // Título
        "Allan Kardec", // Autor
        "N/A", // Médium
        "FEB", // Editora
        "DISTRIBUIDORA Y", // Distribuidor
        "Codificação", // Assunto
      ],
    ];

    // Criar a planilha com os cabeçalhos e dados de exemplo
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exampleData]);

    // Adicionar a planilha ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Modelo de Inventário");

    // Definir larguras de coluna apropriadas
    const columnWidths = [
      { wch: 10 }, // Código FLE
      { wch: 15 }, // Código de Barras
      { wch: 10 }, // Local
      { wch: 10 }, // Quantidade
      { wch: 10 }, // Preço Feira
      { wch: 10 }, // Preço Capa
      { wch: 40 }, // Título
      { wch: 20 }, // Autor
      { wch: 20 }, // Médium
      { wch: 15 }, // Editora
      { wch: 15 }, // Distribuidor
      { wch: 15 }, // Assunto
    ];

    worksheet["!cols"] = columnWidths;

    // Gerar o arquivo Excel e fazer o download
    XLSX.writeFile(workbook, "modelo_inventario.xlsx");
  };

  return (
    <Button variant="outline" onClick={handleDownloadTemplate}>
      <FileDown className="mr-2 h-4 w-4" />
      Baixar Modelo de Excel
    </Button>
  );
}
