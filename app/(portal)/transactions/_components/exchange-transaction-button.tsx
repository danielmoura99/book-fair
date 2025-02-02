"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RepeatIcon } from "lucide-react";
import { ExchangeForm } from "./exchange-form";
import { useState } from "react";
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
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          className={cn(className, fullWidth && "w-full")}
        >
          {showIcon && <RepeatIcon className="mr-2 h-6 w-6" />}
          Troca/Devolução
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Registrar Troca ou Devolução</DialogTitle>
        </DialogHeader>
        <ExchangeForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
