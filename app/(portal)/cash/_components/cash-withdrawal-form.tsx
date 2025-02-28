/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(portal)/cash/_components/cash-withdrawal-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const withdrawalSchema = z.object({
  amount: z.coerce.number().min(0, "O valor não pode ser negativo"),
  reason: z.string().min(1, "O motivo é obrigatório"),
  operatorName: z.string().min(1, "Selecione o operador"),
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

interface WithdrawalFormProps {
  registerId: string;
  onSuccess?: () => void;
}

export function WithdrawalForm({ registerId, onSuccess }: WithdrawalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lastOperator, setLastOperator] = useState<string | null>(null);

  // Buscar a lista de operadores
  const { data: operators } = useQuery({
    queryKey: ["operators"],
    queryFn: async () => {
      const response = await axios.get("/api/operators");
      return response.data;
    },
  });

  // Verificar se há um operador salvo no localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedOperator = localStorage.getItem("lastOperator");
      if (savedOperator) {
        setLastOperator(savedOperator);
      }
    }
  }, []);

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      reason: "",
      operatorName: lastOperator || "",
    },
  });

  // Atualizar o valor padrão do operador quando ele for carregado
  useEffect(() => {
    if (lastOperator) {
      form.setValue("operatorName", lastOperator);
    }
  }, [lastOperator, form]);

  const onSubmit = async (data: WithdrawalFormValues) => {
    try {
      setLoading(true);
      await axios.post(`/api/cash-register/${registerId}/withdrawal`, {
        ...data,
        amount: data.amount.toString(),
      });
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor da Retirada</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="operatorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operador da Retirada</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o operador" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {operators?.map((operator: any) => (
                    <SelectItem key={operator.id} value={operator.name}>
                      {operator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Processando..." : "Confirmar Retirada"}
        </Button>
      </form>
    </Form>
  );
}
