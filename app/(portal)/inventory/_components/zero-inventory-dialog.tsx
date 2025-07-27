"use client";

import { useState } from "react";
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

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface ZeroInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ZeroInventoryDialog({
  open,
  onOpenChange,
  onSuccess,
}: ZeroInventoryDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const CONFIRMATION_TEXT = "ZERAR TUDO";

  const handleZeroInventory = async () => {
    if (confirmText !== CONFIRMATION_TEXT) {
      toast({
        title: "Confirmação incorreta",
        description: `Digite exatamente "${CONFIRMATION_TEXT}" para confirmar`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post("/api/inventory/zero-all");

      toast({
        title: "Inventário zerado",
        description: response.data.message,
      });

      onOpenChange(false);
      setConfirmText("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao zerar inventário:", error);

      toast({
        title: "Erro ao zerar inventário",
        description: "Ocorreu um erro ao zerar as quantidades do inventário",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setConfirmText("");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Zerar Todo o Inventário
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="text-destructive font-medium">
              ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!
            </div>

            <div>
              Esta operação irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Zerar a quantidade de TODOS os livros no inventário</li>
                <li>Não poderá ser desfeita</li>
                <li>Afetará todo o sistema de estoque</li>
              </ul>
            </div>

            <div className="bg-destructive/10 p-3 rounded border border-destructive/20">
              <p className="text-sm">
                Para confirmar, digite exatamente:{" "}
                <strong>{CONFIRMATION_TEXT}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmação:</Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRMATION_TEXT}
                className="font-mono"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleZeroInventory}
            disabled={confirmText !== CONFIRMATION_TEXT || isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? (
              "Zerando..."
            ) : (
              <>
                <Trash className="h-4 w-4 mr-2" />
                Zerar Inventário
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
