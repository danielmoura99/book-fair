"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

const cashRegisterSchema = z.object({
  initialAmount: z.coerce
    .number()
    .min(0, "O valor inicial não pode ser negativo"),
  notes: z.string().optional(),
});

type CashRegisterFormValues = z.infer<typeof cashRegisterSchema>;

interface CashRegisterFormProps {
  onSuccess?: () => void;
}

export function CashRegisterForm({ onSuccess }: CashRegisterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<CashRegisterFormValues>({
    resolver: zodResolver(cashRegisterSchema),
    defaultValues: {
      initialAmount: 0,
      notes: "",
    },
  });

  const onSubmit = async (data: CashRegisterFormValues) => {
    try {
      setLoading(true);
      await axios.post("/api/cash-register", {
        ...data,
        initialAmount: data.initialAmount.toString(),
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
          name="initialAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Inicial</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Abrindo..." : "Abrir Caixa"}
        </Button>
      </form>
    </Form>
  );
}
