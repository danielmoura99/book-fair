/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionType } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Form, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { PaymentMethodSelect } from "./payment-method-select";
import { SoldBookSearch } from "./sold-book-search";
import { BookSearchList } from "./book-search-list";
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
  returnedBook: any; // Pode ser Book ou SerializedBook
  newBook?: any; // Pode ser Book ou SerializedBook
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

  // Não precisamos mais das queries antigas - os componentes otimizados fazem as buscas

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

  const handleReturnedBookSelect = (book: any) => {
    form.setValue("returnedBookId", book.id);

    if (mode === "DEVOLUCAO") {
      setExchange({
        returnedBook: book,
        priceDifference: -Number(book.coverPrice),
      });
      return;
    }

    // Para TROCA, manter o livro devolvido e recalcular se já há livro novo
    const newBookId = form.getValues("newBookId");
    if (newBookId && exchange?.newBook) {
      const priceDifference =
        Number(exchange.newBook.coverPrice) - Number(book.coverPrice);
      setExchange({
        returnedBook: book,
        newBook: exchange.newBook,
        priceDifference,
      });
    } else {
      // Apenas salvar o livro devolvido por enquanto
      setExchange({
        returnedBook: book,
        priceDifference: 0,
      });
    }
  };

  const handleNewBookSelect = (book: any) => {
    form.setValue("newBookId", book.id);

    if (exchange?.returnedBook) {
      const priceDifference =
        Number(book.coverPrice) - Number(exchange.returnedBook.coverPrice);
      setExchange({
        returnedBook: exchange.returnedBook,
        newBook: book,
        priceDifference,
      });
    } else {
      // Salvar apenas o livro novo por enquanto
      setExchange({
        returnedBook: null as any,
        newBook: book,
        priceDifference: 0,
      });
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

    if (mode === "TROCA" && !exchange?.newBook) {
      setError("Selecione o livro para troca");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = mode === "DEVOLUCAO" ? "/api/returns" : "/api/exchanges";

      const payload = {
        returnedBookId: exchange.returnedBook.id,
        newBookId: exchange.newBook?.id,
        paymentMethod: values.paymentMethod,
        type: TransactionType.EXCHANGE,
        priceDifference: exchange.priceDifference,
        operatorName: currentOperator,
        mode: mode,
      };

      await axios.post(endpoint, payload);

      // ✅ NOVO: Invalidar queries para atualizar dados
      await queryClient.invalidateQueries({ queryKey: ["books-search"] });
      await queryClient.invalidateQueries({ queryKey: ["sold-books-search"] });

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

        <div
          className={
            mode === "TROCA" ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : ""
          }
        >
          <div>
            <FormLabel className="text-sm font-medium">
              {mode === "DEVOLUCAO"
                ? "Livro para Devolução"
                : "Livro Devolvido"}
            </FormLabel>
            <div className="mt-2">
              <SoldBookSearch
                onSelectBook={handleReturnedBookSelect}
                placeholder={
                  mode === "DEVOLUCAO"
                    ? "Buscar livro para devolução..."
                    : "Buscar livro devolvido..."
                }
                disabled={loading}
              />
            </div>
          </div>

          {mode === "TROCA" && (
            <div>
              <FormLabel className="text-sm font-medium">
                Livro para Troca
              </FormLabel>
              <div className="mt-2">
                <BookSearchList
                  onSelectBook={handleNewBookSelect}
                  disabled={loading || !exchange?.returnedBook}
                />
              </div>
            </div>
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
