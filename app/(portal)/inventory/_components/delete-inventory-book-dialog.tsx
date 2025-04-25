// app/(portal)/inventory/_components/delete-inventory-book-dialog.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InventoryBook {
  id: string;
  codFle: string;
  title: string;
  quantity: number;
}

interface DeleteInventoryBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: InventoryBook;
  onSuccess?: () => void;
}

export function DeleteInventoryBookDialog({
  open,
  onOpenChange,
  book,
  onSuccess,
}: DeleteInventoryBookDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setLoading(true);

      // Enviar requisição para excluir o livro
      await axios.delete(`/api/inventory/${book.id}`);

      toast({
        title: "Livro excluído",
        description: `O livro "${book.title}" foi excluído do inventário com sucesso.`,
      });

      // Fechar diálogo e executar callback de sucesso
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao excluir livro:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o livro do inventário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
            Excluir Livro
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir este livro do inventário? Esta ação
            não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-md bg-muted p-4">
            <h3 className="mb-2 font-medium">{book.title}</h3>
            <p className="text-sm text-muted-foreground">
              Código FLE: {book.codFle}
            </p>
            <p className="text-sm text-muted-foreground">
              Quantidade atual: {book.quantity}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Confirmar Exclusão"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
