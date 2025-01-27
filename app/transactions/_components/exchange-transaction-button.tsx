// src/app/transactions/_components/exchange-transaction-button.tsx
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

export function ExchangeTransactionButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <RepeatIcon className="mr-2 h-4 w-4" />
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
