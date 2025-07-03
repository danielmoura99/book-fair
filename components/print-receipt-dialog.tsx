// components/print-receipt-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Printer, AlertCircle, CheckCircle, X } from "lucide-react";
import {
  printReceipt,
  SaleData,
  isWebSerialSupported,
} from "@/lib/printer-utils";
import { useToast } from "@/hooks/use-toast";

interface PrintReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saleData: SaleData | null;
  onComplete?: () => void;
}

export function PrintReceiptDialog({
  open,
  onOpenChange,
  saleData,
  onComplete,
}: PrintReceiptDialogProps) {
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePrint = async () => {
    if (!saleData) return;

    try {
      setPrinting(true);
      setError(null);

      await printReceipt(saleData);

      toast({
        title: "Recibo impresso!",
        description: "O recibo foi enviado para a impressora com sucesso.",
      });

      onOpenChange(false);
      onComplete?.();
    } catch (error) {
      console.error("Erro ao imprimir:", error);

      let errorMessage = "Erro desconhecido ao imprimir";

      if (error instanceof Error) {
        if (error.message.includes("No port selected")) {
          errorMessage = "Nenhuma impressora foi selecionada";
        } else if (error.message.includes("Failed to open")) {
          errorMessage = "Não foi possível conectar com a impressora";
        } else if (error.message.includes("não suportada")) {
          errorMessage = "Navegador não suporta impressão direta";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);

      toast({
        variant: "destructive",
        title: "Erro na impressão",
        description: errorMessage,
      });
    } finally {
      setPrinting(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    onComplete?.();
  };

  // Verificar suporte do navegador
  const isSupported = isWebSerialSupported();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Imprimir Recibo
          </DialogTitle>
          <DialogDescription>
            Deseja imprimir o recibo desta venda?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mostrar aviso se navegador não suporta */}
          {!isSupported && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Seu navegador não suporta impressão direta. Use Chrome ou Edge
                para acessar a impressora.
              </AlertDescription>
            </Alert>
          )}

          {/* Mostrar erro se houve problema na impressão */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Informações da venda */}
          {saleData && (
            <div className="bg-muted p-3 rounded-md text-sm space-y-1">
              <div className="flex justify-between">
                <span>Operador:</span>
                <span className="font-medium">{saleData.operatorName}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-medium">
                  R$ {saleData.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Itens:</span>
                <span className="font-medium">{saleData.items.length}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={printing}
            className="w-full sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Não Imprimir
          </Button>

          <Button
            onClick={handlePrint}
            disabled={printing || !isSupported || !saleData}
            className="w-full sm:w-auto"
          >
            {printing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Imprimindo...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Sim, Imprimir
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
