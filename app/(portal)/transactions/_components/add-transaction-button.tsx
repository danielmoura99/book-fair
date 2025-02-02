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
import { cn } from "@/lib/utils";

interface AddTransactionButtonProps {
  className?: string;
  fullWidth?: boolean;
  showIcon?: boolean;
  variant?: "default" | "outline";
}

export function AddTransactionButton({
  className,
  fullWidth,
  showIcon = true,
  variant = "default",
}: AddTransactionButtonProps) {
  const [open, setOpen] = useState(false);
  const { isOpen, isLoading } = useCashRegister();

  if (isLoading) return null;

  if (!isOpen) {
    return (
      <Button disabled className={cn(className, fullWidth && "w-full")}>
        {showIcon && <Plus className="mr-2 h-6 w-6" />}
        Nova Venda
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          className={cn(className, fullWidth && "w-full")}
        >
          {showIcon && <Plus className="mr-2 h-6 w-6" />}
          Nova Venda
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[1000px] w-[90vw]">
        <DialogHeader>
          <DialogTitle>Registrar Nova Venda</DialogTitle>
        </DialogHeader>
        <TransactionForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
