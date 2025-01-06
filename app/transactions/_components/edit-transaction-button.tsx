"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Transaction, Book } from "@prisma/client";
import { Pencil } from "lucide-react";
import { TransactionForm } from "./transaction-form";
import { SerializedTransaction } from "@/types";
import { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TransactionWithBook extends Transaction {
  book: Book;
}

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
        <TransactionForm
          initialData={transaction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
