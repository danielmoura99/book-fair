"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { EditTransactionForm } from "./edit-transaction-form";
import { SerializedTransaction } from "@/types";
import { useState } from "react";

interface EditTransactionButtonProps {
  transaction: SerializedTransaction;
}

export function EditTransactionButton({
  transaction,
}: EditTransactionButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Venda</DialogTitle>
        </DialogHeader>
        <EditTransactionForm
          transaction={transaction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
