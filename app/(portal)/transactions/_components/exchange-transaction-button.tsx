"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RefreshCw, Undo2 } from "lucide-react";
import { ExchangeForm } from "./exchange-form";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ExchangeTransactionButtonProps {
  className?: string;
  fullWidth?: boolean;
  showIcon?: boolean;
  variant?: "default" | "outline";
}

export function ExchangeTransactionButton({
  className,
  fullWidth,
  showIcon = true,
  variant = "outline",
}: ExchangeTransactionButtonProps) {
  const [openTroca, setOpenTroca] = useState(false);
  const [openDevolucao, setOpenDevolucao] = useState(false);

  // Handlers com cleanup garantido
  const handleTrocaSuccess = useCallback(() => {
    setOpenTroca(false);
  }, []);

  const handleDevolucaoSuccess = useCallback(() => {
    setOpenDevolucao(false);
  }, []);

  // Handlers para fechamento limpo
  const handleCloseTroca = useCallback((open: boolean) => {
    setOpenTroca(open);
  }, []);

  const handleCloseDevolucao = useCallback((open: boolean) => {
    setOpenDevolucao(open);
  }, []);

  return (
    <>
      {/* ✅ NOVO: Dois botões separados */}
      <div className={cn("flex gap-2", fullWidth && "w-full")}>
        {/* Botão Troca */}
        <Button
          variant={variant}
          className={cn(className, fullWidth && "flex-1")}
          onClick={() => setOpenTroca(true)}
          disabled={openTroca || openDevolucao}
        >
          {showIcon && <RefreshCw className="mr-2 h-4 w-4" />}
          Troca
        </Button>

        {/* Botão Devolução */}
        <Button
          variant={variant}
          className={cn(className, fullWidth && "flex-1")}
          onClick={() => setOpenDevolucao(true)}
          disabled={openTroca || openDevolucao}
        >
          {showIcon && <Undo2 className="mr-2 h-4 w-4" />}
          Devolução
        </Button>
      </div>

      {/* Dialog para TROCA */}
      <Dialog open={openTroca} onOpenChange={handleCloseTroca}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Registrar Troca de Livros
            </DialogTitle>
          </DialogHeader>
          {openTroca && (
            <ExchangeForm mode="TROCA" onSuccess={handleTrocaSuccess} />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para DEVOLUÇÃO */}
      <Dialog open={openDevolucao} onOpenChange={handleCloseDevolucao}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Undo2 className="h-5 w-5" />
              Registrar Devolução
            </DialogTitle>
          </DialogHeader>
          {openDevolucao && (
            <ExchangeForm mode="DEVOLUCAO" onSuccess={handleDevolucaoSuccess} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
