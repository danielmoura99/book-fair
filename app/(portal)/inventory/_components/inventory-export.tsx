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
  const { pendingUpdates } = useInventory();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  // Exportar para Excel
  const handleExportToExcel = async () => {
    try {
      setExporting(true);

      // Formatar dados para Excel
      const excelData = pendingUpdates.map((update) => ({
        "Código FLE": update.book.codFle,
        "Código de Barras": update.book.barCode || "",
        Título: update.book.title,
        Autor: update.book.author,
        Médium: update.book.medium,
        Editora: update.book.publisher,
        Distribuidor: update.book.distributor,
        Assunto: update.book.subject,
        Local: update.book.location,
        "Quantidade Atual": update.previousQuantity,
        "Nova Quantidade": update.newQuantity,
        "Preço Feira": update.book.coverPrice,
        "Preço Capa": update.book.price,
      }));

      // Criar workbook
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Atualizações");

      // Formatar data para nome do arquivo
      const date = new Date().toISOString().split("T")[0];
      const fileName = `atualizacoes_inventario_${date}.xlsx`;

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
          <DialogTitle>Exportar Atualizações</DialogTitle>
          <DialogDescription>
            Escolha como deseja exportar as atualizações pendentes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Resumo das Atualizações</h3>
            <p className="text-sm text-muted-foreground">
              Total de atualizações:{" "}
              <span className="font-medium">{pendingUpdates.length}</span>
            </p>
          </div>

          <div className="border rounded-md p-4 space-y-2">
            <h3 className="text-sm font-medium">Exportar para Excel</h3>
            <p className="text-sm text-muted-foreground">
              Gera um arquivo Excel com todas as atualizações pendentes que
              podem ser compartilhadas.
            </p>
            <Button
              variant="outline"
              onClick={handleExportToExcel}
              disabled={exporting || pendingUpdates.length === 0}
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
