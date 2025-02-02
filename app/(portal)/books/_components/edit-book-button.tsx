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
import { BookForm } from "./book-form";
import { useState } from "react";
import { SerializedBook } from "@/types";

interface EditBookButtonProps {
  book: SerializedBook;
}

export function EditBookButton({ book }: EditBookButtonProps) {
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
          <DialogTitle>Editar Livro</DialogTitle>
        </DialogHeader>
        <BookForm initialData={book} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
