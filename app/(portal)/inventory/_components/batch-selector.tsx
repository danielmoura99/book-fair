//app/(portal)/inventory/_components/batch-selector.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInventory } from "./inventory-context";
import { Layers, Plus } from "lucide-react";

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

export function BatchSelector() {
  const { currentBatch, setCurrentBatch } = useInventory();
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(currentBatch || "");
  const [customBatch, setCustomBatch] = useState("");
  const [batchType, setBatchType] = useState<"common" | "custom">("common");

  const handleConfirm = () => {
    if (batchType === "common" && selectedOption) {
      setCurrentBatch(selectedOption);
    } else if (batchType === "custom" && customBatch) {
      setCurrentBatch(customBatch);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={currentBatch ? "default" : "outline"}
          className="w-full"
        >
          {currentBatch ? (
            <>
              <Layers className="mr-2 h-5 w-5" />
              Lote: {currentBatch}
            </>
          ) : (
            <>
              <Plus className="mr-2 h-5 w-5" />
              Selecionar Lote
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Selecionar Lote</DialogTitle>
          <DialogDescription>
            Escolha o lote de editora que está registrando ou crie um
            personalizado.
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
              <Select value={selectedOption} onValueChange={setSelectedOption}>
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
            onClick={handleConfirm}
            disabled={
              (batchType === "common" && !selectedOption) ||
              (batchType === "custom" && !customBatch)
            }
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
