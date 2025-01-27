"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { TransactionForm } from "./transaction-form";
import { useState } from "react";
import { useCashRegister } from "@/hooks/use-cash-register";

export function AddTransactionButton() {
  const [open, setOpen] = useState(false);
  const { isOpen, isLoading } = useCashRegister();

  if (isLoading) return null;

  if (!isOpen) {
    return (
      <Button disabled>
        <Plus className="mr-2 h-4 w-4" />
        Abra o caixa primeiro
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Venda
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Nova Venda</DialogTitle>
        </DialogHeader>
        <TransactionForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
