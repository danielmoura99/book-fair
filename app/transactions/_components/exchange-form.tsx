"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Book, TransactionType } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PaymentMethodSelect } from "./payment-method-select";
import { formatPrice } from "@/lib/utils";

const exchangeSchema = z.object({
  returnedBookId: z.string().min(1, "Selecione o livro a ser devolvido"),
  newBookId: z.string().min(1, "Selecione o livro para troca"),
  paymentMethod: z.string().optional(),
});

interface ExchangeItem {
  returnedBook: Book;
  newBook: Book;
  priceDifference: number;
}

export function ExchangeForm({ onSuccess }: { onSuccess?: () => void }) {
  const [exchange, setExchange] = useState<ExchangeItem | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: books } = useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      const response = await axios.get("/api/books");
      return response.data;
    },
  });

  const form = useForm<z.infer<typeof exchangeSchema>>({
    resolver: zodResolver(exchangeSchema),
  });

  const updateExchangeCalculation = (
    returnedBookId: string,
    newBookId: string
  ) => {
    if (!books || !returnedBookId || !newBookId) return;

    const returnedBook = books.find((b) => b.id === returnedBookId);
    const newBook = books.find((b) => b.id === newBookId);

    if (returnedBook && newBook) {
      const priceDifference =
        Number(newBook.coverPrice) - Number(returnedBook.coverPrice);
      setExchange({ returnedBook, newBook, priceDifference });
    }
  };

  const handleExchange = async (values: z.infer<typeof exchangeSchema>) => {
    if (!exchange) return;

    setLoading(true);
    try {
      await axios.post("/api/exchanges", {
        returnedBookId: values.returnedBookId,
        newBookId: values.newBookId,
        paymentMethod: values.paymentMethod,
        type: TransactionType.EXCHANGE,
        priceDifference: exchange.priceDifference,
      });

      onSuccess?.();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleExchange)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="returnedBookId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Livro Devolvido</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    updateExchangeCalculation(
                      value,
                      form.getValues("newBookId")
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o livro" />
                  </SelectTrigger>
                  <SelectContent>
                    {books?.map((book) => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.codFle} - {book.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newBookId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Livro para Troca</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    updateExchangeCalculation(
                      form.getValues("returnedBookId"),
                      value
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o livro" />
                  </SelectTrigger>
                  <SelectContent>
                    {books?.map((book) => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.codFle} - {book.title} -{" "}
                        {formatPrice(Number(book.coverPrice))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        {exchange && (
          <div className="space-y-4">
            <div className="text-lg">
              <div>
                Livro devolvido:{" "}
                {formatPrice(Number(exchange.returnedBook.coverPrice))}
              </div>
              <div>
                Livro escolhido:{" "}
                {formatPrice(Number(exchange.newBook.coverPrice))}
              </div>
              <div className="font-semibold">
                Diferença: {formatPrice(exchange.priceDifference)}
              </div>
            </div>

            {exchange.priceDifference > 0 && (
              <PaymentMethodSelect control={form.control} />
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading || !exchange}
        >
          {loading ? "Processando..." : "Confirmar Troca"}
        </Button>
      </form>
    </Form>
  );
}
