//app/(portal)/inventory/_components/zero-inventory-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface ZeroInventoryButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export function ZeroInventoryButton({
  onSuccess,
  className,
}: ZeroInventoryButtonProps) {
  const [isZeroing, setIsZeroing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();

  const handleZeroInventory = () => {
    setShowConfirm(true);
  };

  const confirmZeroInventory = async () => {
    try {
      setIsZeroing(true);

      // Chamada para API que zerará todas as quantidades
      await axios.post("/api/inventory/zero-all");

      toast({
        title: "Base zerada",
        description: "Todas as quantidades foram atualizadas para zero.",
      });

      // Callback após zerar
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao zerar inventário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível zerar o inventário.",
        variant: "destructive",
      });
    } finally {
      setIsZeroing(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle>Zerar base de inventário</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Esta ação definirá a quantidade de TODOS os livros para zero. Esta
              operação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-8">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmZeroInventory}
              className="text-xs h-8 bg-destructive"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button
        variant="destructive"
        onClick={handleZeroInventory}
        disabled={isZeroing}
        className={`h-7 text-xs ${className}`}
      >
        {isZeroing ? (
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        ) : (
          <RefreshCw className="h-3 w-3 mr-1" />
        )}
        Zerar Base
      </Button>
    </>
  );
}
