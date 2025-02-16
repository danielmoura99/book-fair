//app/(portal)/relatorios/_components/pdf-download-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { pdf } from "@react-pdf/renderer";

interface PDFDownloadButtonProps {
  document: React.ReactElement;
  fileName: string;
}

export function PDFDownloadButton({
  document,
  fileName,
}: PDFDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const blob = await pdf(document).toBlob();

      // Usando o objeto window para acessar o document do navegador
      if (typeof window !== "undefined") {
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement("a");
        link.href = url;
        link.download = fileName;
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
