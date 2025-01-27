"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { useState } from "react";
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

const withdrawalSchema = z.object({
  amount: z.coerce.number().min(0, "O valor não pode ser negativo"),
  reason: z.string().min(1, "O motivo é obrigatório"),
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

interface WithdrawalFormProps {
  registerId: string;
  onSuccess?: () => void;
}

export function WithdrawalForm({ registerId, onSuccess }: WithdrawalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      reason: "",
    },
  });

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
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Processando..." : "Confirmar Retirada"}
        </Button>
      </form>
    </Form>
  );
}
