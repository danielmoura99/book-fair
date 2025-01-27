"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CashRegister } from "@prisma/client";
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
import { formatPrice } from "@/lib/utils";

const closeRegisterSchema = z.object({
  finalAmount: z.coerce.number().min(0, "O valor não pode ser negativo"),
  notes: z.string().optional(),
});

type CloseRegisterFormValues = z.infer<typeof closeRegisterSchema>;

interface CloseRegisterFormProps {
  register: CashRegister;
  expectedAmount: number;
  onSuccess?: () => void;
}

export function CloseRegisterForm({
  register,
  expectedAmount,
  onSuccess,
}: CloseRegisterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<CloseRegisterFormValues>({
    resolver: zodResolver(closeRegisterSchema),
    defaultValues: {
      finalAmount: expectedAmount,
      notes: "",
    },
  });

  const onSubmit = async (data: CloseRegisterFormValues) => {
    try {
      setLoading(true);
      await axios.patch(`/api/cash-register/${register.id}`, {
        ...data,
        finalAmount: data.finalAmount.toString(),
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
        <div className="text-sm space-y-2">
          <p>Valor inicial: {formatPrice(Number(register.initialAmount))}</p>
          <p>Valor esperado: {formatPrice(expectedAmount)}</p>
        </div>

        <FormField
          control={form.control}
          name="finalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Final em Caixa</FormLabel>
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
          {loading ? "Processando..." : "Fechar Caixa"}
        </Button>
      </form>
    </Form>
  );
}
