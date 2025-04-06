//app/(portal)/inventory/_components/save-updates-dialog.tsx
"use client";

//import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useInventory } from "./inventory-context";

interface SaveUpdatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveUpdatesDialog({
  open,
  onOpenChange,
}: SaveUpdatesDialogProps) {
  const { saveUpdates, isSaving, pendingUpdates } = useInventory();

  const handleSave = async () => {
    const success = await saveUpdates();
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Salvar Atualizações</DialogTitle>
          <DialogDescription>
            Confirme para salvar todas as atualizações de quantidade no
            inventário.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-md bg-muted p-4">
            <h3 className="mb-2 text-sm font-medium">Resumo das alterações</h3>
            <p className="text-sm">
              Você está prestes a atualizar as quantidades de{" "}
              {pendingUpdates.length}
              {pendingUpdates.length === 1 ? " item" : " itens"} no inventário.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta ação não pode ser desfeita. Confirme apenas se você tem
              certeza das quantidades informadas.
            </p>
          </div>
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
            disabled={isSaving || pendingUpdates.length === 0}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Confirmar Atualizações"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
