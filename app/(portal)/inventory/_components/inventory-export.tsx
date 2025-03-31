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
import { FileDown, Loader2 } from "lucide-react";
import { useInventory } from "./inventory-context";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface InventoryExportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryExport({ open, onOpenChange }: InventoryExportProps) {
  const { inventoryItems } = useInventory();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  // Exportar para Excel
  const handleExportToExcel = async () => {
    try {
      setExporting(true);

      // Formatar dados para Excel
      const excelData = inventoryItems.map((item) => ({
        "Código FLE": item.book.codFle,
        "Código de Barras": item.barcodeUsed,
        Título: item.book.title,
        Autor: item.book.author,
        Médium: item.book.medium,
        Editora: item.book.publisher,
        Distribuidor: item.book.distributor,
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
      const fileName = `inventario_${date}.xlsx`;

      // Gerar arquivo
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Exportação concluída",
        description: `O arquivo ${fileName} foi gerado com sucesso.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao exportar para Excel:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar arquivo Excel. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
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

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Resumo do Inventário</h3>
            <p className="text-sm text-muted-foreground">
              Total de itens:{" "}
              <span className="font-medium">{inventoryItems.length}</span> |
              Total de unidades:{" "}
              <span className="font-medium">
                {inventoryItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </p>
          </div>

          <div className="border rounded-md p-4 space-y-2">
            <h3 className="text-sm font-medium">Exportar para Excel</h3>
            <p className="text-sm text-muted-foreground">
              Gera um arquivo Excel com todos os itens escaneados, que pode ser
              importado posteriormente ou compartilhado.
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
