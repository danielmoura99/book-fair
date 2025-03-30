//app/(portal)/inventory/_components/inventory-export.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileDown, Save, AlertTriangle, Loader2 } from "lucide-react";
import { useInventory } from "./inventory-context";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import * as XLSX from "xlsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface InventoryExportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryExport({ open, onOpenChange }: InventoryExportProps) {
  const { inventoryItems, currentBatch } = useInventory();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Exportar para Excel
  const handleExportToExcel = async () => {
    try {
      setExporting(true);
      setError(null);

      // Formatar dados para Excel
      const excelData = inventoryItems.map((item) => ({
        "Código FLE": item.book.codFle,
        "Código de Barras": item.barcodeUsed,
        Título: item.book.title,
        Autor: item.book.author,
        Médium: item.book.medium,
        Editora: item.book.publisher,
        Assunto: item.book.subject,
        Local: item.book.location,
        Quantidade: item.quantity,
        "Preço Feira": item.book.coverPrice,
        "Preço Capa": item.book.price,
      }));

      // Criar workbook
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventário");

      // Formatar data para nome do arquivo
      const date = new Date().toISOString().split("T")[0];
      const fileName = `inventario_${currentBatch.replace(
        /\s+/g,
        "_"
      )}_${date}.xlsx`;

      // Gerar arquivo
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Exportação concluída",
        description: `O arquivo ${fileName} foi gerado com sucesso.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao exportar para Excel:", error);
      setError("Erro ao gerar arquivo Excel. Tente novamente.");
    } finally {
      setExporting(false);
    }
  };

  // Transferir para sistema da feira (tabela Book)
  const handleTransferToFair = async () => {
    try {
      setTransferring(true);
      setError(null);

      // Fazer requisição para API para transferir os dados
      const response = await axios.post("/api/inventory/export", {
        batchName: currentBatch,
        bookIds: inventoryItems.map((item) => item.bookId),
      });

      toast({
        title: "Transferência concluída",
        description: `${response.data.data.books.length} livros foram transferidos para o sistema da feira.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao transferir para sistema:", error);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Erro ao transferir para o sistema da feira."
        );
      } else {
        setError("Erro desconhecido ao transferir para o sistema da feira.");
      }
    } finally {
      setTransferring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar Inventário</DialogTitle>
          <DialogDescription>
            Escolha como deseja exportar os dados do inventário atual.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Resumo do Inventário</h3>
            <p className="text-sm text-muted-foreground">
              Lote: <span className="font-medium">{currentBatch}</span> |
              Títulos:{" "}
              <span className="font-medium">{inventoryItems.length}</span> |
              Total:{" "}
              <span className="font-medium">
                {inventoryItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>{" "}
              livros
            </p>
          </div>

          <div className="border rounded-md p-4 space-y-2">
            <h3 className="text-sm font-medium">Exportar para Excel</h3>
            <p className="text-sm text-muted-foreground">
              Gera um arquivo Excel com todos os itens do inventário atual, que
              pode ser importado posteriormente.
            </p>
            <Button
              variant="outline"
              onClick={handleExportToExcel}
              disabled={exporting}
              className="w-full"
            >
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar para Excel
                </>
              )}
            </Button>
          </div>

          <div className="border rounded-md p-4 space-y-2">
            <h3 className="text-sm font-medium">
              Transferir para Sistema da Feira
            </h3>
            <p className="text-sm text-muted-foreground">
              Transfere os livros diretamente para o sistema da feira,
              atualizando a tabela Book.
            </p>
            <Button
              variant="default"
              onClick={handleTransferToFair}
              disabled={transferring}
              className="w-full"
            >
              {transferring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transferindo...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Transferir para Sistema da Feira
                </>
              )}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
