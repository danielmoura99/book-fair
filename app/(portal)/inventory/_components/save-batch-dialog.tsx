//app/(portal)/inventory/_components/save-batch-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInventory } from "./inventory-context";
import { Loader2 } from "lucide-react";

// Lista comum de editoras/lotes
const COMMON_PUBLISHERS = [
  "DEVL FEB", // FEB
  "DEVL BOA NOVA", // Boa Nova
  "DEVL EME", // EME
  "DEVL PETIT", // Petit
  "DEVL LEAL", // Leal
  "DEVL IDE", // IDE
  "DEVL INTELITERA", // Intelitera
  "DEVL CEAC", // CEAC
  "OUTROS", // Outros
];

interface SaveBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveBatchDialog({ open, onOpenChange }: SaveBatchDialogProps) {
  const { saveBatch, isSaving } = useInventory();
  const [batchType, setBatchType] = useState<"common" | "custom">("common");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [customBatch, setCustomBatch] = useState("");

  const handleSave = async () => {
    let batchName = "";

    if (batchType === "common") {
      batchName = selectedBatch;
    } else {
      batchName = customBatch;
    }

    if (!batchName) return;

    const success = await saveBatch(batchName);
    if (success) {
      onOpenChange(false);
      // Resetar os valores do formulário
      setSelectedBatch("");
      setCustomBatch("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Salvar Inventário</DialogTitle>
          <DialogDescription>
            Selecione o lote para agrupar os itens escaneados
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={batchType === "common" ? "default" : "outline"}
              onClick={() => setBatchType("common")}
            >
              Lotes Comuns
            </Button>
            <Button
              variant={batchType === "custom" ? "default" : "outline"}
              onClick={() => setBatchType("custom")}
            >
              Lote Personalizado
            </Button>
          </div>

          {batchType === "common" ? (
            <div className="space-y-2">
              <Label htmlFor="batch">Selecionar Lote</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um lote" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_PUBLISHERS.map((publisher) => (
                    <SelectItem key={publisher} value={publisher}>
                      {publisher}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="customBatch">Nome do Lote</Label>
              <Input
                id="customBatch"
                value={customBatch}
                onChange={(e) => setCustomBatch(e.target.value.toUpperCase())}
                placeholder="Ex: DEVL ESPECIAL"
              />
              <p className="text-sm text-muted-foreground">
                Recomendamos usar o prefixo DEVL para manter o padrão.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isSaving ||
              (batchType === "common" && !selectedBatch) ||
              (batchType === "custom" && !customBatch)
            }
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Inventário"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
