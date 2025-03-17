// src/components/books/book-form.tsx

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
import { SerializedBook } from "@/types";

const formSchema = z.object({
  codFle: z.string().min(1, "Código FLE é obrigatório"),
  barCode: z.string().optional(),
  location: z.string().min(1, "Local é obrigatório"),
  quantity: z.coerce.number().min(0, "Quantidade deve ser maior ou igual a 0"),
  coverPrice: z.coerce.number().min(0, "Preço deve ser maior ou igual a 0"),
  price: z.coerce.number().min(0, "Preço deve ser maior ou igual a 0"),
  title: z.string().min(1, "Título é obrigatório"),
  author: z.string().min(1, "Autor é obrigatório"),
  medium: z.string().min(1, "Médium é obrigatório"),
  publisher: z.string().min(1, "Editora é obrigatória"),
  distributor: z.string().min(1, "Distribuidor é obrigatório"),
  subject: z.string().min(1, "Assunto é obrigatório"),
});

type FormValues = z.infer<typeof formSchema>;

interface BookFormProps {
  initialData?: SerializedBook;
  onSuccess?: () => void;
}

export function BookForm({ initialData, onSuccess }: BookFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const defaultValues = initialData
    ? {
        codFle: initialData.codFle,
        barCode: initialData.barCode || "",
        location: initialData.location,
        quantity: initialData.quantity,
        coverPrice: Number(initialData.coverPrice),
        price: Number(initialData.price),
        title: initialData.title,
        author: initialData.author,
        medium: initialData.medium,
        publisher: initialData.publisher,
        subject: initialData.subject,
      }
    : {
        codFle: "",
        barCode: "",
        location: "",
        quantity: 0,
        coverPrice: 0,
        price: 0,
        title: "",
        author: "",
        medium: "",
        publisher: "",
        subject: "",
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/books/${initialData.id}`, {
          ...values,
          coverPrice: values.coverPrice.toString(),
          price: values.price.toString(), // Convertendo de volta para string para o Prisma
        });
      } else {
        await axios.post("/api/books", {
          ...values,
          coverPrice: values.coverPrice.toString(),
          price: values.price.toString(), // Convertendo de volta para string para o Prisma
        });
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
        {/* Primeira linha */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="codFle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código FLE</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="barCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de Barras</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Opcional" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Segunda linha */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="coverPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço Feira</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço Capa</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Local</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Terceira linha */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Autor</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Quarta linha */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="medium"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Médium</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="publisher"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Editora</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="distributor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distribuidor</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assunto</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
