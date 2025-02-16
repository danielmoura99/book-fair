//app/(portal)/transactions/_components/barcode-scanner.tsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { Book } from "@prisma/client";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BarcodeScannerProps {
  onScan: (book: Book) => void;
  disabled?: boolean;
}

export function BarcodeScanner({ onScan, disabled }: BarcodeScannerProps) {
  const [barcode, setBarcode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = async (event: KeyboardEvent) => {
      // Ignorar se for um campo de input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Scanner geralmente termina com Enter
      if (event.key === "Enter" && barcode) {
        try {
          setError(null);
          console.log("Código lido:", barcode); // Para debug

          // Evitar leituras duplicadas
          if (barcode === lastScanned) {
            setBarcode("");
            return;
          }

          const response = await axios.get(`/api/books/barcode/${barcode}`);
          const book = response.data;

          setLastScanned(barcode);
          onScan(book);
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            setError(`Livro não encontrado para o código: ${barcode}`);
          } else {
            setError("Erro ao processar código de barras");
          }
          console.error("Erro ao buscar livro:", error);
        }
        setBarcode("");
      } else if (event.key.length === 1) {
        // Apenas caracteres únicos (evitar teclas especiais)
        setBarcode((prev) => prev + event.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [barcode, onScan, disabled, lastScanned]);

  // Limpar o último código escaneado após 2 segundos
  useEffect(() => {
    if (lastScanned) {
      const timer = setTimeout(() => setLastScanned(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastScanned]);

  return (
    <Card className="p-6">
      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="text-center text-muted-foreground">
          {disabled
            ? "Scanner desativado"
            : "Scanner ativo. Aproxime o leitor do código de barras."}
        </div>
      )}
      {barcode && (
        <div className="mt-2 text-center text-sm text-muted-foreground">
          Lendo: {barcode}
        </div>
      )}
    </Card>
  );
}
