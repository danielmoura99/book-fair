"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Book, Transaction } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { SerializedTransaction } from "@/types";

const formSchema = z.object({
  bookId: z.string().min(1, "Selecione um livro"),
  quantity: z.coerce.number().min(1, "Quantidade deve ser maior que 0"),
  paymentMethod: z.string().min(1, "Selecione uma forma de pagamento"),
  date: z.string().min(1, "Data é obrigatória"),
});

type FormValues = z.infer<typeof formSchema>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TransactionWithBook extends Transaction {
  book: Book;
}

interface TransactionFormProps {
  initialData?: SerializedTransaction; // Mudamos de TransactionWithBook para SerializedTransaction
  onSuccess?: () => void;
}

const PAYMENT_METHODS = [
  { value: "CREDIT_CARD", label: "Cartão de Crédito" },
  { value: "DEBIT_CARD", label: "Cartão de Débito" },
  { value: "CASH", label: "Dinheiro" },
  { value: "PIX", label: "PIX" },
];

export function TransactionForm({
  initialData,
  onSuccess,
}: TransactionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { data: books } = useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      const response = await axios.get("/api/books");
      return response.data;
    },
  });

  const defaultValues = initialData
    ? {
        bookId: initialData.bookId,
        quantity: initialData.quantity,
        paymentMethod: initialData.paymentMethod,
        date: new Date(initialData.transactionDate).toISOString().split("T")[0],
      }
    : {
        bookId: "",
        quantity: 1,
        paymentMethod: "",
        date: new Date().toISOString().split("T")[0],
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const selectedBook = books?.find((book) => book.id === values.bookId);
      if (!selectedBook) return;

      const totalAmount = Number(selectedBook.coverPrice) * values.quantity;

      const localDate = new Date(values.date);
      const timezoneOffset = localDate.getTimezoneOffset() * 60000; // Converte para milissegundos
      const adjustedDate = new Date(localDate.getTime() + timezoneOffset);

      const data = {
        ...values,
        date: adjustedDate.toISOString(),
        totalAmount: totalAmount.toString(), // Convertendo para string para o Prisma
      };

      if (initialData) {
        await axios.patch(`/api/transactions/${initialData.id}`, data);
      } else {
        await axios.post("/api/transactions", data);
      }
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="bookId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Livro</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um livro" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {books?.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title} -{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(Number(book.coverPrice))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forma de Pagamento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Salvando..."
            : initialData
            ? "Salvar alterações"
            : "Criar"}
        </Button>
      </form>
    </Form>
  );
}
