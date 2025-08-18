// app/(portal)/relatorios/_components/inventory-pdf-button.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { InventoryPDF } from "./inventory-pdf";

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

interface InventoryPDFButtonProps {
  data: InventoryBookData[];
  totalInventory: number;
  totalSold: number;
}

export function InventoryPDFDownloadButton({
  data,
  totalInventory,
  totalSold,
}: InventoryPDFButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const currentDate = new Date().toISOString().split("T")[0];
      const blob = await pdf(
        <InventoryPDF
          data={data}
          totalInventory={totalInventory}
          totalSold={totalSold}
        />
      ).toBlob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio-estoque-${currentDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
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
