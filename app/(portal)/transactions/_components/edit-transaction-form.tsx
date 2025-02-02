"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PaymentMethodSelect } from "./payment-method-select";
import { SerializedTransaction } from "@/types";
import { useCashRegister } from "@/hooks/use-cash-register";

const formSchema = z.object({
  quantity: z.number().min(1, "A quantidade deve ser maior que zero"),
  paymentMethod: z.string().min(1, "Selecione uma forma de pagamento"),
});

interface EditTransactionFormProps {
  transaction: SerializedTransaction;
  onSuccess?: () => void;
}

export function EditTransactionForm({
  transaction,
  onSuccess,
}: EditTransactionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOpen: isCashRegisterOpen } = useCashRegister();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: transaction.quantity,
      paymentMethod: transaction.paymentMethod,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isCashRegisterOpen) {
      setError("O caixa precisa estar aberto para editar vendas");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Calcular o novo valor total baseado na quantidade
      const totalAmount = (
        values.quantity * transaction.book.coverPrice
      ).toString();

      await axios.patch(`/api/transactions/${transaction.id}`, {
        quantity: values.quantity,
        paymentMethod: values.paymentMethod,
        totalAmount,
        date: transaction.transactionDate,
      });

      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erro ao editar venda");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <h4 className="font-semibold">{transaction.book.title}</h4>
            <p className="text-sm text-muted-foreground">
              {transaction.book.codFle} - {transaction.book.author}
            </p>
            <p className="mt-1">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(transaction.book.coverPrice)}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm">Quantidade:</label>
            <Input
              type="number"
              min={1}
              {...form.register("quantity", { valueAsNumber: true })}
              className="w-20"
            />
          </div>

          <PaymentMethodSelect control={form.control} />

          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(form.watch("quantity") * transaction.book.coverPrice)}
            </span>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading || !isCashRegisterOpen}
        >
          {loading
            ? "Processando..."
            : !isCashRegisterOpen
            ? "Abra o caixa primeiro"
            : "Salvar Alterações"}
        </Button>
      </form>
    </Form>
  );
}
