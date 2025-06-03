//app/(portal)/transactions/_components/add-transaction-button.tsx
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
      <DialogContent className="w-[95vw] max-w-[1200px] h-[95vh] max-h-[900px] overflow-hidden p-0">
        <DialogHeader className="p-4 sm:p-6 pb-2">
          <DialogTitle>Registrar Nova Venda</DialogTitle>
        </DialogHeader>
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 overflow-y-auto flex-1">
          <TransactionForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
