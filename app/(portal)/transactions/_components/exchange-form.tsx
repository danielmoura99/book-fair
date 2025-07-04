"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Book, TransactionType } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// Schema único flexível
const exchangeSchema = z.object({
  returnedBookId: z.string().min(1, "Selecione o livro a ser devolvido"),
  newBookId: z.string().optional(),
  paymentMethod: z.string().optional(),
});

interface ExchangeItem {
  returnedBook: Book;
  newBook?: Book;
  priceDifference: number;
}

interface ExchangeFormProps {
  mode: "TROCA" | "DEVOLUCAO";
  onSuccess?: () => void;
}

export function ExchangeForm({ mode, onSuccess }: ExchangeFormProps) {
  const [exchange, setExchange] = useState<ExchangeItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOperator, setCurrentOperator] = useState<string | null>(null);

  const router = useRouter();
  const queryClient = useQueryClient();

  // ✅ NOVO: Reset de estados quando o modo muda
  useEffect(() => {
    setExchange(null);
    setError(null);
    setLoading(false);
    form.reset();
  }, [mode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const operator = localStorage.getItem("lastOperator");
      setCurrentOperator(operator);
    }
  }, []);

  const { data: soldBooks } = useQuery<Book[]>({
    queryKey: ["soldBooks"],
    queryFn: async () => {
      const timestamp = Date.now();
      const response = await axios.get(`/api/books/sold?t=${timestamp}`);
      return response.data;
    },
  });

  const { data: allBooks } = useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      const response = await axios.get("/api/books");
      return response.data;
    },
    enabled: mode === "TROCA",
  });

  const form = useForm<z.infer<typeof exchangeSchema>>({
    resolver: zodResolver(exchangeSchema),
  });

  // ✅ NOVO: Função para resetar completamente o formulário
  const resetForm = () => {
    setExchange(null);
    setError(null);
    setLoading(false);
    form.reset();
  };

  const updateExchangeCalculation = (
    returnedBookId: string,
    newBookId?: string
  ) => {
    if (!soldBooks || !returnedBookId) return;

    const returnedBook = soldBooks.find((b) => b.id === returnedBookId);
    if (!returnedBook) return;

    if (mode === "DEVOLUCAO") {
      setExchange({
        returnedBook,
        priceDifference: -Number(returnedBook.coverPrice),
      });
      return;
    }

    if (!allBooks || !newBookId) return;
    const newBook = allBooks.find((b) => b.id === newBookId);

    if (returnedBook && newBook) {
      const priceDifference =
        Number(newBook.coverPrice) - Number(returnedBook.coverPrice);
      setExchange({ returnedBook, newBook, priceDifference });
    }
  };

  const handleExchange = async (values: z.infer<typeof exchangeSchema>) => {
    if (!exchange) return;

    if (!currentOperator) {
      setError(
        "Nenhum operador selecionado. Registre uma venda primeiro para definir o operador."
      );
      return;
    }

    if (mode === "TROCA" && !values.newBookId) {
      form.setError("newBookId", {
        type: "required",
        message: "Selecione o livro para troca",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = mode === "DEVOLUCAO" ? "/api/returns" : "/api/exchanges";

      const payload = {
        returnedBookId: values.returnedBookId,
        newBookId: values.newBookId,
        paymentMethod: values.paymentMethod,
        type: TransactionType.EXCHANGE,
        priceDifference: exchange.priceDifference,
        operatorName: currentOperator,
        mode: mode,
      };

      await axios.post(endpoint, payload);

      // ✅ NOVO: Invalidar queries para atualizar dados
      await queryClient.invalidateQueries({ queryKey: ["books"] });
      await queryClient.invalidateQueries({ queryKey: ["soldBooks"] });

      // ✅ NOVO: Refresh da página para atualizar caixa
      router.refresh();

      // ✅ NOVO: Reset completo do formulário
      resetForm();

      // ✅ NOVO: Chamar onSuccess após limpeza
      onSuccess?.();
    } catch (error) {
      console.error(error);
      setError("Erro ao processar operação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOVO: Cleanup no unmount
  useEffect(() => {
    return () => {
      resetForm();
    };
  }, []);

  if (!currentOperator) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Nenhum operador está selecionado. Para realizar{" "}
          {mode === "TROCA" ? "trocas" : "devoluções"}, é necessário ter um
          operador ativo. Registre uma venda primeiro para definir o operador.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleExchange)} className="space-y-6">
        <div className="bg-muted p-3 rounded-md">
          <p className="text-sm">
            <span className="font-medium">Operador:</span> {currentOperator}
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className={mode === "TROCA" ? "grid grid-cols-2 gap-4" : ""}>
          <FormField
            control={form.control}
            name="returnedBookId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {mode === "DEVOLUCAO"
                    ? "Livro para Devolução"
                    : "Livro Devolvido"}
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    updateExchangeCalculation(
                      value,
                      mode === "TROCA" ? form.getValues("newBookId") : undefined
                    );
                  }}
                  value={field.value || ""} // ✅ NOVO: Valor controlado
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o livro" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* ✅ CORRIGIDO: div com overflow nativo ao invés de ScrollArea */}
                    <div className="max-h-[200px] overflow-auto">
                      {soldBooks?.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.codFle} - {book.title}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {mode === "TROCA" && (
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
                    value={field.value || ""} // ✅ NOVO: Valor controlado
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o livro" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* ✅ CORRIGIDO: div com overflow nativo ao invés de ScrollArea */}
                      <div className="max-h-[200px] overflow-auto">
                        {allBooks?.map((book) => (
                          <SelectItem key={book.id} value={book.id}>
                            {book.codFle} - {book.title} -{" "}
                            {formatPrice(Number(book.coverPrice))}
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          )}
        </div>

        {exchange && (
          <div className="space-y-4">
            <div className="text-lg">
              <div>
                Livro devolvido:{" "}
                {formatPrice(Number(exchange.returnedBook.coverPrice))}
              </div>

              {mode === "TROCA" && exchange.newBook && (
                <div>
                  Livro escolhido:{" "}
                  {formatPrice(Number(exchange.newBook.coverPrice))}
                </div>
              )}

              <div className="font-semibold">
                {mode === "DEVOLUCAO" ? "Valor a devolver:" : "Diferença:"}{" "}
                <span className={mode === "DEVOLUCAO" ? "text-red-600" : ""}>
                  {formatPrice(Math.abs(exchange.priceDifference))}
                </span>
                {mode === "DEVOLUCAO" && (
                  <span className="text-sm text-muted-foreground ml-2">
                    (valor será devolvido ao cliente)
                  </span>
                )}
              </div>
            </div>

            {exchange.priceDifference > 0 && mode === "TROCA" && (
              <PaymentMethodSelect control={form.control} />
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading || !exchange}
        >
          {loading
            ? "Processando..."
            : mode === "DEVOLUCAO"
            ? "Confirmar Devolução"
            : "Confirmar Troca"}
        </Button>
      </form>
    </Form>
  );
}
