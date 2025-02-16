//app/(portal)/relatorios/_components/sold-books-pdf-wrapper.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { BooksSoldPDF } from "./books-report-pdf";

interface PdfWrapperProps {
  data: {
    codFle: string;
    title: string;
    totalQuantity: number;
    totalAmount: number;
    averagePrice: number;
  }[];
  totalVendas: number;
  totalQuantidade: number;
}

export function SoldBooksPdfWrapper({
  data,
  totalVendas,
  totalQuantidade,
}: PdfWrapperProps) {
  const [loading, setLoading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const currentDate = new Date().toISOString().split("T")[0];
      const blob = await pdf(
        <BooksSoldPDF
          data={data}
          totalVendas={totalVendas}
          totalQuantidade={totalQuantidade}
        />
      ).toBlob();

      if (typeof window !== "undefined") {
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement("a");
        link.href = url;
        link.download = `relatorio-vendas-${currentDate}.pdf`;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={loading} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      {loading ? "Gerando PDF..." : "Download PDF"}
    </Button>
  );
}
